// ---------------------------------------------------------------------------
// Trinetra AI – Incident Detection Engine
// Autonomous anomaly detection that creates, escalates, and resolves incidents
// based on patterns observed in the telemetry stream.
// ---------------------------------------------------------------------------

import type { TelemetryLog, Incident, Severity, IncidentStatus } from "./types"

let incCounter = 9000

function nextId(): string {
  return `INC-${++incCounter}`
}

function isAiService(service: string): boolean {
  const s = service.toLowerCase()
  return s.includes("openai") || s.includes("gemini") || s.includes("ai-") || s.includes("llm") || s.includes("inference")
}

// ---------------------------------------------------------------------------
// Detection rules
// ---------------------------------------------------------------------------

interface DetectionRule {
  /** Human-readable name */
  name: string
  /** Which logs to consider */
  filter: (log: TelemetryLog) => boolean
  /** Returns true if the rule fires on the given window */
  detect: (filtered: TelemetryLog[], allLogs: TelemetryLog[]) => boolean
  /** Build incident metadata when rule fires */
  buildIncident: (filtered: TelemetryLog[]) => Omit<Incident, "id" | "createdAt" | "updatedAt" | "status">
}

const RULES: DetectionRule[] = [
  // ── 500-error spike ─────────────────────────────────────────────────
  {
    name: "5xx-spike",
    filter: (l) => l.statusCode >= 500,
    detect: (filtered, all) => {
      if (all.length < 5) return false
      const rate = filtered.length / all.length
      return rate > 0.15 && filtered.length >= 3
    },
    buildIncident: (filtered) => {
      // Find most-affected route
      const routeCounts: Record<string, number> = {}
      filtered.forEach(l => { routeCounts[l.path] = (routeCounts[l.path] || 0) + 1 })
      const topRoute = Object.entries(routeCounts).sort((a, b) => b[1] - a[1])[0]
      const topService = filtered.find(l => l.path === topRoute[0])?.service ?? "unknown"
      const errorSample = filtered.find(l => l.error)?.error ?? "Internal server error"

      return {
        title: `High 5xx Error Rate on ${topRoute[0]}`,
        description: `${filtered.length} server errors detected in the last 30s. Most affected: ${topRoute[0]} (${topRoute[1]} errors). Sample: ${errorSample}`,
        severity: filtered.length > 10 ? "critical" : "high",
        affectedRoute: topRoute[0],
        service: topService,
        rootCause: errorSample,
        confidence: Math.min(98, 70 + filtered.length * 2),
        recommendedFix: topService === "payment-service"
          ? "Scale database connection pool and check pg-cluster-prod health"
          : `Investigate ${topService} — check recent deployments and resource utilisation`,
      }
    },
  },

  // ── Latency spike ───────────────────────────────────────────────────
  {
    name: "latency-spike",
    filter: (l) => l.latencyMs > 500 && l.statusCode < 500,
    detect: (filtered, all) => {
      if (all.length < 5) return false
      return filtered.length >= 3 && (filtered.length / all.length) > 0.1
    },
    buildIncident: (filtered) => {
      const avgLat = Math.round(filtered.reduce((s, l) => s + l.latencyMs, 0) / filtered.length)
      const topService = filtered[0]?.service ?? "unknown"
      const topRoute = filtered[0]?.path ?? "/unknown"

      return {
        title: `Latency Spike — avg ${avgLat}ms on ${topService}`,
        description: `${filtered.length} requests with latency > 500ms detected. Average latency: ${avgLat}ms.`,
        severity: avgLat > 3000 ? "critical" : avgLat > 1000 ? "high" : "medium",
        affectedRoute: topRoute,
        service: topService,
        rootCause: isAiService(topService)
          ? "AI provider response times degraded — upstream provider issue"
          : `Elevated response times in ${topService} — possible resource contention`,
        confidence: Math.min(96, 65 + Math.floor(avgLat / 100)),
        recommendedFix: isAiService(topService)
          ? "Enable request queuing with exponential backoff; consider fallback model"
          : `Profile ${topService} for memory/CPU bottlenecks; consider horizontal scaling`,
      }
    },
  },

  // ── Repeated route failures ─────────────────────────────────────────
  {
    name: "route-failures",
    filter: (l) => l.statusCode >= 400,
    detect: (filtered) => {
      // Check if any single route has 5+ failures
      const routeCounts: Record<string, number> = {}
      filtered.forEach(l => { routeCounts[l.path] = (routeCounts[l.path] || 0) + 1 })
      return Object.values(routeCounts).some(c => c >= 5)
    },
    buildIncident: (filtered) => {
      const routeCounts: Record<string, number> = {}
      filtered.forEach(l => { routeCounts[l.path] = (routeCounts[l.path] || 0) + 1 })
      const topRoute = Object.entries(routeCounts).sort((a, b) => b[1] - a[1])[0]
      const sample = filtered.find(l => l.path === topRoute[0])
      const svc = sample?.service ?? "unknown"

      return {
        title: `Repeated Failures on ${topRoute[0]}`,
        description: `${topRoute[1]} failures on ${topRoute[0]} in the last 30s.`,
        severity: topRoute[1] > 15 ? "high" : "medium",
        affectedRoute: topRoute[0],
        service: svc,
        rootCause: sample?.error ?? `Persistent 4xx/5xx responses from ${svc}`,
        confidence: Math.min(92, 60 + topRoute[1] * 2),
        recommendedFix: svc === "auth-service"
          ? "Verify JWT signing key rotation and token expiry configuration"
          : `Review ${svc} error logs and recent configuration changes`,
      }
    },
  },

  // ── Database connection exhaustion ──────────────────────────────────
  {
    name: "db-connection-exhaustion",
    filter: (l) => l.error?.includes("Connection pool exhausted") === true || l.error?.includes("ECONNREFUSED") === true,
    detect: (filtered) => filtered.length >= 2,
    buildIncident: (filtered) => ({
      title: "Database Connection Pool Exhaustion",
      description: `${filtered.length} database connection failures detected. Connection pool on pg-cluster-prod appears saturated.`,
      severity: "critical",
      affectedRoute: filtered[0]?.path ?? "/api/v1/checkout/process",
      service: "payment-service",
      rootCause: "Database connection pool limit (100) reached on pg-cluster-prod, causing downstream request queuing",
      confidence: 94,
      recommendedFix: "Auto-scale connection pool limit; consider PgBouncer for connection multiplexing",
    }),
  },

  // ── AI provider issue ──────────────────────────────────────────
  {
    name: "ai-degradation",
    filter: (l) => isAiService(l.service) && l.statusCode >= 400,
    detect: (filtered) => filtered.length >= 2,
    buildIncident: (filtered) => {
      const avgLat = Math.round(filtered.reduce((s, l) => s + l.latencyMs, 0) / filtered.length)
      const topService = filtered[0]?.service ?? "llm-gateway"
      const providerLabel = topService.toLowerCase().includes("gemini") ? "Gemini" : "AI Provider"
      return {
        title: `${providerLabel} API Degradation`,
        description: `${filtered.length} ${providerLabel} API failures detected. Avg response time: ${avgLat}ms.`,
        severity: filtered.length > 5 ? "critical" : "high",
        affectedRoute: filtered[0]?.path ?? "/api/v2/generate/completion",
        service: topService,
        rootCause: filtered[0]?.error ?? `${providerLabel} upstream service degradation — rate limiting or outage`,
        confidence: Math.min(97, 75 + filtered.length * 3),
        recommendedFix: "Activate fallback to secondary model provider; enable response caching for repeated prompts",
      }
    },
  },
]

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run all detection rules against a window of logs.
 * Returns new incidents that should be created (deduplication is handled by
 * checking existing incident titles).
 */
export function detectAnomalies(
  recentLogs: TelemetryLog[],
  existingIncidents: Incident[]
): Incident[] {
  const now = new Date()
  // Use last 30 seconds of logs as the analysis window
  const windowMs = 30_000
  const windowLogs = recentLogs.filter(l => now.getTime() - l.timestamp.getTime() < windowMs)

  const newIncidents: Incident[] = []
  const activeIncidentTitles = new Set(
    existingIncidents.filter(i => i.status !== "resolved").map(i => i.title)
  )

  for (const rule of RULES) {
    const filtered = windowLogs.filter(rule.filter)
    if (rule.detect(filtered, windowLogs)) {
      const meta = rule.buildIncident(filtered)
      // Deduplicate: don't create if there's already an active incident with this title
      if (!activeIncidentTitles.has(meta.title)) {
        newIncidents.push({
          ...meta,
          id: nextId(),
          status: "investigating",
          createdAt: now,
          updatedAt: now,
        })
      }
    }
  }

  return newIncidents
}

/**
 * Progress incident statuses and auto-resolve when the underlying issue is no longer
 * present in the telemetry stream.
 */
export function progressIncidents(
  incidents: Incident[],
  recentLogs: TelemetryLog[]
): Incident[] {
  const now = new Date()
  const windowMs = 30_000
  const windowLogs = recentLogs.filter(l => now.getTime() - l.timestamp.getTime() < windowMs)

  return incidents.map(incident => {
    if (incident.status === "resolved") return incident

    // Check if the issue is still present
    const relevantErrors = windowLogs.filter(l => {
      if (isAiService(incident.service)) return isAiService(l.service) && l.statusCode >= 400
      if (incident.title.includes("5xx")) return l.statusCode >= 500
      if (incident.title.includes("Latency")) return l.latencyMs > 500
      if (incident.title.includes("Database")) return l.error?.includes("Connection pool") || l.error?.includes("ECONNREFUSED")
      return l.path === incident.affectedRoute && l.statusCode >= 400
    })

    const ageMs = now.getTime() - incident.createdAt.getTime()

    // Auto-progress status
    if (relevantErrors.length === 0 && ageMs > 15_000) {
      // Issue no longer detected → resolve
      return { ...incident, status: "resolved" as IncidentStatus, updatedAt: now, resolvedAt: now }
    }
    if (relevantErrors.length === 0 && ageMs > 8_000) {
      // Seems to be recovering
      return { ...incident, status: "monitoring" as IncidentStatus, updatedAt: now }
    }
    if (ageMs > 5_000 && incident.status === "investigating") {
      return { ...incident, status: "identified" as IncidentStatus, updatedAt: now }
    }

    return incident
  })
}
