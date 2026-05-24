"use client"

import React from "react"
import { Database, Bot, Zap, ShieldCheck, AlertTriangle, RefreshCw, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTelemetry } from "@/lib/telemetry-store"
import type { DemoScenarioKey, FailureScenario } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const demoScenarios: { id: DemoScenarioKey; label: string; icon: React.ReactNode; description: string }[] = [
  { 
    id: "openai_meltdown", 
    label: "Upstream Inference Outage",  
    icon: <Bot className="w-4 h-4" />,      
    description: "Simulates upstream AI inference capacity limits (HTTP 429) causing gateway sockets to hang for 30s before dropping with 503."
  },
  { 
    id: "database_exhaustion", 
    label: "Database Exhaustion",  
    icon: <Database className="w-4 h-4" />,      
    description: "Saturates pg-cluster-prod pools (100/100 connections). High hold-time orders block API workers."
  },
  { 
    id: "traffic_surge", 
    label: "Traffic Surge Cascade",      
    icon: <Zap className="w-4 h-4" />,           
    description: "Triggers 3.2x load increase on critical endpoints, causing queue bottlenecks and gateway socket drops."
  },
  { 
    id: "auth_storm", 
    label: "Auth Failure Storm",      
    icon: <AlertTriangle className="w-4 h-4" />, 
    description: "Simulates key rotation config sync delay. Identity cache nodes reject signature validation, failing user auth."
  },
]

const manualFaults: { id: FailureScenario; label: string; icon: React.ReactNode; description: string }[] = [
  { id: "database", label: "Postgres Bottleneck", icon: <Database className="w-3.5 h-3.5" />, description: "Inject database pool constraints" },
  { id: "openai",   label: "LLM Provider Timeout", icon: <Bot className="w-3.5 h-3.5" />, description: "Force completion sockets drop" },
  { id: "traffic",  label: "Gateway Queue Surge", icon: <Zap className="w-3.5 h-3.5" />, description: "Spike network ingress buffers" },
  { id: "auth",     label: "JWT Rotation Mismatch", icon: <AlertTriangle className="w-3.5 h-3.5" />, description: "Force signature verification failures" },
]

export function SettingsView() {
  const { 
    triggerDemoScenario, 
    recoverSystem, 
    activeScenario, 
    activeFailures, 
    simulateFailure, 
    remediationActions 
  } = useTelemetry()

  const hasActiveFault = activeScenario !== null || activeFailures.size > 0

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-light text-white tracking-tight">Demo &amp; Orchestration Controls</h2>
        <p className="text-xs text-zinc-500 mt-1">
          Simulate outages and telemetry anomalies to verify Trinetra's root cause analysis and auto-remediation loops.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Scenario Controls (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-zinc-900 bg-zinc-950/40 rounded-xl">
            <CardHeader className="border-b border-zinc-900/60 pb-4">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-zinc-400" />
                Guided Incident Scenarios
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Trigger multi-service outages. Once injected, go to **Overview** to observe the AI's diagnostic reasoning and execute recovery actions.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoScenarios.map((s) => {
                  const isActive = activeScenario === s.id
                  return (
                    <button
                      key={s.id}
                      onClick={() => triggerDemoScenario(s.id)}
                      className={`flex flex-col text-left p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-white text-black border-transparent shadow-[0_4px_12px_rgba(255,255,255,0.15)] scale-[1.01]"
                          : "bg-zinc-950 border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 font-medium text-xs">
                        <span className={isActive ? "text-black" : "text-zinc-400"}>
                          {s.icon}
                        </span>
                        {s.label}
                      </div>
                      <span className={`text-[11px] mt-2.5 leading-relaxed ${isActive ? "text-zinc-800" : "text-zinc-500"}`}>
                        {s.description}
                      </span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Micro-Fault Injection */}
          <Card className="border border-zinc-900 bg-zinc-950/40 rounded-xl">
            <CardHeader className="border-b border-zinc-900/60 pb-4">
              <CardTitle className="text-sm font-semibold text-white">
                Granular Telemetry Fault Injection
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Inject narrow telemetry errors directly into individual microservices. Use to test threshold alarms.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {manualFaults.map((f) => {
                  const isActive = activeFailures.has(f.id)
                  return (
                    <button
                      key={f.id}
                      onClick={() => simulateFailure(f.id)}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 text-left cursor-pointer ${
                        isActive
                          ? "bg-zinc-900 text-red-400 border-red-500/20"
                          : "bg-zinc-950 border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? "text-red-400" : "text-zinc-500"}>{f.icon}</span>
                        <div>
                          <span className="text-xs font-medium block">{f.label}</span>
                          <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">{f.description}</span>
                        </div>
                      </div>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0 ml-2"></span>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Controls & Status Panel (Right 1 col) */}
        <div className="space-y-6">
          <Card className="border border-zinc-900 bg-zinc-950/40 rounded-xl">
            <CardHeader className="border-b border-zinc-900/60 pb-4">
              <CardTitle className="text-sm font-semibold text-white">
                Environment Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Operational Mode</span>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${hasActiveFault ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                  <span className="text-xs text-white font-medium">
                    {hasActiveFault ? "Fault Injected (Active)" : "Optimal (Nominal)"}
                  </span>
                </div>
              </div>

              {activeScenario && (
                <div className="space-y-2 pt-4 border-t border-zinc-900/60">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Active Guided Scenario</span>
                  <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded text-xs text-white font-medium capitalize flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    {activeScenario.replace("_", " ")}
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-5 border-t border-zinc-900/60">
                <Button
                  onClick={recoverSystem}
                  className="w-full bg-white hover:bg-zinc-200 text-black border-transparent font-medium text-xs rounded-lg py-2.5 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Manual System Reset
                </Button>
                <p className="text-[10px] text-zinc-500 leading-normal text-center font-mono">
                  Clears out all active failures and restores metric loops instantly to 100% health.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
