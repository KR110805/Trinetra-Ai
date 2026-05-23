"use client"

import { Activity, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTelemetry } from "@/lib/telemetry-store"

export function IncidentTimeline() {
  const { timelineEvents } = useTelemetry()

  return (
    <Card className="h-full border border-white/5 bg-[#09090B] rounded-lg">
      <CardHeader className="pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-zinc-400" />
          <CardTitle className="text-sm font-semibold text-white">
            Incident Timeline
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 overflow-y-auto h-[calc(100%-60px)] custom-scrollbar">
        <div className="p-5">
          <div className="relative border-l border-white/10 ml-2.5 space-y-5">
            {timelineEvents.map((event, index) => {
              const isFirst = index === 0
              return (
                <div key={event.id} className={`relative pl-5 transition-all duration-300 ${isFirst ? 'animate-in fade-in slide-in-from-top-2' : ''}`}>
                  {/* Indicator Dot (Flat, Simple) */}
                  <div className={`absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full border border-black ${
                    event.severity === "error" ? "bg-red-500" :
                    event.severity === "warning" ? "bg-amber-500" :
                    event.severity === "success" ? "bg-emerald-500" :
                    "bg-zinc-500"
                  }`} />

                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${
                        event.severity === "error" ? "text-red-400" :
                        event.severity === "warning" ? "text-amber-500" :
                        event.severity === "success" ? "text-emerald-400" :
                        "text-zinc-300"
                      }`}>
                        {event.title}
                      </span>
                      <span className="text-[9px] text-zinc-500 flex items-center gap-1 font-mono">
                        <Clock className="w-2.5 h-2.5" />
                        {event.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal">
                      {event.description}
                    </p>
                  </div>
                </div>
              )
            })}
            
            {timelineEvents.length === 0 && (
              <div className="text-[11px] text-zinc-500 text-center py-4">
                No events recorded.
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}} />
    </Card>
  )
}
