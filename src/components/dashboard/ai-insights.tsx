"use client"

import { BrainCircuit, Cpu, ShieldAlert, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTelemetry } from "@/lib/telemetry-store"

export function AIInsightsPanel() {
  const { 
    aiState, 
    incidents, 
    remediationActions, 
    executeRemediation, 
    activeIncidentCount, 
    aiConfidenceScore 
  } = useTelemetry()

  const activeIncident = incidents.find(i => i.status !== "resolved")
  const firstAction = remediationActions.find(a => a.status === "recommended")
  const hasActiveIssue = !!activeIncident

  const isLoading = ["summarizing", "analyzing", "generating"].includes(aiState.status)
  const isCompleted = aiState.status === "completed" && aiState.result
  const isFailed = aiState.status === "failed"

  return (
    <Card className="border border-white/[0.04] bg-[#09090B] shadow-[0_1px_3px_rgba(0,0,0,0.6)] rounded-lg h-full flex flex-col overflow-hidden">
      <CardContent className="p-5 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-white/[0.04] shrink-0">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-zinc-500" />
            <h3 className="font-semibold text-[11px] text-white uppercase tracking-wider font-mono">
              SRE Intelligence
            </h3>
          </div>
          <div className={`px-2 py-0.5 rounded text-[8px] font-mono border uppercase tracking-wider font-medium ${
            isLoading ? "bg-white/5 border-white/10 text-zinc-400 animate-pulse" :
            isCompleted ? "bg-white/[0.03] border-white/[0.08] text-white font-medium shadow-sm" :
            isFailed ? "bg-red-500/5 border-red-500/10 text-red-400" :
            hasActiveIssue ? "bg-amber-500/5 border-amber-500/10 text-amber-400" :
            "bg-white/[0.01] border-white/[0.04] text-zinc-550"
          }`}>
            {isLoading ? "Running" :
             isCompleted ? "Complete" :
             isFailed ? "Failed" :
             hasActiveIssue ? "Alert Active" :
             "Nominal"}
          </div>
        </div>

        {/* Live Auto-SRE Engine Status Block (Denser UI, reduces empty/dead space) */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded bg-black border border-white/[0.03] text-[9px] font-mono mb-4 shrink-0">
          <div className="space-y-0.5">
            <span className="text-zinc-600 text-[8px] uppercase tracking-wider block">Autopilot SLA</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${hasActiveIssue ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}></span>
              <span className="text-zinc-300 font-medium">{hasActiveIssue ? "Degraded" : "99.98%"}</span>
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-zinc-600 text-[8px] uppercase tracking-wider block">Certainty</span>
            <span className="text-zinc-300 font-medium">{aiConfidenceScore}%</span>
          </div>
          <div className="space-y-0.5 border-t border-white/[0.03] pt-2">
            <span className="text-zinc-600 text-[8px] uppercase tracking-wider block">Anomalies</span>
            <span className="text-zinc-300 font-medium">{activeIncidentCount}</span>
          </div>
          <div className="space-y-0.5 border-t border-white/[0.03] pt-2">
            <span className="text-zinc-600 text-[8px] uppercase tracking-wider block">Active Node</span>
            <span className="text-zinc-300 font-medium truncate block max-w-full">
              {activeIncident ? activeIncident.service : "None"}
            </span>
          </div>
        </div>

        {/* Main State Switch */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-5 h-5 text-zinc-600 animate-spin" />
            <div className="space-y-1">
              <p className="text-[10px] font-medium text-white font-mono uppercase tracking-wider">
                {aiState.status === "summarizing" && "Compressing metrics..."}
                {aiState.status === "analyzing" && "Analyzing SRE signals..."}
                {aiState.status === "generating" && "Structuring hotfix..."}
              </p>
              <p className="text-[9px] text-zinc-650 font-mono">
                Evaluating microservice diagnostics.
              </p>
            </div>
          </div>
        ) : isCompleted ? (
          <div className="flex-1 space-y-4 overflow-y-auto pr-1 text-xs custom-scrollbar">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[8px] text-zinc-550 uppercase tracking-wider font-mono">
                <ShieldAlert size={10} className="text-zinc-600" />
                Telemetry Summary
              </div>
              <p className="text-[11px] font-normal text-zinc-300 leading-relaxed font-mono">
                {aiState.result!.summary}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[8px] text-zinc-550 uppercase tracking-wider font-mono">
                <Cpu size={10} className="text-zinc-600" />
                Diag Root Cause
              </div>
              <div className="p-3 rounded bg-black border border-white/[0.03] text-[10px] text-zinc-400 leading-relaxed font-mono">
                {aiState.result!.rootCause}
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[8px] text-zinc-550 uppercase tracking-wider font-mono">
                <span>Confidence Rating</span>
                <span className="font-semibold text-white">{aiState.result!.confidence}%</span>
              </div>
              <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden border border-white/[0.02]">
                <div
                  className="h-full bg-white transition-all duration-700"
                  style={{ width: `${aiState.result!.confidence}%` }}
                ></div>
              </div>
            </div>
          </div>
        ) : isFailed ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 opacity-80">
            <AlertTriangle className="w-5 h-5 text-red-500/40" />
            <p className="text-[10px] text-red-400 font-mono">
              {aiState.error || "Analysis session failed"}
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/[0.04] rounded bg-black/10">
            <CheckCircle2 className="w-5 h-5 text-zinc-650 mb-2" />
            <span className="text-[11px] font-semibold text-white font-mono uppercase tracking-wider block">Autopilot Standby</span>
            <p className="text-[10px] text-zinc-550 max-w-[200px] mt-1 leading-relaxed font-mono">
              Distributed service mesh is nominal. Telemetry analyzers listening for alerts.
            </p>
          </div>
        )}

        {/* Remediation Execute Button */}
        <div className="mt-4 pt-3.5 border-t border-white/[0.04] shrink-0">
          <Button
            className="w-full bg-white hover:bg-zinc-200 text-black border-transparent text-[10px] font-mono uppercase tracking-wider font-semibold py-2 rounded cursor-pointer disabled:opacity-30 disabled:hover:bg-white transition-colors"
            disabled={!firstAction}
            onClick={() => firstAction && executeRemediation(firstAction.id)}
          >
            {firstAction ? `Deploy Fix: ${firstAction.title.slice(0, 20)}…` : "Remediation Core Nominal"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
