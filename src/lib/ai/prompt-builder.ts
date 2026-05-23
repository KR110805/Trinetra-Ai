// ---------------------------------------------------------------------------
// Trinetra AI – Prompt Builder
// Constructs structured OpenAI prompts from incident summaries.
// Uses incident-type–aware reasoning for tailored analysis.
// ---------------------------------------------------------------------------

import type { IncidentSummary } from "./types"

/** System prompt for the Trinetra SRE persona */
const SYSTEM_PROMPT = `You are Trinetra, an autonomous AI Site Reliability Engineer. You analyze production incidents with precision and urgency.

RULES:
- Be concise, technical, and DevOps-oriented. No filler. No ChatGPT-style politeness.
- Speak like a senior SRE writing a Slack message to the on-call team during an outage.
- Every recommendation must be actionable and specific.
- Confidence scores reflect how certain you are of the root cause. Base them on the evidence provided.
- Always respond in valid JSON matching the schema provided.`

/** Incident-type–specific context injected into the prompt */
const TYPE_CONTEXT: Record<string, string> = {
  database_exhaustion: `This is a DATABASE incident. Think about: connection pool sizing, long-running queries locking connections, ORM connection leaks, PgBouncer configuration, replica lag causing retry storms, max_connections in postgresql.conf.`,

  upstream_provider_degradation: `This is an UPSTREAM PROVIDER incident (OpenAI API). Think about: rate limiting (429s), provider outages, timeout configuration, retry policies with exponential backoff, fallback models (e.g., switching to a cheaper/faster model), request queuing, circuit breaker patterns.`,

  latency_anomaly: `This is a LATENCY incident. Think about: garbage collection pauses, CPU throttling in Kubernetes, noisy neighbor issues, slow downstream dependencies, connection pool wait times, missing database indexes, N+1 query patterns.`,

  server_error_spike: `This is a SERVER ERROR SPIKE. Think about: recent deployments introducing bugs, memory leaks causing OOM kills, misconfigured env vars, dependency version mismatches, panic/exception propagation, circuit breakers not triggering.`,

  authentication_failure: `This is an AUTHENTICATION FAILURE incident. Think about: JWT signing key rotation, expired certificates, misconfigured CORS/CSRF, API key revocation, OAuth token expiry, clock skew between services, rate limiting on auth endpoints.`,

  general_anomaly: `This is a general anomaly. Analyze the error patterns and status code distribution to determine the most likely root cause.`,
}

/**
 * Build the messages array for the OpenAI Chat Completion API.
 */
export function buildPrompt(summary: IncidentSummary): { role: string; content: string }[] {
  const typeContext = TYPE_CONTEXT[summary.incidentType] || TYPE_CONTEXT.general_anomaly

  const userPrompt = `INCIDENT ANALYSIS REQUEST

${typeContext}

INCIDENT DATA:
- ID: ${summary.incidentId}
- Type: ${summary.incidentType}
- Title: ${summary.title}
- Severity: ${summary.severity}
- Time Window: ${summary.timeline}

TELEMETRY:
- Total Requests: ${summary.totalRequests}
- Failed Requests: ${summary.failureCount}
- Error Rate: ${summary.errorRate}%
- Avg Latency: ${summary.avgLatencyMs}ms
- p99 Latency: ${summary.p99LatencyMs}ms

AFFECTED SYSTEMS:
- Services: ${summary.affectedServices.join(", ")}
- Routes: ${summary.affectedRoutes.join(", ")}

STATUS CODE DISTRIBUTION:
${Object.entries(summary.statusCodeDistribution).map(([code, count]) => `  ${code}: ${count} requests`).join("\n")}

ERROR PATTERNS:
${summary.dominantErrorPatterns.length > 0 ? summary.dominantErrorPatterns.map(e => `  - ${e}`).join("\n") : "  No specific error messages captured."}

Respond with a JSON object:
{
  "rootCause": "One-paragraph root cause analysis (2-3 sentences max)",
  "confidence": <number 0-100>,
  "impactAnalysis": "What is breaking and who is affected (1-2 sentences)",
  "affectedSystems": ["list", "of", "affected", "subsystems"],
  "recommendedFixes": ["fix1", "fix2", "fix3"],
  "recoverySteps": ["step1", "step2", "step3"],
  "summary": "One-line incident summary for the ops channel",
  "estimatedRecoveryTime": "e.g. '5-10 minutes'"
}`

  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ]
}
