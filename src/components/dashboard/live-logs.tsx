"use client"

import { useEffect, useRef } from "react"
import { Terminal } from "lucide-react"
import { useTelemetry } from "@/lib/telemetry-store"

export function LiveLogsPanel() {
  const { logs } = useTelemetry()
  const logContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  const getStatusColor = (status: number) => {
    if (status >= 500) return "text-red-400 bg-red-400/10 border border-red-500/10"
    if (status >= 400) return "text-amber-500 bg-amber-500/10 border border-amber-500/10"
    return "text-zinc-400 bg-white/5 border border-white/5" // nominal statuses are grayscale
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":    return "text-zinc-300"
      case "POST":   return "text-zinc-200"
      default:       return "text-zinc-400"
    }
  }

  const formatTimestamp = (d: Date) =>
    `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${d.getMilliseconds().toString().padStart(3, '0')}`

  // Show the most recent 60 logs
  const visible = logs.slice(-60)

  return (
    <div className="flex flex-col h-full rounded-lg border border-white/5 bg-[#09090B] overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#09090B]">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-zinc-500" />
          <h3 className="font-mono text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Log Stream</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1 h-1 bg-zinc-400 rounded-full"></span>
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Streaming</span>
        </div>
      </div>

      <div
        ref={logContainerRef}
        className="flex-1 p-3.5 font-mono text-[10px] md:text-[11px] overflow-y-auto space-y-1.5 bg-black/10 custom-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {visible.map(log => (
          <div
            key={log.id}
            className={`flex items-start md:items-center gap-2.5 px-2 py-0.5 -mx-2 rounded transition-colors ${
              log.statusCode >= 500 ? "bg-red-500/[0.02]" : "hover:bg-white/[0.02]"
            }`}
          >
            <span className="text-zinc-600 shrink-0 font-mono text-[9px]">
              {formatTimestamp(log.timestamp)}
            </span>
            <span className={`shrink-0 w-10 font-medium ${getMethodColor(log.method)}`}>
              {log.method}
            </span>
            <span className="text-zinc-400 truncate flex-1">{log.path}</span>
            <span className={`shrink-0 px-1 py-0.2 rounded font-bold text-[9px] ${getStatusColor(log.statusCode)}`}>
              {log.statusCode}
            </span>
            <span className={`shrink-0 w-14 text-right font-mono ${log.latencyMs > 500 ? 'text-amber-500 font-bold' : 'text-zinc-500'}`}>
              {log.latencyMs}ms
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
