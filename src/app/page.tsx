"use client"

import { useTelemetry, TelemetryProvider } from "@/lib/telemetry-store"
import { DashboardLayout } from "@/components/dashboard/layout"
import { HeroSection } from "@/components/dashboard/hero-section"
import { ServiceMeshStatus } from "@/components/dashboard/status-center"
import { HeroMetrics } from "@/components/dashboard/hero-metrics"
import { ChartsPanel } from "@/components/dashboard/charts-panel"
import { RecoveryCenter } from "@/components/dashboard/recovery-center"
import { IncidentsPanel } from "@/components/dashboard/incidents-panel"
import { LiveLogsPanel } from "@/components/dashboard/live-logs"
import { IncidentTimeline } from "@/components/dashboard/incident-timeline"
import { AskTrinetraPanel } from "@/components/dashboard/ask-trinetra"
import { SettingsView } from "@/components/dashboard/settings-view"
import { ConnectedApplications } from "@/components/dashboard/connected-applications"
import { SdkView } from "@/components/dashboard/sdk-view"
import { CheckCircle2, Loader2 } from "lucide-react"

function formatTimeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000)
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

function DashboardPageContent() {
  const { 
    activeTab, 
    setActiveTab, 
    incidents, 
    aiState, 
    aiConfidenceScore, 
    remediationActions, 
    executeRemediation,
    showStabilizationBanner, 
    setShowStabilizationBanner,
    sendMessage
  } = useTelemetry()

  const activeIncident = incidents.find(i => i.status !== "resolved")
  const hasActiveIncident = !!activeIncident

  return (
    <DashboardLayout>
      
      {/* Stabilization Banner */}
      {showStabilizationBanner && (
        <div className="bg-[#09090B] border border-emerald-500/20 text-white p-4 rounded-xl flex items-center justify-between shadow-sm animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">System Stabilization Confirmed</h4>
              <p className="text-[10px] text-zinc-500 mt-0.5">Trinetra successfully stabilized the production environment. Telemetry loops normalized.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowStabilizationBanner(false)}
            className="text-[10px] font-mono text-zinc-400 hover:text-white px-2 py-1 rounded border border-zinc-800 bg-zinc-900 cursor-pointer transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* RENDER DYNAMIC VIEWS BASED ON ACTIVE TAB */}
      
      {/* 1. OVERVIEW VIEW */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
          {/* Hero + system status */}
          <HeroSection />

          {/* AI Generated Overview Summary */}
          <div className="border border-white/[0.03] bg-[#09090B] px-5 py-3.5 rounded-lg flex items-center justify-between text-xs text-zinc-400 shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${hasActiveIncident ? "animate-ping bg-amber-400" : "animate-ping bg-emerald-400"}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${hasActiveIncident ? "bg-amber-500" : "bg-emerald-500"}`}></span>
              </span>
              <span className="font-mono text-[10px] tracking-widest uppercase text-zinc-500 font-semibold">AI Overview</span>
              <span className="text-zinc-600 font-mono text-[10px]">•</span>
              <span className="text-zinc-300 leading-normal">
                {hasActiveIncident && aiState.result?.summary ? aiState.result.summary : 
                 ["summarizing", "analyzing", "generating"].includes(aiState.status) ? "Autopilot is actively compiling root cause logs..." :
                 "All connected applications and API routes are operating normally. No anomalies detected."}
              </span>
            </div>
            {hasActiveIncident && (
              <span className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">Certainty: <span className="text-white">{aiConfidenceScore}%</span></span>
            )}
          </div>

          {/* Core metrics */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-semibold font-mono tracking-wider text-zinc-500 uppercase">Core Telemetry</h3>
            <HeroMetrics />
          </div>

          {/* Connected Applications Module */}
          <ConnectedApplications />

          {/* PROGRESSIVE REVEAL BLOCK */}
          {hasActiveIncident && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch mt-2">
              
              {/* Left Column: Active Outage Detected */}
              <div className="lg:col-span-2 border border-red-500/20 bg-red-950/10 p-6 rounded-lg space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.6)] flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-500/30 transition-all duration-300" />
                <div className="space-y-2.5 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      <h3 className="text-[10px] font-semibold font-mono tracking-wider text-red-400 uppercase">Active Outage Detected</h3>
                    </div>
                    <span className="text-zinc-500 text-[10px] font-mono">{formatTimeAgo(activeIncident.createdAt)}</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-normal text-white tracking-tight">{activeIncident.title}</h2>
                    <p className="text-[13px] text-zinc-400 mt-1.5 leading-relaxed">{activeIncident.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-3 text-[10px] font-mono relative z-10">
                  <span className="px-2.5 py-1 rounded bg-black/40 border border-white/[0.04] text-zinc-300">Route: {activeIncident.affectedRoute}</span>
                  <span className="px-2.5 py-1 rounded bg-black/40 border border-white/[0.04] text-zinc-300">Service: {activeIncident.service}</span>
                  <span className="px-2.5 py-1 rounded bg-red-950/60 border border-red-900/40 text-red-400 capitalize font-medium">Severity: {activeIncident.severity}</span>
                </div>
              </div>

              {/* Right Column: Recommended Recovery */}
              {remediationActions.length > 0 && (
                <div className="lg:col-span-1 border border-white/[0.04] bg-[#09090B] p-6 rounded-lg flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  {remediationActions.slice(0, 1).map(action => {
                    const isExecuting = action.status === "executing"
                    const isCompleted = action.status === "completed"
                    return (
                      <div key={action.id} className="flex flex-col h-full justify-between gap-5 relative z-10">
                        <div className="space-y-2">
                          <span className="text-[9px] font-mono font-bold text-zinc-400 bg-zinc-900/50 border border-white/[0.04] px-2.5 py-1 rounded uppercase tracking-wider">Recommended Hotfix</span>
                          <h4 className="text-sm font-semibold text-white pt-2 leading-tight">{action.title}</h4>
                          <p className="text-xs text-zinc-400 leading-relaxed">{action.description}</p>
                        </div>
                        
                        {isExecuting && (
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                              <span>Deploying configuration...</span>
                              <span className="text-white">{action.progress}%</span>
                            </div>
                            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden border border-white/[0.02]">
                              <div className="h-full bg-white transition-all duration-300" style={{ width: `${action.progress}%` }}></div>
                            </div>
                          </div>
                        )}

                        <div className="pt-2">
                          {isCompleted ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] uppercase tracking-wider rounded-lg p-3 flex items-center justify-center gap-2 font-semibold font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Remediation Applied
                            </div>
                          ) : isExecuting ? (
                            <div className="bg-zinc-900 border border-white/[0.04] text-zinc-300 text-[11px] uppercase tracking-wider rounded-lg p-3 flex items-center justify-center gap-2 font-semibold font-mono">
                              <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
                              Applying Hotfix...
                            </div>
                          ) : (
                            <button
                              onClick={() => executeRemediation(action.id)}
                              className="w-full bg-white hover:bg-zinc-200 text-black text-[11px] uppercase tracking-wider font-bold py-3 px-4 rounded-lg cursor-pointer transition-colors shadow-sm font-mono"
                            >
                              Execute Recovery
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Bottom: Single clean latency graph */}
          <div className="space-y-3 mt-4">
            <h3 className="text-[10px] font-semibold font-mono tracking-wider text-zinc-500 uppercase">Global API Latency Trend</h3>
            <ChartsPanel showTraffic={false} />
          </div>
        </div>
      )}

      {/* 2. INCIDENTS VIEW */}
      {activeTab === "incidents" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <h2 className="text-xl font-light text-white tracking-tight">Active Outages &amp; Event History</h2>
            <p className="text-xs text-zinc-500 mt-1">Review active outages, historical telemetry event alerts, and microservice status logs.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start min-h-[480px]">
            <div className="lg:col-span-1 h-full">
              <IncidentsPanel />
            </div>
            <div className="lg:col-span-2 h-full">
              <IncidentTimeline />
            </div>
          </div>
        </div>
      )}

      {/* 3. AI INSIGHTS VIEW - ChatGPT FOCUS MODE */}
      {activeTab === "ai" && (
        <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-300 p-2 lg:p-6 w-full">
          <div className="w-full max-w-3xl flex-1 flex flex-col min-h-[550px]">
            
            {/* Header Area */}
            <div className="text-center mb-8 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.04] text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Autopilot Online
              </div>
              <h2 className="text-2xl font-light text-white tracking-tight">SRE Copilot</h2>
            </div>
            
            {/* Centered Conversation Area */}
            <div className="w-full flex-1">
              <AskTrinetraPanel showChips={true} />
            </div>

          </div>
        </div>
      )}

      {/* 4. RECOVERY VIEW */}
      {activeTab === "recovery" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <h2 className="text-xl font-light text-white tracking-tight">Recovery Action Center</h2>
            <p className="text-xs text-zinc-500 mt-1">Automated remediation playbooks and live execution terminal shells.</p>
          </div>
          <div className="w-full">
            <RecoveryCenter />
          </div>
        </div>
      )}

      {/* 5. MONITORING VIEW - SIMPLIFIED */}
      {activeTab === "monitoring" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h2 className="text-xl font-light text-white tracking-tight">Telemetry Stream &amp; Cluster Health</h2>
            <p className="text-xs text-zinc-500 mt-1">Real-time latency trends, request throughput, error ratios, and mesh topography.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <ServiceMeshStatus />
          </div>
          
          <div className="w-full">
            <ChartsPanel showTraffic={true} />
          </div>
          
          <div className="w-full">
            <LiveLogsPanel />
          </div>
        </div>
      )}

      {/* 6. SETTINGS VIEW */}
      {activeTab === "settings" && (
        <SettingsView />
      )}

      {/* 7. SDK SHOWCASE VIEW */}
      {activeTab === "sdk" && (
        <SdkView />
      )}

    </DashboardLayout>
  )
}

export default function DashboardPage() {
  return (
    <TelemetryProvider>
      <DashboardPageContent />
    </TelemetryProvider>
  )
}
