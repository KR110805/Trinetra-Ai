"use client"

import { useTelemetry } from "@/lib/telemetry-store"
import { ShieldCheck, Activity } from "lucide-react"

export function HeroSection() {
  const { activeIncidentCount, metrics } = useTelemetry()
  const isHealthy = metrics.systemHealth > 90

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/[0.04] bg-[#09090B] p-8 lg:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
      {/* Subtle grid layout inspired by Vercel / Linear */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#161619_1px,transparent_1px),linear-gradient(to_bottom,#161619_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] opacity-35 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left Side: Typography */}
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-white/[0.04] bg-zinc-900/60 text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            autonomous SRE engine online
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-white font-sans">
              TRINETRA
            </h1>
            <p className="text-xs font-normal text-zinc-400 mt-1 font-mono tracking-tight uppercase">
              The Third Eye for Autonomous API Reliability
            </p>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-xl">
            A quiet AI reliability operations platform auditing telemetry patterns, orchestrating real-time anomaly discovery, and deploying automated SRE remediations across your distributed mesh network.
          </p>
        </div>

        {/* Right Side: Quick System Health Widget */}
        <div className="flex items-center gap-4 bg-black border border-white/[0.04] rounded-lg p-5 shrink-0 w-full md:w-auto md:min-w-[260px] shadow-sm">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isHealthy 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {isHealthy ? <ShieldCheck className="w-5 h-5" /> : <Activity className="w-5 h-5 animate-pulse" />}
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Engine Autopilot</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white">
                {isHealthy ? "Systems Nominal" : "Outage Detected"}
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">
              {activeIncidentCount > 0 ? `${activeIncidentCount} Active Incident(s)` : "Telemetry loops healthy"}
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
