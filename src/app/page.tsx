"use client"

import { useTelemetry, TelemetryProvider } from "@/lib/telemetry-store"
import { DashboardLayout } from "@/components/dashboard/layout"
import { HeroSection } from "@/components/dashboard/hero-section"
import { ServiceMeshStatus, RegionConfidenceStatus } from "@/components/dashboard/status-center"
import { ExecutiveSummary } from "@/components/dashboard/executive-summary"
import { HeroMetrics } from "@/components/dashboard/hero-metrics"
import { ChartsPanel } from "@/components/dashboard/charts-panel"
import { RecoveryCenter } from "@/components/dashboard/recovery-center"
import { IncidentsPanel } from "@/components/dashboard/incidents-panel"
import { AIInsightsPanel } from "@/components/dashboard/ai-insights"
import { LiveLogsPanel } from "@/components/dashboard/live-logs"
import { IncidentTimeline } from "@/components/dashboard/incident-timeline"
import { AskTrinetraPanel } from "@/components/dashboard/ask-trinetra"
import { SettingsView } from "@/components/dashboard/settings-view"
import { ConnectedApplications } from "@/components/dashboard/connected-applications"
import { CheckCircle2, AlertTriangle, ShieldCheck, Play, Loader2 } from "lucide-react"

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
          {/* SECTION 1: Hero + system status */}
          <HeroSection />

          {/* SECTION 2: Core metrics */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold font-mono tracking-wider text-zinc-500 uppercase">Core Telemetry Metrics</h3>
            <HeroMetrics />
          </div>

          {/* Connected Applications Module */}
          <ConnectedApplications />

          {/* PROGRESSIVE REVEAL BLOCK */}
          {hasActiveIncident ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-2">
              
              {/* Left Column: SECTION 3 (Incident) & SECTION 4 (AI Analysis) */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* SECTION 3: Current active incident */}
                <div className="border border-red-950/30 bg-red-950/5 p-6 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                      <h3 className="text-xs font-semibold font-mono tracking-wider text-red-400 uppercase">Active Outage Detected</h3>
                    </div>
                    <span className="text-zinc-500 text-xs font-mono">{formatTimeAgo(activeIncident.createdAt)}</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-normal text-white">{activeIncident.title}</h2>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{activeIncident.description}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs font-mono">
                    <span className="px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">Route: {activeIncident.affectedRoute}</span>
                    <span className="px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">Service: {activeIncident.service}</span>
                    <span className="px-2.5 py-0.5 rounded bg-red-950/40 border border-red-900/40 text-red-400 capitalize">Severity: {activeIncident.severity}</span>
                  </div>
                </div>

                {/* SECTION 4: AI root cause analysis */}
                <div className="border border-zinc-900 bg-zinc-950/40 p-6 rounded-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
                    <h3 className="text-xs font-semibold font-mono tracking-wider text-zinc-400 uppercase">AI Root Cause Analysis</h3>
                    <span className="text-zinc-400 text-xs font-mono">Autopilot Confidence: {aiConfidenceScore}%</span>
                  </div>
                  
                  {["summarizing", "analyzing", "generating"].includes(aiState.status) ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-3.5">
                      <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
                      <div className="text-center space-y-1">
                        <p className="text-xs text-white font-medium">
                          {aiState.status === "summarizing" && "Compressing telemetry metrics..."}
                          {aiState.status === "analyzing" && "Analyzing SRE signals..."}
                          {aiState.status === "generating" && "Structuring mitigation plan..."}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono">Evaluating microservice diagnostics.</p>
                      </div>
                    </div>
                  ) : aiState.status === "completed" && aiState.result ? (
                    <div className="space-y-5 animate-in fade-in duration-300">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Anomaly Diagnosis</span>
                        <p className="text-xs text-zinc-300 leading-relaxed font-sans">{aiState.result.summary}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Root Cause Analysis</span>
                        <div className="p-4 rounded-lg bg-black border border-zinc-900 text-xs text-zinc-400 font-mono leading-relaxed">
                          {aiState.result.rootCause}
                        </div>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                          <span>Certainty Level</span>
                          <span className="text-white font-semibold">{aiState.result.confidence}%</span>
                        </div>
                        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full bg-white transition-all duration-700" style={{ width: `${aiState.result.confidence}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-zinc-500 text-xs flex flex-col items-center justify-center space-y-2">
                      <AlertTriangle className="w-5 h-5 text-zinc-600" />
                      <span>Diagnostics Standby. Autopilot is compiling root cause logs.</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: SECTION 5 (Recovery Recommendations) */}
              <div className="lg:col-span-1 h-full">
                <div className="border border-zinc-900 bg-zinc-950/40 p-6 rounded-xl space-y-5 h-full">
                  <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
                    <h3 className="text-xs font-semibold font-mono tracking-wider text-zinc-400 uppercase">Recommended Recovery</h3>
                  </div>

                  {remediationActions.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 text-xs">
                      No active remediation recommended yet.
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {remediationActions.slice(0, 1).map(action => {
                        const isExecuting = action.status === "executing"
                        const isCompleted = action.status === "completed"
                        return (
                          <div key={action.id} className="space-y-4">
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded uppercase tracking-wider">Recommended Hotfix</span>
                              <h4 className="text-xs font-semibold text-white pt-1.5">{action.title}</h4>
                              <p className="text-[11px] text-zinc-400 leading-normal">{action.description}</p>
                            </div>
                            
                            {isExecuting && (
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                                  <span>Deploying configuration...</span>
                                  <span>{action.progress}%</span>
                                </div>
                                <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                                  <div className="h-full bg-white transition-all duration-300" style={{ width: `${action.progress}%` }}></div>
                                </div>
                              </div>
                            )}

                            <div className="pt-2">
                              {isCompleted ? (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg p-3.5 flex items-center justify-center gap-2 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  Remediation Applied
                                </div>
                              ) : isExecuting ? (
                                <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs rounded-lg p-3.5 flex items-center justify-center gap-2 font-medium font-mono">
                                  <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
                                  Applying Hotfix...
                                </div>
                              ) : (
                                <button
                                  onClick={() => executeRemediation(action.id)}
                                  className="w-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold py-2.5 px-4 rounded-lg cursor-pointer transition-colors shadow-sm"
                                >
                                  Execute Automated Recovery
                                </button>
                              )}
                            </div>

                            {/* Quick Console logs */}
                            <div className="rounded-lg border border-zinc-900 bg-black p-4 font-mono text-[9px] text-zinc-500 h-[150px] overflow-y-auto space-y-1 leading-normal custom-scrollbar">
                              <span className="text-[8px] text-zinc-600 block border-b border-zinc-900/60 pb-1 mb-1 font-semibold uppercase">REMEDIATION CONSOLE</span>
                              {action.logs.length === 0 && <div className="text-zinc-700">[SYS] Ready. Click execute to stream logs...</div>}
                              {action.logs.map((log, index) => (
                                <div key={index} className="truncate">{log}</div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            /* NOMINAL SYSTEMS OVERVIEW CARD */
            <div className="border border-zinc-900 bg-zinc-950/40 p-10 rounded-xl text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-medium text-white">All Systems Nominal</h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                  Trinetra SRE autopilot is actively monitoring microservice telemetry logs, queues, and latency thresholds. No anomalies detected.
                </p>
              </div>
              <div className="pt-3">
                <button 
                  onClick={() => setActiveTab("settings")}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  Inject Fault in Settings &rarr;
                </button>
              </div>
            </div>
          )}
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

      {/* 3. AI INSIGHTS VIEW */}
      {activeTab === "ai" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h2 className="text-xl font-light text-white tracking-tight">AI Insights &amp; SRE Copilot</h2>
            <p className="text-xs text-zinc-500 mt-1">Conversational SRE debugging interface and automated root cause telemetry reasoning.</p>
          </div>
          
          {/* Middle: Ask Trinetra Chat + SRE Intelligence Card aligned horizontally */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch h-[450px]">
            <div className="lg:col-span-2 h-full">
              <AskTrinetraPanel showChips={false} />
            </div>
            <div className="lg:col-span-1 h-full">
              <AIInsightsPanel />
            </div>
          </div>

          {/* Bottom: Suggested Prompt Investigation Actions & Autopilot Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Suggested Prompts Chips Container */}
            <div className="lg:col-span-2 border border-zinc-900 bg-zinc-950/40 p-6 rounded-xl space-y-4">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-semibold">
                Suggested Investigation Actions
              </span>
              <div className="flex flex-wrap gap-2.5">
                {[
                  "What caused this outage?",
                  "Which APIs were affected?",
                  "How can we prevent this?",
                  "What triggered the latency spike?",
                  "What recovery actions were executed?"
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="px-3.5 py-2.5 text-[10px] font-mono text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all cursor-pointer font-medium shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Autopilot Statistics Block */}
            <div className="lg:col-span-1 border border-zinc-900 bg-zinc-950/40 p-6 rounded-xl space-y-4">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-semibold">
                Autopilot SRE Statistics
              </span>
              <div className="space-y-3 font-mono text-[10px]">
                <div className="flex justify-between items-center border-b border-zinc-900/40 pb-2">
                  <span className="text-zinc-600">SRE ENGINE UPTIME</span>
                  <span className="text-zinc-300 font-medium">99.999%</span>
                </div>
                <div className="flex justify-between items-center border-b border-zinc-900/40 pb-2">
                  <span className="text-zinc-600">TOKEN EFFICIENCY</span>
                  <span className="text-emerald-400 font-medium">94.8% (p95)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600">REMEDIATION DELAY</span>
                  <span className="text-zinc-300 font-medium">850ms (average)</span>
                </div>
              </div>
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

      {/* 5. MONITORING VIEW */}
      {activeTab === "monitoring" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h2 className="text-xl font-light text-white tracking-tight">Telemetry Stream &amp; Cluster Health</h2>
            <p className="text-xs text-zinc-500 mt-1">Real-time latency trends, request throughput, error ratios, and mesh topography.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceMeshStatus />
            <RegionConfidenceStatus />
            <ExecutiveSummary />
          </div>
          <div className="w-full">
            <ChartsPanel />
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
