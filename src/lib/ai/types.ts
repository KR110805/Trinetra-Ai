// ---------------------------------------------------------------------------
// Trinetra AI – AI Analysis Type Definitions
// ---------------------------------------------------------------------------

import type { Incident, Severity, TelemetryLog } from "../types"

/** Current processing state of the AI analysis pipeline */
export type AIAnalysisStatus = "idle" | "summarizing" | "analyzing" | "generating" | "completed" | "failed"

/** Compact structured summary sent to the AI model (never raw logs) */
export interface IncidentSummary {
  incidentId: string
  incidentType: string
  severity: Severity
  title: string
  affectedServices: string[]
  affectedRoutes: string[]
  failureCount: number
  totalRequests: number
  avgLatencyMs: number
  p99LatencyMs: number
  errorRate: number
  timeWindowSec: number
  dominantErrorPatterns: string[]
  statusCodeDistribution: Record<number, number>
  timeline: string // human-readable timeline summary
}

/** Structured AI analysis result */
export interface AIAnalysisResult {
  incidentId: string
  rootCause: string
  confidence: number
  impactAnalysis: string
  affectedSystems: string[]
  recommendedFixes: string[]
  recoverySteps: string[]
  summary: string
  severity: Severity
  estimatedRecoveryTime: string
  generatedAt: Date
}

/** Full state of the AI analysis engine exposed to UI */
export interface AIAnalysisState {
  status: AIAnalysisStatus
  currentIncidentId: string | null
  result: AIAnalysisResult | null
  error: string | null
  lastAnalyzedAt: Date | null
  analysisHistory: AIAnalysisResult[]
}
