"use client"
// ---------------------------------------------------------------------------
// Trinetra AI – Central Telemetry Store (React Context + Hooks)
// Single source of truth consumed by every dashboard component.
// ---------------------------------------------------------------------------

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import type { 
  TelemetryLog, 
  Incident, 
  SystemMetrics, 
  ChartDataPoint, 
  FailureScenario, 
  DemoScenarioKey, 
  RemediationAction,
  TimelineEvent, 
  ChatMessage 
} from "./types"
import { generateLog, generateBatch } from "./telemetry-engine"
import { computeMetrics, deriveChartPoint, DEFAULT_METRICS } from "./metrics-engine"
import { detectAnomalies, progressIncidents } from "./incident-engine"
import type { AIAnalysisState } from "./ai/types"
import { analyzeIncident } from "./ai/ai-analysis-service"

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------
interface TelemetryContextValue {
  logs: TelemetryLog[]
  incidents: Incident[]
  metrics: SystemMetrics
  chartData: ChartDataPoint[]
  activeFailures: Set<FailureScenario>
  activeIncidentCount: number
  latestInsight: Incident | null
  // Simulation controls
  simulateFailure: (scenario: FailureScenario) => void
  recoverSystem: () => void
  
  // AI Analysis
  aiState: AIAnalysisState
  triggerAnalysis: (incidentId: string) => Promise<void>
  
  // Investigation Command Center
  timelineEvents: TimelineEvent[]
  chatMessages: ChatMessage[]
  sendMessage: (content: string) => Promise<void>

  // Remediation & Guided Demo Scenarios
  activeScenario: DemoScenarioKey | null
  remediationActions: RemediationAction[]
  aiConfidenceScore: number
  triggerDemoScenario: (scenario: DemoScenarioKey) => void
  executeRemediation: (actionId: string) => Promise<void>
  clearActiveScenario: () => void

  // Demo Stability Banner
  showStabilizationBanner: boolean
  setShowStabilizationBanner: (show: boolean) => void

  // Navigation tab state
  activeTab: string
  setActiveTab: (tab: string) => void

  // Telemetry pipeline ingestion
  addExternalTelemetry: (log: any) => void

  // Connected Applications
  connectedApps: any[]
}

const TelemetryContext = createContext<TelemetryContextValue | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<TelemetryLog[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [metrics, setMetrics] = useState<SystemMetrics>(DEFAULT_METRICS)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const activeFailuresRef = useRef<Set<FailureScenario>>(new Set())
  const [activeFailures, setActiveFailures] = useState<Set<FailureScenario>>(new Set())
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{
    id: "welcome-msg",
    role: "assistant",
    content: "Trinetra AI SRE Copilot online. Telemetry stream is nominal. Use the scenario panel to inject faults.",
    timestamp: new Date()
  }])

  // Remediation & Guided Scenarios
  const [activeScenario, setActiveScenario] = useState<DemoScenarioKey | null>(null)
  const activeScenarioRef = useRef<DemoScenarioKey | null>(null)
  const [remediationActions, setRemediationActions] = useState<RemediationAction[]>([])
  const [aiConfidenceScore, setAiConfidenceScore] = useState<number>(99.5)
  const [showStabilizationBanner, setShowStabilizationBanner] = useState<boolean>(false)

  const [activeTab, setActiveTab] = useState<string>("overview")

  // Connected Applications State
  const [connectedApps, setConnectedApps] = useState<Record<string, any>>({
    "Nagrik AI": {
      name: "Nagrik AI",
      requests: 42,
      avgLatency: 320,
      status: "healthy",
      lastActive: new Date(),
      totalLatency: 42 * 320,
      errorCount5xx: 0,
      consecutive5xx: 0,
      message: "Streaming telemetry • nominal"
    }
  })

  // Keep a mutable ref to logs for the ticker so we don't close over stale state
  const logsRef = useRef<TelemetryLog[]>([])
  const incidentsRef = useRef<Incident[]>([])

  const [aiState, setAiState] = useState<AIAnalysisState>({
    status: "idle",
    currentIncidentId: null,
    result: null,
    error: null,
    lastAnalyzedAt: null,
    analysisHistory: [],
  })

  // ── Seed initial data ─────────────────────────────────────────────────
  useEffect(() => {
    const seed = generateBatch(20, activeFailuresRef.current)
    setLogs(seed)
    logsRef.current = seed

    setTimelineEvents([{
      id: "init",
      timestamp: new Date(),
      title: "Observability Stream Online",
      description: "Trinetra autonomous observability initialized. Nodes standard.",
      severity: "success"
    }])

    // Build initial chart data points
    const initialChart: ChartDataPoint[] = []
    for (let i = 9; i >= 0; i--) {
      const d = new Date()
      d.setMinutes(d.getMinutes() - i)
      initialChart.push({
        time: `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`,
        latency: 15 + Math.floor(Math.random() * 10),
        p99: 25 + Math.floor(Math.random() * 15),
        requests: 120 + Math.floor(Math.random() * 30),
        errors: 0,
      })
    }
    setChartData(initialChart)
  }, [])

  // ── Main simulation ticker (every 1.2s) ──────────────────────────────
  useEffect(() => {
    const tickInterval = setInterval(() => {
      // Generate 1-2 logs per tick, more if traffic spike active
      const count = 1 + Math.floor(Math.random() * (activeFailuresRef.current.has("traffic") ? 4 : 2))
      const newLogs: TelemetryLog[] = []
      for (let i = 0; i < count; i++) {
        const log = generateLog(activeFailuresRef.current)
        
        // DEMO STABILITY MODE: Override baseline noise when system is healthy
        // to keep health at a clean, flat, enterprise-grade 100%
        if (activeFailuresRef.current.size === 0) {
          log.statusCode = 200
          log.error = undefined
          if (log.path === "/api/v2/generate/completion") {
            log.latencyMs = 800 + Math.floor(Math.random() * 80)
          } else {
            log.latencyMs = 12 + Math.floor(Math.random() * 15)
          }
        }
        newLogs.push(log)
      }

      setLogs(prev => {
        const updated = [...prev, ...newLogs].slice(-200) // keep last 200
        logsRef.current = updated
        return updated
      })

      // Recompute metrics
      setMetrics(prev => computeMetrics(logsRef.current, prev))
    }, 1200)

    return () => clearInterval(tickInterval)
  }, [])

  // ── Chart data ticker (every 5s) ─────────────────────────────────────
  useEffect(() => {
    const chartInterval = setInterval(() => {
      const point = deriveChartPoint(logsRef.current)
      
      // Override chart point error counts when healthy
      if (activeFailuresRef.current.size === 0) {
        point.errors = 0
        point.latency = 12 + Math.floor(Math.random() * 5)
        point.p99 = 22 + Math.floor(Math.random() * 10)
      }
      setChartData(prev => [...prev, point].slice(-20))
    }, 5000)

    return () => clearInterval(chartInterval)
  }, [])

  // ── Anomaly detection ticker (every 3s) ──────────────────────────────
  useEffect(() => {
    const detectInterval = setInterval(() => {
      // Detect new anomalies
      const newIncidents = detectAnomalies(logsRef.current, incidentsRef.current)
      
      if (newIncidents.length > 0) {
        setIncidents(prev => {
          const updated = [...newIncidents, ...prev].slice(0, 20)
          incidentsRef.current = updated
          return updated
        })
        
        const newEvents: TimelineEvent[] = newIncidents.map(inc => ({
          id: `evt-new-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          timestamp: new Date(),
          title: "Anomaly Detected",
          description: inc.title,
          severity: inc.severity === "critical" ? "error" : "warning",
          incidentId: inc.id
        }))
        setTimelineEvents(prev => [...newEvents, ...prev].slice(0, 100))
      }

      // Progress existing incidents
      setIncidents(prev => {
        const progressed = progressIncidents(prev, logsRef.current)
        
        const newlyResolved = progressed.filter(p => p.status === "resolved" && !prev.find(old => old.id === p.id && old.status === "resolved"))
        if (newlyResolved.length > 0) {
            const recoveryEvents: TimelineEvent[] = newlyResolved.map(inc => ({
              id: `evt-rec-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              timestamp: new Date(),
              title: "System Stabilized",
              description: `Incident "${inc.title}" has been successfully resolved.`,
              severity: "success",
              incidentId: inc.id
            }))
            setTimelineEvents(oldEvts => [...recoveryEvents, ...oldEvts].slice(0, 100))
        }

        incidentsRef.current = progressed
        return progressed
      })
    }, 3000)

    return () => clearInterval(detectInterval)
  }, [])

  // Manage AI Confidence score based on state
  useEffect(() => {
    const hasActive = incidents.some(i => i.status !== "resolved")
    if (!hasActive) {
      setAiConfidenceScore(99.5)
      return
    }

    if (["summarizing", "analyzing", "generating"].includes(aiState.status)) {
      setAiConfidenceScore(76.8)
    } else if (aiState.status === "completed" && aiState.result) {
      setAiConfidenceScore(aiState.result.confidence)
    } else {
      setAiConfidenceScore(84.6)
    }
  }, [incidents, aiState])

  // ── Simulation controls ───────────────────────────────────────────────
  const simulateFailure = useCallback((scenario: FailureScenario) => {
    activeFailuresRef.current = new Set([...activeFailuresRef.current, scenario])
    setActiveFailures(new Set(activeFailuresRef.current))
    
    setTimelineEvents(prev => [{
      id: `sim-${Date.now()}`,
      timestamp: new Date(),
      title: "Fault Injected",
      description: `Injected telemetry fault: ${scenario}`,
      severity: "warning"
    }, ...prev])
  }, [])

  const recoverSystem = useCallback(() => {
    activeFailuresRef.current = new Set()
    setActiveFailures(new Set())
    setActiveScenario(null)
    activeScenarioRef.current = null
    setRemediationActions([])
    setShowStabilizationBanner(false)
    
    setIncidents(prev => prev.map(inc => 
      inc.status !== "resolved" 
        ? { ...inc, status: "resolved", resolvedAt: new Date(), updatedAt: new Date() }
        : inc
    ))

    setTimelineEvents(prev => [{
      id: `rec-${Date.now()}`,
      timestamp: new Date(),
      title: "System Recovered",
      description: "SRE manually triggered recovery. Active faults cleared.",
      severity: "success"
    }, ...prev])

    setMetrics(prev => ({
      ...prev,
      systemHealth: 99.9,
      errorRate: 0.00,
      avgLatencyMs: 14
    }))
  }, [])

  const triggerAnalysis = useCallback(async (incidentId: string) => {
    const incident = incidentsRef.current.find(i => i.id === incidentId)
    if (!incident) return

    setAiState(prev => ({
      ...prev,
      status: "summarizing",
      currentIncidentId: incidentId,
      error: null,
    }))

    await new Promise(resolve => setTimeout(resolve, 800))
    setAiState(prev => ({ ...prev, status: "analyzing" }))
    await new Promise(resolve => setTimeout(resolve, 800))
    setAiState(prev => ({ ...prev, status: "generating" }))

    try {
      const result = await analyzeIncident(incident, logsRef.current)
      setAiState(prev => ({
        ...prev,
        status: "completed",
        result,
        lastAnalyzedAt: new Date(),
        analysisHistory: [result, ...prev.analysisHistory].slice(0, 50)
      }))
    } catch (err: any) {
      setAiState(prev => ({
        ...prev,
        status: "failed",
        error: err.message || "Failed to analyze incident"
      }))
    }
  }, [])

  const addExternalTelemetry = useCallback((sdkLog: any) => {
    // Extract project name
    const projectName = sdkLog.projectName || sdkLog.data?.projectName || "External Application"
    const serviceName = sdkLog.data?.service || sdkLog.service || "external-service"

    // Update Connected Applications list dynamically
    if (sdkLog.type === "request" || sdkLog.type === "error" || sdkLog.type === undefined) {
      setConnectedApps(prev => {
        const app = prev[projectName] || {
          name: projectName,
          requests: 0,
          avgLatency: 0,
          status: "healthy",
          lastActive: new Date(),
          totalLatency: 0,
          errorCount5xx: 0,
          consecutive5xx: 0,
          message: "Streaming telemetry • nominal"
        }

        const newRequests = app.requests + 1
        
        let latency = 0
        let is5xx = false

        if (sdkLog.type === "error") {
          is5xx = true
        } else {
          latency = Number(sdkLog.data?.latency || sdkLog.data?.latencyMs || sdkLog.latencyMs || 0)
          const statusCode = Number(sdkLog.data?.status || sdkLog.data?.statusCode || sdkLog.statusCode || 200)
          if (statusCode >= 500) {
            is5xx = true
          }
        }

        const newTotalLatency = app.totalLatency + latency
        const newAvgLatency = Math.round(newTotalLatency / newRequests)
        const newConsecutive5xx = is5xx ? app.consecutive5xx + 1 : 0
        
        // Status Detection:
        // - repeated 5xx errors (consecutive5xx >= 3) -> critical
        // - high latency (latency > 500ms or newAvgLatency > 350ms) -> degraded
        // - otherwise healthy
        let newStatus: "healthy" | "degraded" | "critical" = "healthy"
        let msg = "Streaming telemetry • nominal"

        if (newConsecutive5xx >= 3) {
          newStatus = "critical"
          msg = `${serviceName} Incident Active`
        } else if (latency > 500 || newAvgLatency > 350) {
          newStatus = "degraded"
          msg = "Latency Elevated"
        }

        return {
          ...prev,
          [projectName]: {
            ...app,
            requests: newRequests,
            avgLatency: newAvgLatency,
            status: newStatus,
            lastActive: new Date(),
            totalLatency: newTotalLatency,
            errorCount5xx: is5xx ? app.errorCount5xx + 1 : app.errorCount5xx,
            consecutive5xx: newConsecutive5xx,
            message: msg
          }
        }
      })
    }

    if (sdkLog.type === "event") {
      const eventData = sdkLog.data || {}
      setTimelineEvents(prev => [{
        id: `evt-sdk-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        timestamp: eventData.timestamp ? new Date(eventData.timestamp) : new Date(),
        title: eventData.name || "External Event",
        description: eventData.description || "Operational event captured.",
        severity: (eventData.type === "recovery" ? "success" : eventData.type === "traffic_spike" ? "warning" : "info") as "error" | "success" | "info" | "warning"
      }, ...prev].slice(0, 100))
      return
    }

    // Handle standard request/error/metric telemetry packets
    let errorMsg = sdkLog.data?.error || sdkLog.data?.message || undefined
    let statusCode = Number(sdkLog.data?.status || sdkLog.data?.statusCode || 200)

    if (sdkLog.type === "error") {
      statusCode = 500
      errorMsg = sdkLog.data?.message || "SDK Captured Error"
    }

    const normalizedLog: TelemetryLog = {
      id: sdkLog.data?.id || `sdk-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: sdkLog.data?.timestamp ? new Date(sdkLog.data.timestamp) : new Date(),
      method: sdkLog.data?.method || "GET",
      path: sdkLog.data?.route || sdkLog.data?.path || "/api/v1/default",
      statusCode,
      latencyMs: Number(sdkLog.data?.latency || sdkLog.data?.latencyMs || 50),
      service: sdkLog.data?.service || sdkLog.projectName || "external-service",
      error: errorMsg
    }

    setLogs(prev => {
      const updated = [...prev, normalizedLog].slice(-200)
      logsRef.current = updated
      
      // Recalculate metrics
      setMetrics(oldMetrics => computeMetrics(updated, oldMetrics))

      // Trigger anomaly detection
      setIncidents(oldIncidents => {
        const detected = detectAnomalies(updated, oldIncidents)
        
        if (detected.length > 0) {
          // Add timeline events
          const newEvents: TimelineEvent[] = detected.map(inc => ({
            id: `evt-new-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            timestamp: new Date(),
            title: "Anomaly Detected",
            description: inc.title,
            severity: inc.severity === "critical" ? "error" : "warning",
            incidentId: inc.id
          }))
          setTimelineEvents(oldEvts => [...newEvents, ...oldEvts].slice(0, 100))
          
          // Trigger AI analysis automatically in next tick
          setTimeout(() => {
            triggerAnalysis(detected[0].id)
          }, 50)
        }

        const progressed = progressIncidents([...detected, ...oldIncidents], updated)
        incidentsRef.current = progressed
        return progressed
      })

      return updated
    })
  }, [triggerAnalysis])

  // ── Client-side SDK Telemetry Polling (every 1.5s) ──────────────────
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch("/api/telemetry")
        if (response.ok) {
          const newLogs = await response.json()
          if (Array.isArray(newLogs) && newLogs.length > 0) {
            newLogs.forEach(log => {
              addExternalTelemetry(log)
            })
          }
        }
      } catch (error) {
        // Fail silently
      }
    }, 1500)

    return () => clearInterval(pollInterval)
  }, [addExternalTelemetry])

  // ── Contextual Elite SRE Chat fallbacks (Demo Stability Mode) ─────────
  const getContextualSREAnswer = (content: string, scenario: DemoScenarioKey | null): string => {
    const query = content.toLowerCase()
    
    if (scenario === "database_exhaustion") {
      if (query.includes("cause") || query.includes("what caused")) {
        return "Postgres primary database cluster pool saturated (100/100 connections). High hold-time checkout queries failed to release hooks, queuing new transactions until gateway timeouts triggered."
      }
      if (query.includes("api") || query.includes("affected")) {
        return "Critical connection timeouts on /api/v1/checkout/process and /api/v1/orders. Direct catalog query lookups are also reporting elevated queues."
      }
      if (query.includes("prevent")) {
        return "Index high-frequency order lookups, scale database max_connections parameter to 200, and introduce PgBouncer sidecars to multiplex client connection queues."
      }
      if (query.includes("recovery") || query.includes("actions")) {
        return "Remediation deployed: updated Pg connection limits to 200 via Helm charts, terminated idle backend processes (>60s), and verified node latencies returned to nominal."
      }
      if (query.includes("latency")) {
        return "Database pool exhaustion forced application threads to block on checkout routes, ballooning response thresholds to 4200ms."
      }
    }

    if (scenario === "openai_meltdown") {
      if (query.includes("cause") || query.includes("what caused")) {
        return "Upstream model rate limits exceeded (HTTP 429). The primary proxy gateway held active sockets open for 30s before dropping with 503 Service Unavailable errors."
      }
      if (query.includes("api") || query.includes("affected")) {
        return "Outage confined to /api/v2/generate/completion. Downstream completions and embeddings features are completely unavailable."
      }
      if (query.includes("prevent")) {
        return "Set up automated routing failover to secondary model endpoints, implement Redis prompt-response caches (5m TTL), and enable gateway circuit breakers."
      }
      if (query.includes("recovery") || query.includes("actions")) {
        return "Remediation deployed: redirected completion paths to fallback endpoints. Latency recovered to 640ms baseline."
      }
      if (query.includes("latency")) {
        return "Upstream completions sockets hung due to AI provider capacity limits, causing the proxy client to block for 30s before timeout."
      }
    }

    if (scenario === "traffic_surge") {
      if (query.includes("cause") || query.includes("what caused")) {
        return "Ingress load surged 3.2x above baseline, exceeding API Gateway worker allocations. Downstream message queues fell behind, causing backpressure."
      }
      if (query.includes("api") || query.includes("affected")) {
        return "Elevated timeouts on /api/v1/orders. Unauthenticated analytics trackers are dropping with HTTP 502 Bad Gateway responses."
      }
      if (query.includes("prevent")) {
        return "Establish token-bucket rate limits at the gateway layer, scale queue replicas dynamically via Kubernetes HPA, and drop heavy analytics routes under load."
      }
      if (query.includes("recovery") || query.includes("actions")) {
        return "Remediation deployed: applied Kong rate-limit filters (1000req/min) and scaled queue consumer pods to 12 instances."
      }
      if (query.includes("latency")) {
        return "Worker thread pool exhaustion caused incoming socket buffering at the gateway, elevating API latency."
      }
    }

    if (scenario === "auth_storm") {
      if (query.includes("cause") || query.includes("what caused")) {
        return "JWT rotated keys mismatch. Rotated key configs failed to synchronize across identity cache nodes, rejecting signature validations."
      }
      if (query.includes("api") || query.includes("affected")) {
        return "Critical verification drops on /api/v1/auth/verify. All authenticated user endpoints are rejecting queries with HTTP 401 errors."
      }
      if (query.includes("prevent")) {
        return "Deploy local cache key store fallbacks on identity verification layers and align key-rotation workflows with deployment synchronization checks."
      }
      if (query.includes("recovery") || query.includes("actions")) {
        return "Remediation deployed: reverted JWT rotated configuration keys, rolled out auth pod restarts, and verified key signature parity."
      }
      if (query.includes("latency")) {
        return "System verification calls return fast (15ms) but fail immediately with signature mismatch validation errors."
      }
    }

    // Baseline fallback answers
    if (query.includes("status") || query.includes("system")) {
      return `Telemetry streams are ${activeScenario ? "degraded" : "healthy"}. AI confidence registers at ${aiConfidenceScore}%.`
    }
    return "Telemetry indicators normal. Monitor dashboard metrics or select a scenario control card to test remediation loops."
  }

  const sendMessage = useCallback(async (content: string) => {
    const userMsgId = `usr-${Date.now()}`
    const userMsg: ChatMessage = { id: userMsgId, role: "user", content, timestamp: new Date() }
    
    setChatMessages(prev => [...prev, userMsg])
    
    const asstMsgId = `ast-${Date.now()}`
    setChatMessages(prev => [...prev, {
      id: asstMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true
    }])

    let responseText = ""
    try {
      const activeIncident = incidentsRef.current.find(i => i.status !== "resolved")
      const chatContext = {
        activeIncident: activeIncident ? {
          id: activeIncident.id,
          title: activeIncident.title,
          service: activeIncident.service,
          affectedRoute: activeIncident.affectedRoute,
          severity: activeIncident.severity,
          rootCause: activeIncident.rootCause || "Under analysis",
          recommendedFix: activeIncident.recommendedFix || "Investigating logs",
        } : null,
        activeScenario: activeScenarioRef.current,
        recentLogsCount: logsRef.current.length,
        recentAnomalies: logsRef.current.filter(l => l.statusCode >= 400 || l.error).slice(-5).map(l => ({
          timestamp: l.timestamp,
          service: l.service,
          path: l.path,
          latencyMs: l.latencyMs,
          statusCode: l.statusCode,
          error: l.error
        })),
        metrics: {
          avgLatencyMs: metrics.avgLatencyMs,
          errorRate: metrics.errorRate,
          systemHealth: metrics.systemHealth
        }
      }

      // We send the current message list + the new message to get complete chat history
      // Keep it up to the last 10 messages to avoid large payloads
      const historyToSend = [...chatMessages, userMsg].slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }))

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyToSend,
          context: chatContext
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data && data.content) {
          responseText = data.content
        }
      }
    } catch (error) {
      console.warn("[TelemetryStore Chat Error] API failed, using fallback:", error)
    }

    // Fallback if API returned empty, failed, or was not configured
    if (!responseText) {
      await new Promise(resolve => setTimeout(resolve, 600))
      responseText = getContextualSREAnswer(content, activeScenarioRef.current)
    }

    setChatMessages(prev => prev.map(m => 
      m.id === asstMsgId 
        ? { ...m, content: responseText, isStreaming: false }
        : m
    ))
  }, [chatMessages, metrics, getContextualSREAnswer])

  // ── Guided Demo Scenarios ─────────────────────────────────────────────
  const triggerDemoScenario = useCallback((scenario: DemoScenarioKey) => {
    activeFailuresRef.current = new Set()
    setActiveFailures(new Set())
    
    setActiveScenario(scenario)
    activeScenarioRef.current = scenario
    setShowStabilizationBanner(false)

    let failureType: FailureScenario = "database"
    let title = ""
    let description = ""
    let serviceName = ""
    let routePath = ""
    let severity: "critical" | "high" = "critical"
    let confidence = 95
    let recommendedFix = ""

    if (scenario === "openai_meltdown") {
      failureType = "openai"
      title = "AI Provider API Degradation"
      description = "Critical: Upstream error rate spike (429/503) detected on llm-gateway. Latency exceeded 15s."
      serviceName = "llm-gateway"
      routePath = "/api/v2/generate/completion"
      severity = "critical"
      confidence = 96
      recommendedFix = "Activate Upstream AI Fallback Provider"
    } else if (scenario === "database_exhaustion") {
      failureType = "database"
      title = "Database Connection Pool Exhaustion"
      description = "Critical: Primary database connection pool pg-cluster-prod (100/100) is saturated."
      serviceName = "payment-service"
      routePath = "/api/v1/checkout/process"
      severity = "critical"
      confidence = 94
      recommendedFix = "Increase pg-cluster-prod DB connection pool size"
    } else if (scenario === "traffic_surge") {
      failureType = "traffic"
      title = "Traffic Surge & API Gateway Throttling"
      description = "High: Request volume spiked 3.2x above baseline, causing upstream queue overflow and timeouts."
      serviceName = "gateway"
      routePath = "/api/v1/orders"
      severity = "high"
      confidence = 91
      recommendedFix = "Activate Traffic Throttling on API Gateway"
    } else if (scenario === "auth_storm") {
      failureType = "auth"
      title = "Auth Service Storm & JWT Failures"
      description = "High: High volume of 401/403 authorization failures detected on user token verification."
      serviceName = "auth-service"
      routePath = "/api/v1/auth/verify"
      severity = "high"
      confidence = 92
      recommendedFix = "Rollback JWT Signing Configuration"
    }

    activeFailuresRef.current.add(failureType)
    setActiveFailures(new Set(activeFailuresRef.current))

    setTimelineEvents(prev => [
      {
        id: `scen-init-${Date.now()}`,
        timestamp: new Date(),
        title: "Incident Initiated",
        description: `Alert triggered. Injected outage scenario: ${title}`,
        severity: "warning"
      },
      ...prev
    ])

    const newLogs: TelemetryLog[] = []
    const now = new Date()
    
    if (scenario === "openai_meltdown") {
      for (let i = 0; i < 15; i++) {
        newLogs.push({
          id: `log-inj-${Date.now()}-${i}`,
          timestamp: new Date(now.getTime() - (15 - i) * 1000),
          method: "POST",
          path: "/api/v2/generate/completion",
          statusCode: 429,
          latencyMs: 12500 + Math.floor(Math.random() * 2000),
          service: "llm-gateway",
          error: "AI Provider API: 429 Rate limit exceeded",
        })
      }
    } else if (scenario === "database_exhaustion") {
      for (let i = 0; i < 15; i++) {
        newLogs.push({
          id: `log-inj-${Date.now()}-${i}`,
          timestamp: new Date(now.getTime() - (15 - i) * 1000),
          method: "POST",
          path: "/api/v1/checkout/process",
          statusCode: 503,
          latencyMs: 4000 + Math.floor(Math.random() * 500),
          service: "payment-service",
          error: "Connection pool exhausted (100/100 connections active)",
        })
      }
    } else if (scenario === "traffic_surge") {
      for (let i = 0; i < 20; i++) {
        newLogs.push({
          id: `log-inj-${Date.now()}-${i}`,
          timestamp: new Date(now.getTime() - (20 - i) * 500),
          method: "POST",
          path: "/api/v1/orders",
          statusCode: 502,
          latencyMs: 2200 + Math.floor(Math.random() * 400),
          service: "order-service",
          error: "Upstream service overloaded",
        })
      }
    } else if (scenario === "auth_storm") {
      for (let i = 0; i < 15; i++) {
        newLogs.push({
          id: `log-inj-${Date.now()}-${i}`,
          timestamp: new Date(now.getTime() - (15 - i) * 1000),
          method: "POST",
          path: "/api/v1/auth/verify",
          statusCode: 401,
          latencyMs: 15,
          service: "auth-service",
          error: "JWT signature verification failed",
        })
      }
    }

    setLogs(prev => [...prev, ...newLogs].slice(-200))
    logsRef.current = [...logsRef.current, ...newLogs].slice(-200)
    setMetrics(prev => computeMetrics(logsRef.current, prev))

    const incidentId = `INC-${Date.now().toString().slice(-4)}`
    const customIncident: Incident = {
      id: incidentId,
      title,
      description,
      severity,
      status: "investigating",
      affectedRoute: routePath,
      service: serviceName,
      rootCause: description,
      confidence,
      recommendedFix,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setIncidents(prev => [customIncident, ...prev].slice(0, 20))
    incidentsRef.current = [customIncident, ...incidentsRef.current].slice(0, 20)

    let actions: RemediationAction[] = []
    if (scenario === "openai_meltdown") {
      actions = [
        {
          id: "act-openai-1",
          incidentId,
          actionKey: "openai_fallback",
          title: "Activate Upstream AI Fallback Provider",
          description: "Reroute completion calls to backup model API servers.",
          status: "recommended",
          progress: 0,
          command: "curl -X POST https://api.trinetra.internal/v1/proxy/switch-provider -d '{\"provider\": \"fallback-model\"}'",
          logs: []
        },
        {
          id: "act-openai-2",
          incidentId,
          actionKey: "openai_breaker",
          title: "Open Circuit Breaker",
          description: "Immediately reject model proxy requests to prevent pool blockages.",
          status: "recommended",
          progress: 0,
          command: "consul kv put config/llm-gateway/circuit-breaker/state open",
          logs: []
        },
        {
          id: "act-openai-3",
          incidentId,
          actionKey: "openai_queue",
          title: "Scale LLM Gateway Queue Workers",
          description: "Deploy 5 extra consumer replicas to absorb upstream inference rate queue backlogs.",
          status: "recommended",
          progress: 0,
          command: "kubectl scale deployment llm-gateway-queue-consumer --replicas=5",
          logs: []
        }
      ]
    } else if (scenario === "database_exhaustion") {
      actions = [
        {
          id: "act-db-1",
          incidentId,
          actionKey: "db_increase_pool",
          title: "Increase DB Connection Pool size",
          description: "Scale Postgres max_connections thresholds from 100 to 200.",
          status: "recommended",
          progress: 0,
          command: "kubectl patch deployment pg-cluster-prod -p '{\"spec\":{\"connectionPool\":{\"max\":200}}}'",
          logs: []
        },
        {
          id: "act-db-2",
          incidentId,
          actionKey: "deploy_pgbouncer",
          title: "Deploy PgBouncer Multiplexer",
          description: "Configure connection pooling helper to reduce database process overhead.",
          status: "recommended",
          progress: 0,
          command: "helm install pgbouncer stable/pgbouncer --set pg.host=pg-cluster-prod",
          logs: []
        },
        {
          id: "act-db-3",
          incidentId,
          actionKey: "terminate_idle",
          title: "Terminate Idle Postgres Backend Connections",
          description: "Kill inactive backend slots blocking database catalog tables >60s.",
          status: "recommended",
          progress: 0,
          command: "psql -c \"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction';\"",
          logs: []
        }
      ]
    } else if (scenario === "traffic_surge") {
      actions = [
        {
          id: "act-traffic-1",
          incidentId,
          actionKey: "traffic_throttle",
          title: "Activate Throttling on API Gateway",
          description: "Apply 1000req/min rate-limiting to restrict bulk checkout spam.",
          status: "recommended",
          progress: 0,
          command: "kong rate-limit limit=1000 policy=redis window=60",
          logs: []
        },
        {
          id: "act-traffic-2",
          incidentId,
          actionKey: "traffic_scale",
          title: "Scale order-service consumers (+10)",
          description: "Deploy additional consumer pods to drain checkout queues.",
          status: "recommended",
          progress: 0,
          command: "kubectl scale deployment order-consumer --replicas=12",
          logs: []
        },
        {
          id: "act-traffic-3",
          incidentId,
          actionKey: "traffic_rollback",
          title: "Rollback order-service Release",
          description: "Revert order deployment image to verify performance metrics.",
          status: "recommended",
          progress: 0,
          command: "argocd app rollback order-service --to rev-422a",
          logs: []
        }
      ]
    } else if (scenario === "auth_storm") {
      actions = [
        {
          id: "act-auth-1",
          incidentId,
          actionKey: "auth_rollback",
          title: "Rollback JWT Signing Configuration",
          description: "Restore previous public keys setup to synchronize signature validations.",
          status: "recommended",
          progress: 0,
          command: "git revert HEAD && git push origin main && argocd app sync auth-service",
          logs: []
        },
        {
          id: "act-auth-2",
          incidentId,
          actionKey: "auth_restart",
          title: "Restart auth-service API Workers",
          description: "Rollout restart auth deployment pods to refresh local key caches.",
          status: "recommended",
          progress: 0,
          command: "kubectl rollout restart deployment auth-service",
          logs: []
        },
        {
          id: "act-auth-3",
          incidentId,
          actionKey: "auth_jwks",
          title: "Increase JWKS Cache TTL to 1h",
          description: "Store validated signature keys locally to bypass external validation queries.",
          status: "recommended",
          progress: 0,
          command: "consul kv put config/auth-service/jwks/cache-ttl 3600",
          logs: []
        }
      ]
    }

    setRemediationActions(actions)
    triggerAnalysis(incidentId)
  }, [triggerAnalysis])

  // ── Execute Remediation Action ────────────────────────────────────────
  const executeRemediation = useCallback(async (actionId: string) => {
    const action = remediationActions.find(a => a.id === actionId)
    if (!action || action.status !== "recommended") return

    setRemediationActions(prev => prev.map(a => 
      a.id === actionId 
        ? { ...a, status: "executing", progress: 0, logs: [`[SYS] remediating outage: ${a.title}...`] }
        : a
    ))

    let currentProgress = 0
    const logsList: string[] = []

    const pushLog = (line: string) => {
      logsList.push(line)
      setRemediationActions(prev => prev.map(a => 
        a.id === actionId 
          ? { ...a, progress: currentProgress, logs: [...logsList] }
          : a
      ))
    }

    const interval = setInterval(() => {
      currentProgress += 20
      
      // Clean, concise logs, no fake multiline overload or CLI dump spam
      if (currentProgress === 20) {
        pushLog(`[RUN] ${action.command}`)
      } else if (currentProgress === 40) {
        pushLog(`[SYS] Connection established. Applying configuration.`)
      } else if (currentProgress === 60) {
        pushLog(`[SYS] Cluster config updated. Rolling out pods...`)
      } else if (currentProgress === 80) {
        pushLog(`[SYS] Verifying API status path: HTTP 200 OK.`)
      } else if (currentProgress >= 100) {
        clearInterval(interval)
        currentProgress = 100
        pushLog(`[SYS] Stabilization confirmed. Operational.`)

        setRemediationActions(prev => prev.map(a => 
          a.id === actionId 
            ? { ...a, status: "completed", progress: 100, logs: [...logsList] }
            : a
        ))

        let resolvedScenario: FailureScenario = "database"
        if (action.actionKey.startsWith("openai")) resolvedScenario = "openai"
        if (action.actionKey.startsWith("db") || action.actionKey.startsWith("deploy") || action.actionKey.startsWith("terminate")) resolvedScenario = "database"
        if (action.actionKey.startsWith("traffic")) resolvedScenario = "traffic"
        if (action.actionKey.startsWith("auth")) resolvedScenario = "auth"

        activeFailuresRef.current.delete(resolvedScenario)
        setActiveFailures(new Set(activeFailuresRef.current))

        if (activeFailuresRef.current.size === 0) {
          setActiveScenario(null)
          activeScenarioRef.current = null
        }

        setIncidents(prev => prev.map(inc => 
          inc.id === action.incidentId
            ? { ...inc, status: "resolved", resolvedAt: new Date(), updatedAt: new Date() }
            : inc
        ))

        setTimelineEvents(prev => [
          {
            id: `evt-rem-ok-${Date.now()}`,
            timestamp: new Date(),
            title: "Remediation Successful",
            description: `Remediation config deployed. Outages resolved.`,
            severity: "success"
          },
          ...prev
        ])

        // Force metrics immediately back to healthy and mute spikes
        setMetrics(prev => ({
          ...prev,
          systemHealth: 100.00,
          errorRate: 0.00,
          avgLatencyMs: 12
        }))

        // Trigger Premium Stabilization Banner
        setShowStabilizationBanner(true)
      }
    }, 600)

  }, [remediationActions])

  const clearActiveScenario = useCallback(() => {
    setActiveScenario(null)
    activeScenarioRef.current = null
    setRemediationActions([])
    setShowStabilizationBanner(false)
  }, [])

  // Derived values
  const activeIncidentCount = incidents.filter(i => i.status !== "resolved").length
  const latestInsight = incidents.find(i => i.status !== "resolved") ?? incidents[0] ?? null

  return (
    <TelemetryContext.Provider
      value={{
        logs,
        incidents,
        metrics,
        chartData,
        activeFailures,
        activeIncidentCount,
        latestInsight,
        simulateFailure,
        recoverSystem,
        aiState,
        triggerAnalysis,
        timelineEvents,
        chatMessages,
        sendMessage,

        // Remediation & Guided Demo Scenarios
        activeScenario,
        remediationActions,
        aiConfidenceScore,
        triggerDemoScenario,
        executeRemediation,
        clearActiveScenario,

        // Stabilization Banner
        showStabilizationBanner,
        setShowStabilizationBanner,

        // Navigation
        activeTab,
        setActiveTab,

        // SDK Integration
        addExternalTelemetry,

        // Connected Applications
        connectedApps: Object.values(connectedApps)
      }}
    >
      {children}
    </TelemetryContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useTelemetry(): TelemetryContextValue {
  const ctx = useContext(TelemetryContext)
  if (!ctx) throw new Error("useTelemetry must be used within <TelemetryProvider>")
  return ctx
}
