// ---------------------------------------------------------------------------
// Trinetra AI – Metrics Aggregation Engine
// Computes rolling-window metrics from raw telemetry logs.
// ---------------------------------------------------------------------------

import type { TelemetryLog, SystemMetrics, ChartDataPoint } from "./types"

/** Compute aggregate metrics from a window of logs */
export function computeMetrics(
  logs: TelemetryLog[],
  prevMetrics: SystemMetrics
): SystemMetrics {
  if (logs.length === 0) return prevMetrics

  // Consider only the most recent 60 seconds of logs
  const now = Date.now()
  const windowMs = 60_000
  const recent = logs.filter(l => now - l.timestamp.getTime() < windowMs)

  if (recent.length === 0) return prevMetrics

  const totalRequests = recent.length
  const errorCount = recent.filter(l => l.statusCode >= 400).length
  const avgLatency = Math.round(recent.reduce((s, l) => s + l.latencyMs, 0) / totalRequests)
  const errorRate = parseFloat(((errorCount / totalRequests) * 100).toFixed(2))

  // System health is inversely correlated with error rate and latency spikes
  let health = 100 - errorRate * 5
  if (avgLatency > 200) health -= (avgLatency - 200) * 0.05
  health = Math.max(0, Math.min(100, parseFloat(health.toFixed(2))))

  // Per-minute rate (extrapolate from window)
  const elapsedSec = Math.min((now - recent[0].timestamp.getTime()) / 1000, 60)
  const rpm = elapsedSec > 0 ? Math.round((totalRequests / elapsedSec) * 60) : totalRequests

  return {
    systemHealth: health,
    requestsPerMin: rpm,
    avgLatencyMs: avgLatency,
    errorRate,
    prevSystemHealth: prevMetrics.systemHealth,
    prevRequestsPerMin: prevMetrics.requestsPerMin,
    prevAvgLatencyMs: prevMetrics.avgLatencyMs,
    prevErrorRate: prevMetrics.errorRate,
  }
}

/** Format the current timestamp as HH:MM */
function timeLabel(): string {
  const d = new Date()
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`
}

/** Derive a new chart data point from recent logs */
export function deriveChartPoint(logs: TelemetryLog[]): ChartDataPoint {
  const now = Date.now()
  // Use last 5-second window for this data point
  const window = logs.filter(l => now - l.timestamp.getTime() < 5_000)

  const requests = window.length
  const errors = window.filter(l => l.statusCode >= 500).length
  const latencies = window.map(l => l.latencyMs)
  const avgLatency = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0
  const sorted = [...latencies].sort((a, b) => a - b)
  const p99 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.99)] : 0

  return {
    time: timeLabel(),
    latency: avgLatency,
    p99,
    requests,
    errors,
  }
}

/** Default initial metrics */
export const DEFAULT_METRICS: SystemMetrics = {
  systemHealth: 99.99,
  requestsPerMin: 14205,
  avgLatencyMs: 45,
  errorRate: 0.12,
  prevSystemHealth: 99.98,
  prevRequestsPerMin: 12800,
  prevAvgLatencyMs: 47,
  prevErrorRate: 0.16,
}
