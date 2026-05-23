"use client"

import { AlertCircle, ArrowRight, CheckCircle2, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTelemetry } from "@/lib/telemetry-store"

function formatTimeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000)
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

export function IncidentsPanel() {
  const { incidents, activeIncidentCount } = useTelemetry()

  const visibleIncidents = incidents.slice(0, 8)

  return (
    <Card className="border border-white/[0.04] bg-[#09090B] shadow-[0_1px_3px_rgba(0,0,0,0.6)] rounded-lg h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/[0.04] shrink-0">
        <CardTitle className="text-[11px] font-semibold flex items-center gap-1.5 text-white uppercase tracking-wider font-mono">
          <AlertCircle className={`w-3.5 h-3.5 ${activeIncidentCount > 0 ? 'text-red-400 animate-pulse' : 'text-zinc-550'}`} />
          Active Outages
          {activeIncidentCount > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[8px] font-mono font-bold border border-red-500/20">
              {activeIncidentCount}
            </span>
          )}
        </CardTitle>
        <button className="text-[10px] font-mono text-zinc-500 hover:text-white hover:underline flex items-center gap-1 cursor-pointer transition-colors uppercase tracking-wider">
          View All <ArrowRight size={10} />
        </button>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col">
          {visibleIncidents.length === 0 && (
            <div className="p-8 text-center text-zinc-500 text-xs font-mono">
              <CheckCircle2 className="w-5 h-5 mx-auto mb-2 text-zinc-650" />
              All systems nominal.
            </div>
          )}
          {visibleIncidents.map((incident, idx) => {
            const isActive = incident.status !== "resolved"
            const severityDot = () => {
              switch (incident.severity) {
                case "critical": return <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                case "high":     return <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                case "medium":   return <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                case "low":      return <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                default:         return <CheckCircle2 className="w-3 h-3 text-zinc-600" />
              }
            }

            return (
              <div
                key={incident.id}
                className={`p-4 flex items-start gap-3 transition-colors ${
                  idx !== visibleIncidents.length - 1 ? "border-b border-white/[0.04]" : ""
                } ${isActive ? "hover:bg-white/[0.01]" : "opacity-45 hover:opacity-70"}`}
              >
                <div className="mt-1 shrink-0">
                  {isActive ? severityDot() : <CheckCircle2 className="w-3 h-3 text-zinc-600" />}
                </div>

                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-semibold text-xs text-zinc-300 truncate">{incident.title}</h4>
                    <span className="text-[8px] text-zinc-550 flex items-center gap-1 shrink-0 font-mono">
                      <Clock size={9} />
                      {formatTimeAgo(incident.createdAt)}
                    </span>
                  </div>

                  <div className="text-[9px] font-mono text-zinc-400 bg-black border border-white/[0.03] px-2 py-0.5 rounded inline-block truncate max-w-full">
                    {incident.affectedRoute}
                  </div>

                  <div className="flex items-center gap-1.5 mt-2">
                    <Badge variant="outline" className="text-[8px] py-0 px-1 border-white/[0.03] text-zinc-550 font-mono bg-black rounded">
                      {incident.id}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[8px] py-0 px-1 rounded capitalize font-mono border-white/[0.03] ${
                        incident.status === "investigating" ? "text-red-400 bg-red-500/5" :
                        incident.status === "identified" ? "text-amber-500 bg-amber-500/5" :
                        incident.status === "monitoring" ? "text-zinc-300 bg-white/5" :
                        "text-zinc-550"
                      }`}
                    >
                      {incident.status}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
