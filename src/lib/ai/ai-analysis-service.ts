// ---------------------------------------------------------------------------
// Trinetra AI – Client-side AI Analysis Service
// Orchestrates: summarize → prompt → API call → parse → state update.
// Falls back to intelligent heuristic analysis when API is unavailable.
// ---------------------------------------------------------------------------

import type { Incident, TelemetryLog } from "../types"
import type { AIAnalysisResult, IncidentSummary } from "./types"
import { summarizeIncident } from "./incident-summarizer"
import { buildPrompt } from "./prompt-builder"
import { parseAIResponse } from "./response-parser"

/**
 * Analyze an incident using the full AI pipeline.
 * 1. Summarize incident context
 * 2. Build prompt
 * 3. Call /api/analyze endpoint
 * 4. Parse response
 *
 * Falls back to heuristic analysis if the API is unavailable.
 */
export async function analyzeIncident(
  incident: Incident,
  recentLogs: TelemetryLog[]
): Promise<AIAnalysisResult> {
  // Step 1: Summarize
  const summary = summarizeIncident(incident, recentLogs)

  // Step 2: Build prompt
  const messages = buildPrompt(summary)

  try {
    // Step 3: Call API route
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, incidentId: incident.id, severity: incident.severity }),
    })

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const data = await response.json()

    if (data.error || !data.content) {
      throw new Error(data.error || "Empty AI response")
    }

    // Step 4: Parse response
    return parseAIResponse(data.content, incident.id, incident.severity)

  } catch {
    // Fallback: intelligent heuristic analysis
    return generateHeuristicAnalysis(incident, summary)
  }
}

// ---------------------------------------------------------------------------
// Heuristic fallback — produces believable analysis without an API call
// ---------------------------------------------------------------------------

function generateHeuristicAnalysis(
  incident: Incident,
  summary: IncidentSummary
): AIAnalysisResult {
  const analysis = HEURISTIC_MAP[summary.incidentType] ?? HEURISTIC_MAP.general_anomaly

  return {
    incidentId: incident.id,
    rootCause: analysis.rootCause(summary),
    confidence: analysis.confidence(summary),
    impactAnalysis: analysis.impact(summary),
    affectedSystems: summary.affectedServices,
    recommendedFixes: analysis.fixes(summary),
    recoverySteps: analysis.recovery(summary),
    summary: analysis.summary(summary),
    severity: incident.severity,
    estimatedRecoveryTime: analysis.eta(summary),
    generatedAt: new Date(),
  }
}

interface HeuristicProfile {
  rootCause: (s: IncidentSummary) => string
  confidence: (s: IncidentSummary) => number
  impact: (s: IncidentSummary) => string
  fixes: (s: IncidentSummary) => string[]
  recovery: (s: IncidentSummary) => string[]
  summary: (s: IncidentSummary) => string
  eta: (s: IncidentSummary) => string
}

const HEURISTIC_MAP: Record<string, HeuristicProfile> = {
  database_exhaustion: {
    rootCause: (s) => `Connection pool saturation on the primary database cluster. ${s.failureCount} requests failed with connection errors in ${s.timeWindowSec}s. Active connections likely reached the max_connections limit, causing new requests to queue indefinitely until timeout. This is typically caused by long-running transactions, connection leaks in the ORM layer, or a sudden traffic increase without corresponding pool scaling.`,
    confidence: (s) => Math.min(96, 80 + Math.floor(s.errorRate / 5)),
    impact: (s) => `All database-dependent services are affected: ${s.affectedServices.join(", ")}. ${s.errorRate}% of requests are failing. User-facing operations (checkout, order placement, account management) are severely degraded.`,
    fixes: () => [
      "Increase connection pool max_connections from 100 to 200 on pg-cluster-prod",
      "Deploy PgBouncer as a connection multiplexer to reduce per-service connection overhead",
      "Identify and terminate long-running idle transactions: SELECT pg_terminate_backend(pid) for idle-in-transaction > 60s",
      "Add connection pool health checks with 5s timeout intervals",
    ],
    recovery: () => [
      "Immediately restart payment-service pods to release stale connections",
      "Scale pg-cluster-prod replicas to distribute read load",
      "Enable connection pool metrics in Datadog for ongoing monitoring",
      "Run VACUUM ANALYZE on high-traffic tables after recovery",
    ],
    summary: (s) => `Database connection pool exhaustion causing ${s.errorRate}% error rate across ${s.affectedServices.length} services`,
    eta: () => "5-10 minutes with immediate pool scaling",
  },

  upstream_provider_degradation: {
    rootCause: (s) => `OpenAI API upstream degradation detected. ${s.failureCount} failed requests with avg latency ${s.avgLatencyMs}ms (p99: ${s.p99LatencyMs}ms). Error patterns indicate rate limiting (429) and service unavailability (503). This is an external dependency issue — the provider's API is experiencing capacity constraints or is in a degraded state.`,
    confidence: (s) => Math.min(95, 75 + Math.floor(s.failureCount * 2)),
    impact: (s) => `AI-powered features (completions, embeddings, analysis) are non-functional. ${s.failureCount} API calls failed in the last ${s.timeWindowSec}s. User-facing AI features will show errors or timeouts.`,
    fixes: () => [
      "Enable circuit breaker on openai-proxy with 50% failure threshold and 30s recovery window",
      "Activate fallback to secondary model provider (Anthropic Claude or self-hosted Llama)",
      "Implement response caching for repeated/similar prompts with 5min TTL",
      "Add exponential backoff with jitter: base=1s, max=30s, factor=2",
    ],
    recovery: () => [
      "Check OpenAI status page (status.openai.com) for ongoing incidents",
      "Switch traffic to fallback model if degradation persists > 5 minutes",
      "Drain request queue and reject new requests with 503 + retry-after header",
      "Re-enable primary provider once status.openai.com shows resolution",
    ],
    summary: (s) => `OpenAI API degraded — ${s.failureCount} failures, ${s.avgLatencyMs}ms avg latency`,
    eta: () => "External dependency — monitor provider status (typically 10-30 minutes)",
  },

  latency_anomaly: {
    rootCause: (s) => `Sustained latency anomaly across ${s.affectedServices.join(", ")}. Average response time elevated to ${s.avgLatencyMs}ms (p99: ${s.p99LatencyMs}ms). This pattern is consistent with resource contention — likely CPU throttling, GC pressure, or a slow downstream dependency creating backpressure across the service mesh.`,
    confidence: (s) => Math.min(90, 65 + Math.floor(s.avgLatencyMs / 100)),
    impact: (s) => `User experience degraded across ${s.affectedRoutes.length} endpoints. Response times are ${Math.round(s.avgLatencyMs / 50)}x above baseline. SLA breach risk is elevated.`,
    fixes: () => [
      "Profile service for CPU/memory bottlenecks — check container resource limits",
      "Review slow query log for N+1 patterns or missing indexes",
      "Scale horizontally — increase replica count by 50%",
      "Enable request timeout of 5s with circuit breaker fallback",
    ],
    recovery: () => [
      "Identify the slowest downstream dependency and isolate",
      "Deploy with increased CPU/memory limits temporarily",
      "Enable performance profiling (continuous profiler) for root cause confirmation",
      "Roll back recent deployment if latency increase correlates with release",
    ],
    summary: (s) => `Latency spike — ${s.avgLatencyMs}ms avg across ${s.affectedServices.length} services`,
    eta: () => "10-15 minutes with horizontal scaling",
  },

  server_error_spike: {
    rootCause: (s) => `Server error spike detected: ${s.failureCount} 5xx responses in ${s.timeWindowSec}s (${s.errorRate}% error rate). Status distribution: ${Object.entries(s.statusCodeDistribution).filter(([c]) => parseInt(c) >= 500).map(([c, n]) => `${c}:${n}`).join(", ")}. Most likely cause is a recent deployment introducing a crash loop, unhandled exception, or resource exhaustion (OOM).`,
    confidence: (s) => Math.min(92, 70 + Math.floor(s.failureCount)),
    impact: (s) => `${s.affectedRoutes.join(", ")} returning 5xx errors. ${s.errorRate}% of requests failing. Direct revenue and user experience impact.`,
    fixes: () => [
      "Check deployment history — correlate error spike with recent releases",
      "Review application logs for unhandled exceptions or panic traces",
      "Increase memory limits if OOMKilled events are present in pod status",
      "Enable graceful degradation with feature flags for affected code paths",
    ],
    recovery: () => [
      "Rollback to previous stable release immediately",
      "Restart affected service pods to clear corrupted state",
      "Verify health check endpoints are returning 200",
      "Post-mortem: add integration tests for the failing code path",
    ],
    summary: (s) => `5xx error spike — ${s.errorRate}% error rate on ${s.affectedRoutes[0] || "multiple routes"}`,
    eta: () => "5-15 minutes with rollback, longer with hotfix",
  },

  authentication_failure: {
    rootCause: (s) => `Authentication failure spike on auth-service: ${s.failureCount} auth errors in ${s.timeWindowSec}s. Error patterns: ${s.dominantErrorPatterns.slice(0, 2).join("; ") || "401/403 responses"}. This typically indicates JWT signing key rotation issues, token expiry misconfiguration, or an upstream identity provider outage.`,
    confidence: (s) => Math.min(91, 68 + Math.floor(s.failureCount * 1.5)),
    impact: (s) => `All authenticated endpoints are affected. Users cannot log in, and existing sessions may be invalidated. ${s.failureCount} auth requests failed.`,
    fixes: () => [
      "Verify JWT signing key — ensure both old and new keys are accepted during rotation",
      "Check token expiry configuration — increase access_token_ttl if too aggressive",
      "Validate JWKS endpoint is reachable and returning correct key set",
      "Review CORS configuration if auth failures originate from browser clients",
    ],
    recovery: () => [
      "Revert JWT signing key to previous known-good key",
      "Restart auth-service to reload key configuration",
      "Issue forced token refresh for all active sessions",
      "Monitor auth success rate until it returns to baseline (>99.5%)",
    ],
    summary: (s) => `Auth failure spike — ${s.failureCount} failures in ${s.timeWindowSec}s`,
    eta: () => "5-10 minutes with key revert",
  },

  general_anomaly: {
    rootCause: (s) => `Anomaly detected on ${s.affectedServices.join(", ")}: ${s.failureCount} failures at ${s.errorRate}% error rate. Average latency: ${s.avgLatencyMs}ms. Further investigation needed to isolate root cause.`,
    confidence: () => 65,
    impact: (s) => `${s.affectedRoutes.length} endpoints affected with ${s.errorRate}% error rate.`,
    fixes: () => [
      "Investigate service logs for error patterns",
      "Check for recent configuration changes",
      "Review infrastructure metrics (CPU, memory, network)",
    ],
    recovery: () => [
      "Increase logging verbosity for affected services",
      "Monitor metrics closely for pattern evolution",
      "Prepare rollback plan if situation escalates",
    ],
    summary: (s) => `Anomaly detected — ${s.errorRate}% error rate across ${s.affectedServices.length} services`,
    eta: () => "15-30 minutes (requires investigation)",
  },
}
