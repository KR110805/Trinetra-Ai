"use client"

import { useTelemetry } from "@/lib/telemetry-store"
import { Radio, Wifi, ArrowUpRight, Activity } from "lucide-react"

export function ConnectedApplications() {
  const { connectedApps } = useTelemetry()

  if (!connectedApps || connectedApps.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-zinc-500 animate-pulse" />
          <h3 className="text-xs font-semibold font-mono tracking-wider text-zinc-400 uppercase">
            Connected Applications
          </h3>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">
          {connectedApps.length} app{connectedApps.length === 1 ? "" : "s"} streaming
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connectedApps.map((app: any) => {
          const isHealthy = app.status === "healthy"
          const isDegraded = app.status === "degraded"
          const isCritical = app.status === "critical"

          return (
            <div
              key={app.name}
              className={`bg-[#09090B] border rounded-lg p-4 transition-all duration-300 relative overflow-hidden group shadow-[0_1px_3px_rgba(0,0,0,0.6)] ${
                isCritical
                  ? "border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.03)]"
                  : isDegraded
                  ? "border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.03)]"
                  : "border-white/[0.04] hover:border-white/[0.08]"
              }`}
            >
              {/* Premium Top Line Accent */}
              <div
                className={`absolute top-0 left-0 right-0 h-[2px] transition-all duration-300 ${
                  isCritical
                    ? "bg-red-500/30"
                    : isDegraded
                    ? "bg-amber-500/30"
                    : "bg-emerald-500/20 opacity-0 group-hover:opacity-100"
                }`}
              />

              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      {isHealthy && (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </>
                      )}
                      {isDegraded && (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </>
                      )}
                      {isCritical && (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </>
                      )}
                    </span>
                    <h4 className="text-sm font-semibold text-white tracking-tight leading-none">
                      {app.name}
                    </h4>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    {app.message || "Streaming telemetry"}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  <span>Live</span>
                  <Wifi className={`w-3 h-3 ${isHealthy ? 'text-emerald-500/70 animate-pulse' : 'text-zinc-600'}`} />
                </div>
              </div>

              {/* Lower Section: Request Stats */}
              <div className="mt-4 pt-3 border-t border-zinc-900/60 flex items-center justify-between text-[11px] font-mono">
                <div className="text-zinc-400">
                  <span className="text-white font-medium">{app.requests}</span>{" "}
                  <span className="text-zinc-600 text-[10px]">reqs</span>
                </div>
                <div className="h-3 w-px bg-zinc-800" />
                <div className="text-zinc-400">
                  <span className="text-zinc-600 text-[10px]">avg</span>{" "}
                  <span
                    className={`font-medium ${
                      isCritical
                        ? "text-red-400"
                        : isDegraded
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {app.avgLatency}ms
                  </span>
                </div>
                <div className="h-3 w-px bg-zinc-800" />
                <div className="text-[10px]">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                      isCritical
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : isDegraded
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
