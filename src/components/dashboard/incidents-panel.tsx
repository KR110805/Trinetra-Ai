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
    <Card className="border border-white/5 bg-[#09090B] rounded-lg h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/5 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-white">
          <AlertCircle className={`w-4 h-4 ${activeIncidentCount > 0 ? 'text-red-400' : 'text-zinc-500'}`} />
          Active Outages
          {activeIncidentCount > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[9px] font-mono font-bold border border-red-500/20">
              {activeIncidentCount}
            </span>
          )}
        </CardTitle>
        <button className="text-xs text-zinc-400 hover:text-white hover:underline flex items-center gap-1 cursor-pointer transition-colors">
          View All <ArrowRight size={11} />
        </button>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col">
          {visibleIncidents.length === 0 && (
            <div className="p-6 text-center text-zinc-500 text-xs">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-zinc-600" />
              All systems nominal. No active incidents.
            </div>
          )}
          {visibleIncidents.map((incident, idx) => {
            const isActive = incident.status !== "resolved"
            const severityDot = () => {
              switch (incident.severity) {
                case "critical": return <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                case "high":     return <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                case "medium":   return <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                case "low":      return <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                default:         return <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
              }
            }

            return (
              <div
                key={incident.id}
                className={`p-3.5 flex items-start gap-3 transition-colors ${
                  idx !== visibleIncidents.length - 1 ? "border-b border-white/5" : ""
                } ${isActive ? "hover:bg-white/[0.02]" : "opacity-50 hover:opacity-75"}`}
              >
                <div className="mt-1.5 shrink-0">
                  {isActive ? severityDot() : <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />}
                </div>

                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-semibold text-xs text-slate-200 truncate">{incident.title}</h4>
                    <span className="text-[9px] text-zinc-500 flex items-center gap-1 shrink-0 font-mono">
                      <Clock size={10} />
                      {formatTimeAgo(incident.createdAt)}
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded inline-block truncate max-w-full">
                    {incident.affectedRoute}
                  </div>

                  <div className="flex items-center gap-1.5 mt-2">
                    <Badge variant="outline" className="text-[9px] py-0 px-1 border-white/5 text-zinc-500 font-mono rounded">
                      {incident.id}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[9px] py-0 px-1 rounded capitalize font-mono border-white/5 ${
                        incident.status === "investigating" ? "text-red-400 bg-red-500/5" :
                        incident.status === "identified" ? "text-amber-500 bg-amber-500/5" :
                        incident.status === "monitoring" ? "text-zinc-300 bg-white/5" :
                        "text-zinc-500"
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
