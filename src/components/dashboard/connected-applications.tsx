"use client"

import { useTelemetry } from "@/lib/telemetry-store"
import { Radio } from "lucide-react"

export function ConnectedApplications() {
  const { connectedApps } = useTelemetry()

  if (!connectedApps || connectedApps.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-zinc-500 animate-pulse" />
          <h3 className="text-[10px] font-semibold font-mono tracking-wider text-zinc-400 uppercase">
            Connected Applications
          </h3>
        </div>
        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
          {connectedApps.length} active
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {connectedApps.map((app: any) => {
          const isHealthy = app.status === "healthy"
          const isDegraded = app.status === "degraded"
          const isCritical = app.status === "critical"

          return (
            <div
              key={app.name}
              className="flex items-center justify-between bg-black border border-white/[0.03] hover:border-white/[0.06] rounded-lg px-4 py-3 transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center gap-3">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  {isHealthy && (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </>
                  )}
                  {isDegraded && (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                    </>
                  )}
                  {isCritical && (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                    </>
                  )}
                </span>
                <span className="text-xs font-medium text-white">{app.name}</span>
                <span className="text-[10px] text-zinc-700 font-mono">•</span>
                <span className="text-[10px] text-zinc-400 font-mono">{app.requests} reqs</span>
                <span className="text-[10px] text-zinc-700 font-mono">•</span>
                <span className="text-[10px] text-zinc-500 font-mono">{app.message || "Streaming telemetry"}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-[10px] font-mono text-zinc-500">
                  <span className="text-zinc-600">avg latency:</span>{" "}
                  <span
                    className={`font-semibold ${
                      isHealthy ? "text-emerald-400" :
                      isDegraded ? "text-amber-400" :
                      "text-red-400"
                    }`}
                  >
                    {app.avgLatency}ms
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider font-mono ${
                    isHealthy ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    isDegraded ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                    "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  {app.status}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
