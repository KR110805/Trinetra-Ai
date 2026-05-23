// ---------------------------------------------------------------------------
// Trinetra AI – Incident Summarizer
// Converts raw telemetry logs + incident into a compact structured summary.
// This is the ONLY thing sent to the AI model — never raw logs.
// ---------------------------------------------------------------------------

import type { Incident, TelemetryLog } from "../types"
import type { IncidentSummary } from "./types"

/**
 * Build a compact, structured summary from an incident and its associated
 * telemetry window. The summary is designed to give an AI model maximum
 * signal with minimum tokens.
 */
export function summarizeIncident(
  incident: Incident,
  recentLogs: TelemetryLog[],
  windowSec: number = 30
): IncidentSummary {
  const now = Date.now()
  const windowMs = windowSec * 1000
  const windowLogs = recentLogs.filter(l => now - l.timestamp.getTime() < windowMs)

  // Filter logs relevant to this incident
  const relevantLogs = windowLogs.filter(l => {
    if (incident.service === "openai-proxy") return l.service === "openai-proxy"
    if (incident.title.includes("Database")) {
      return l.service === "payment-service" || l.service === "order-service" || l.service === "user-service"
    }
    if (incident.title.includes("auth") || incident.title.includes("Auth")) {
      return l.service === "auth-service"
    }
    return l.path === incident.affectedRoute || l.service === incident.service
  })

  const failedLogs = relevantLogs.filter(l => l.statusCode >= 400)
  const latencies = relevantLogs.map(l => l.latencyMs)
  const sorted = [...latencies].sort((a, b) => a - b)

  // Status code distribution
  const statusDist: Record<number, number> = {}
  relevantLogs.forEach(l => {
    statusDist[l.statusCode] = (statusDist[l.statusCode] || 0) + 1
  })

  // Dominant error patterns (deduplicated)
  const errorSet = new Set<string>()
  failedLogs.forEach(l => {
    if (l.error) errorSet.add(l.error)
  })

  // Affected services and routes (deduplicated)
  const services = [...new Set(relevantLogs.map(l => l.service))]
  const routes = [...new Set(relevantLogs.map(l => l.path))]

  // Timeline description
  const firstLog = relevantLogs.length > 0 ? relevantLogs[0] : null
  const lastLog = relevantLogs.length > 0 ? relevantLogs[relevantLogs.length - 1] : null
  const timeline = firstLog && lastLog
    ? `${formatTime(firstLog.timestamp)} → ${formatTime(lastLog.timestamp)} (${windowSec}s window)`
    : `Last ${windowSec}s`

  // Classify incident type
  const incidentType = classifyIncidentType(incident)

  return {
    incidentId: incident.id,
    incidentType,
    severity: incident.severity,
    title: incident.title,
    affectedServices: services,
    affectedRoutes: routes,
    failureCount: failedLogs.length,
    totalRequests: relevantLogs.length,
    avgLatencyMs: latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0,
    p99LatencyMs: sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.99)] : 0,
    errorRate: relevantLogs.length > 0 ? parseFloat(((failedLogs.length / relevantLogs.length) * 100).toFixed(1)) : 0,
    timeWindowSec: windowSec,
    dominantErrorPatterns: [...errorSet].slice(0, 5),
    statusCodeDistribution: statusDist,
    timeline,
  }
}

function classifyIncidentType(incident: Incident): string {
  if (incident.title.includes("Database") || incident.title.includes("Connection Pool")) return "database_exhaustion"
  if (incident.title.includes("OpenAI")) return "upstream_provider_degradation"
  if (incident.title.includes("Latency")) return "latency_anomaly"
  if (incident.title.includes("5xx")) return "server_error_spike"
  if (incident.title.includes("auth") || incident.title.includes("Auth") || incident.title.includes("Failures")) return "authentication_failure"
  return "general_anomaly"
}

function formatTime(d: Date): string {
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`
}
