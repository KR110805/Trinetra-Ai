"use client"

import { useState, useEffect, useRef } from "react"
import { useTelemetry } from "@/lib/telemetry-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, CheckCircle2, Terminal, ShieldCheck, Loader2 } from "lucide-react"

export function RecoveryCenter() {
  const { remediationActions, executeRemediation, incidents } = useTelemetry()
  const [activeActionId, setActiveActionId] = useState<string | null>(null)
  const consoleEndRef = useRef<HTMLDivElement | null>(null)

  const activeIncident = incidents.find(i => i.status !== "resolved")
  const hasActions = remediationActions.length > 0 && !!activeIncident

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [remediationActions])

  const currentAction = 
    remediationActions.find(a => a.id === activeActionId) ||
    remediationActions.find(a => a.status === "executing") ||
    remediationActions.find(a => a.status === "completed") ||
    remediationActions[0]

  const handleExecute = async (actionId: string) => {
    setActiveActionId(actionId)
    await executeRemediation(actionId)
  }

  return (
    <Card className="border border-white/5 bg-[#09090B] rounded-lg">
      <CardContent className="p-5 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
            <h3 className="font-semibold text-sm text-white">
              AI Recovery Action Center
            </h3>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-white/10 bg-white/5 text-[9px] font-mono text-zinc-400 uppercase tracking-wider">
            Auto-Remediation Active
          </div>
        </div>

        {!hasActions ? (
          <div className="flex flex-col items-center justify-center text-center py-8 space-y-2.5 opacity-80">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-xs text-slate-200">SRE Remediation Core Standby</h4>
              <p className="text-[11px] text-zinc-500 max-w-sm">
                No active anomalies requiring remediation. Automated reliability loops nominal.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-0">
            {/* Actions List (left) */}
            <div className="lg:col-span-3 space-y-2.5 overflow-y-auto max-h-[300px] pr-1">
              <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">
                Proposed Remediations
              </div>
              {remediationActions.map((action, i) => {
                const isExecuting = action.status === "executing"
                const isCompleted = action.status === "completed"
                const isSelected = currentAction?.id === action.id
                const isFirst = i === 0

                return (
                  <div
                    key={action.id}
                    onClick={() => setActiveActionId(action.id)}
                    className={`p-3 rounded border transition-all duration-200 flex items-start justify-between gap-4 cursor-pointer relative ${
                      isSelected
                        ? "bg-white/[0.03] border-zinc-700"
                        : "bg-black/10 border-white/5 hover:border-zinc-800"
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {isFirst && !isCompleted && !isExecuting && (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/5 text-[8px] font-mono text-zinc-300 uppercase tracking-wider font-bold">
                            RECOMMENDED
                          </span>
                        )}
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-[8px] font-semibold text-emerald-500 font-mono uppercase">
                            <CheckCircle2 size={8} /> Active
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-xs text-slate-200 truncate">
                        {action.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500 leading-normal">
                        {action.description}
                      </p>
                      
                      {isExecuting && (
                        <div className="space-y-1 mt-2">
                          <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400">
                            <span>Executing configuration upgrade...</span>
                            <span>{action.progress}%</span>
                          </div>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-white transition-all duration-300"
                              style={{ width: `${action.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 pt-0.5">
                      {isCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : isExecuting ? (
                        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleExecute(action.id)
                          }}
                          className={`h-7 px-2.5 text-[10px] gap-1 cursor-pointer transition-all rounded ${
                            isFirst
                              ? "bg-white text-black border-transparent hover:bg-zinc-200"
                              : "border-white/10 hover:bg-white/5 text-zinc-300 hover:text-white"
                          }`}
                        >
                          <Play size={8} className="fill-current" />
                          Execute
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* SRE Terminal logs pane (right) */}
            <div className="lg:col-span-2 flex flex-col rounded border border-white/5 bg-black overflow-hidden min-h-[200px] lg:max-h-[300px]">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 bg-[#09090B]">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-zinc-400" />
                  <span className="font-mono text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Remediation Logs
                  </span>
                </div>
                {currentAction?.status === "executing" && (
                  <span className="text-[8px] font-mono text-zinc-400 animate-pulse uppercase">
                    Streaming
                  </span>
                )}
              </div>
              <div className="flex-1 p-3 font-mono text-[9px] text-zinc-500 overflow-y-auto space-y-1 custom-scrollbar">
                {currentAction ? (
                  <>
                    <div className="text-zinc-600 mb-1 border-b border-white/5 pb-1">
                      Action: {currentAction.title}
                    </div>
                    {currentAction.logs.length === 0 && (
                      <div className="text-zinc-700">
                        [SYS] CLI standby. Click "Execute" to run automated hotfix.
                      </div>
                    )}
                    {currentAction.logs.map((log, index) => {
                      const isRun = log.startsWith("[RUN]")
                      const isErr = log.includes("Error") || log.includes("fail")
                      const isOut = log.startsWith("[OUT]")
                      
                      let color = "text-zinc-500"
                      if (isRun) color = "text-zinc-300"
                      if (isErr) color = "text-red-400"
                      if (isOut) color = "text-zinc-300"
                      
                      return (
                        <div key={index} className={`${color} leading-relaxed break-all`}>
                          {log}
                        </div>
                      )
                    })}
                    {currentAction?.status === "executing" && (
                      <div className="w-1.5 h-3 bg-zinc-500 animate-pulse inline-block mt-0.5"></div>
                    )}
                  </>
                ) : (
                  <div className="text-zinc-700">
                    Trinetra CLI v1.0.4
                    <br />
                    Status: Standby. Listening...
                  </div>
                )}
                <div ref={consoleEndRef} />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
