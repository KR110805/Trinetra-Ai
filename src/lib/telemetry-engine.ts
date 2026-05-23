// ---------------------------------------------------------------------------
// Trinetra AI – Telemetry Simulator Engine
// Generates realistic API traffic with probabilistic failure injection.
// ---------------------------------------------------------------------------

import type { TelemetryLog, FailureScenario } from "./types"

// Route definitions with per-route baseline characteristics
const ROUTES = [
  { path: "/api/v1/users",               method: "GET"    as const, service: "user-service",    baseLatency: 25,  weight: 20 },
  { path: "/api/v1/users",               method: "POST"   as const, service: "user-service",    baseLatency: 45,  weight: 8 },
  { path: "/api/v1/checkout/process",     method: "POST"   as const, service: "payment-service", baseLatency: 120, weight: 12 },
  { path: "/api/v2/generate/completion",  method: "POST"   as const, service: "openai-proxy",    baseLatency: 800, weight: 15 },
  { path: "/api/v1/auth/verify",          method: "POST"   as const, service: "auth-service",    baseLatency: 15,  weight: 18 },
  { path: "/api/v1/auth/refresh",         method: "POST"   as const, service: "auth-service",    baseLatency: 20,  weight: 6 },
  { path: "/api/v1/products",             method: "GET"    as const, service: "catalog-service", baseLatency: 35,  weight: 14 },
  { path: "/api/v1/orders",              method: "GET"    as const, service: "order-service",   baseLatency: 55,  weight: 10 },
  { path: "/api/v1/orders",              method: "POST"   as const, service: "order-service",   baseLatency: 90,  weight: 5 },
  { path: "/healthz",                     method: "GET"    as const, service: "gateway",         baseLatency: 2,   weight: 25 },
  { path: "/api/v1/analytics/events",     method: "POST"   as const, service: "analytics",       baseLatency: 30,  weight: 10 },
  { path: "/api/v1/notifications/send",   method: "POST"   as const, service: "notification",    baseLatency: 60,  weight: 4 },
]

// Error messages keyed by failure scenario
const ERROR_MESSAGES: Record<string, string[]> = {
  database:  ["ECONNREFUSED: Connection refused to pg-cluster-prod:5432", "Connection pool exhausted (100/100 connections active)", "Query timeout after 30000ms on pg-cluster-prod"],
  openai:    ["OpenAI API: 429 Rate limit exceeded", "OpenAI API: 503 Service temporarily unavailable", "OpenAI API: Timeout after 60000ms"],
  traffic:   ["Upstream service overloaded", "Circuit breaker OPEN for downstream service"],
  auth:      ["JWT signature verification failed", "Token expired: refresh required", "Invalid API key"],
}

let idCounter = 0

/** Pick a route using weighted random selection */
function pickRoute() {
  const totalWeight = ROUTES.reduce((s, r) => s + r.weight, 0)
  let rand = Math.random() * totalWeight
  for (const route of ROUTES) {
    rand -= route.weight
    if (rand <= 0) return route
  }
  return ROUTES[0]
}

/** Generate a single telemetry log entry */
export function generateLog(activeFailures: Set<FailureScenario>): TelemetryLog {
  const route = pickRoute()
  const now = new Date()
  let statusCode = 200
  let latencyMs = route.baseLatency + Math.floor(Math.random() * route.baseLatency * 0.5)
  let error: string | undefined

  // ── Database failure ──────────────────────────────────────────────────
  if (activeFailures.has("database") && (route.service === "payment-service" || route.service === "order-service" || route.service === "user-service")) {
    if (Math.random() < 0.7) {
      statusCode = Math.random() < 0.5 ? 500 : 503
      latencyMs = 2000 + Math.floor(Math.random() * 5000)
      error = ERROR_MESSAGES.database[Math.floor(Math.random() * ERROR_MESSAGES.database.length)]
    }
  }

  // ── OpenAI failure ────────────────────────────────────────────────────
  if (activeFailures.has("openai") && route.service === "openai-proxy") {
    if (Math.random() < 0.8) {
      statusCode = Math.random() < 0.5 ? 429 : 503
      latencyMs = 5000 + Math.floor(Math.random() * 55000)
      error = ERROR_MESSAGES.openai[Math.floor(Math.random() * ERROR_MESSAGES.openai.length)]
    }
  }

  // ── Traffic spike ─────────────────────────────────────────────────────
  if (activeFailures.has("traffic")) {
    latencyMs = Math.floor(latencyMs * (2 + Math.random() * 3))
    if (Math.random() < 0.3) {
      statusCode = 502
      error = ERROR_MESSAGES.traffic[Math.floor(Math.random() * ERROR_MESSAGES.traffic.length)]
    }
  }

  // ── Auth failure ──────────────────────────────────────────────────────
  if (activeFailures.has("auth") && route.service === "auth-service") {
    if (Math.random() < 0.6) {
      statusCode = Math.random() < 0.5 ? 401 : 403
      latencyMs = 5 + Math.floor(Math.random() * 10)
      error = ERROR_MESSAGES.auth[Math.floor(Math.random() * ERROR_MESSAGES.auth.length)]
    }
  }

  // ── Baseline noise (no active failure) ────────────────────────────────
  if (activeFailures.size === 0 && Math.random() < 0.03) {
    statusCode = [400, 401, 404, 500][Math.floor(Math.random() * 4)]
    if (statusCode >= 500) {
      latencyMs += 500 + Math.floor(Math.random() * 1000)
    }
  }

  return {
    id: `log-${++idCounter}-${now.getTime()}`,
    timestamp: now,
    method: route.method,
    path: route.path,
    statusCode,
    latencyMs,
    service: route.service,
    error,
  }
}

/** Generate a batch of N logs at once (for initial seeding) */
export function generateBatch(count: number, activeFailures: Set<FailureScenario>): TelemetryLog[] {
  return Array.from({ length: count }, () => generateLog(activeFailures))
}
