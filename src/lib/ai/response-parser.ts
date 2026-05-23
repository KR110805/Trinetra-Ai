// ---------------------------------------------------------------------------
// Trinetra AI – AI Response Parser
// Safely parses and validates the structured JSON response from OpenAI.
// ---------------------------------------------------------------------------

import type { AIAnalysisResult } from "./types"
import type { Severity } from "../types"
import { safeJsonParse } from "./safe-json-parser"

/**
 * Parse the raw OpenAI response string into a validated AIAnalysisResult.
 * Handles malformed JSON gracefully by extracting what we can.
 */
export function parseAIResponse(
  raw: string,
  incidentId: string,
  fallbackSeverity: Severity
): AIAnalysisResult {
  const parsed = safeJsonParse(raw)

  if (parsed) {
    try {
      return {
        incidentId,
        rootCause: ensureString(parsed.rootCause, "Unable to determine root cause from available telemetry."),
        confidence: ensureNumber(parsed.confidence, 70, 0, 100),
        impactAnalysis: ensureString(parsed.impactAnalysis, "Impact analysis unavailable."),
        affectedSystems: ensureStringArray(parsed.affectedSystems),
        recommendedFixes: ensureStringArray(parsed.recommendedFixes),
        recoverySteps: ensureStringArray(parsed.recoverySteps),
        summary: ensureString(parsed.summary, "Incident under AI analysis."),
        severity: fallbackSeverity,
        estimatedRecoveryTime: ensureString(parsed.estimatedRecoveryTime, "Unknown"),
        generatedAt: new Date(),
      }
    } catch (e) {
      console.error("[parseAIResponse validation error]", e)
    }
  }

  // JSON parsing failed — return a best-effort result
  return {
    incidentId,
    rootCause: raw.slice(0, 300) || "AI analysis response could not be parsed.",
    confidence: 50,
    impactAnalysis: "Partial analysis — response format was unexpected.",
    affectedSystems: [],
    recommendedFixes: ["Retry analysis", "Check API configuration"],
    recoverySteps: ["Monitor telemetry for changes"],
    summary: "AI analysis produced a non-standard response.",
    severity: fallbackSeverity,
    estimatedRecoveryTime: "Unknown",
    generatedAt: new Date(),
  }
}

function ensureString(val: unknown, fallback: string): string {
  return typeof val === "string" && val.length > 0 ? val : fallback
}

function ensureNumber(val: unknown, fallback: number, min: number, max: number): number {
  const n = typeof val === "number" ? val : parseFloat(String(val))
  if (isNaN(n)) return fallback
  return Math.max(min, Math.min(max, n))
}

function ensureStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return []
  return val.filter((v): v is string => typeof v === "string" && v.length > 0)
}
