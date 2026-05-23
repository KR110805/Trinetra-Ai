"use client"

import { useTelemetry } from "@/lib/telemetry-store"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldAlert, CheckCircle2, DollarSign, Clock, Layout } from "lucide-react"

export function ExecutiveSummary() {
  const { incidents, activeScenario } = useTelemetry()

  const activeIncident = incidents.find(i => i.status !== "resolved")

  const getImpactDetails = () => {
    if (!activeIncident) {
      return {
        status: "OPERATIONAL",
        impact: "SLA compliant",
        affected: "None",
        eta: "N/A",
        revenueRisk: "$0.00 at risk",
        severityColor: "text-zinc-550 border-white/[0.04] bg-white/[0.01]",
      }
    }

    if (activeScenario === "database_exhaustion") {
      return {
        status: "DB CLUSTER SATURATION",
        impact: "Checkout route blocked; payment validation timeouts triggering (HTTP 500/503).",
        affected: "payment-service ➔ pg-database",
        eta: "~3.5 minutes following Connection Pool fix",
        revenueRisk: "Est. $18.4k/hr revenue risk (340 users impacted)",
        severityColor: "text-red-400 border-red-500/10 bg-red-500/5 animate-pulse",
      }
    }

    if (activeScenario === "openai_meltdown") {
      return {
        status: "UPSTREAM AI PROVIDER OUTAGE",
        impact: "AI completion endpoints timing out; model gateway rate limits triggering (429).",
        affected: "openai-proxy ➔ model-provider-node",
        eta: "Immediate on fallback route switch",
        revenueRisk: "AI autocomplete rate limits (120 users impacted/min)",
        severityColor: "text-amber-400 border-amber-500/10 bg-amber-500/5 animate-pulse",
      }
    }

    if (activeScenario === "traffic_surge") {
      return {
        status: "TRAFFIC SPIKE CASCADE",
        impact: "Ingress request burst saturating gateway thread buffers. Queue backpressure climbing.",
        affected: "gateway ➔ order-service ➔ order-queue",
        eta: "~5.0 minutes on traffic throttling activation",
        revenueRisk: "12% queue drop risk ($6.5k billing backlog)",
        severityColor: "text-blue-400 border-blue-500/10 bg-blue-500/5 animate-pulse",
      }
    }

    if (activeScenario === "auth_storm") {
      return {
        status: "JWT AUTHENTICATION STORM",
        impact: "All verified endpoints rejecting user sessions with JWT signature mismatches.",
        affected: "auth-service ➔ signature-verification",
        eta: "~2.0 minutes after configuration rollback",
        revenueRisk: "100% of user logins blocked (SLA violation risk)",
        severityColor: "text-purple-400 border-purple-500/10 bg-purple-500/5 animate-pulse",
      }
    }

    return {
      status: "GENERAL SYSTEM ANOMALY",
      impact: activeIncident.description,
      affected: `${activeIncident.service} ➔ ${activeIncident.affectedRoute}`,
      eta: "Investigating via auto-remediation",
      revenueRisk: "Elevated response thresholds (SLA breach risk)",
      severityColor: "text-amber-400 border-amber-500/10 bg-amber-500/5 animate-pulse",
    }
  }

  const details = getImpactDetails()

  return (
    <Card className="border border-white/[0.04] bg-[#09090B] shadow-[0_1px_3px_rgba(0,0,0,0.6)] rounded-lg">
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-white/[0.04]">
            <div className="flex items-center gap-1.5">
              {activeIncident ? (
                <ShieldAlert className="w-3.5 h-3.5 text-zinc-500" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
              )}
              <h3 className="font-mono text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                Executive Summary
              </h3>
            </div>
            
            <div className={`px-2 py-0.5 rounded text-[8px] font-mono border uppercase tracking-wider font-semibold ${details.severityColor}`}>
              {activeIncident ? activeIncident.severity : "Normal"}
            </div>
          </div>

          {/* System State Description */}
          <div className="space-y-3.5">
            <div>
              <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-mono font-semibold">Active State</div>
              <p className="text-xs font-semibold text-zinc-300 mt-0.5 font-mono">{details.status}</p>
            </div>

            <div>
              <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-mono font-semibold">Impact Estimate</div>
              <p className="text-[11px] text-zinc-400 leading-normal mt-0.5">{details.impact}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3.5 border-t border-white/[0.04]">
              <div className="flex items-start gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-zinc-650 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[9px] text-zinc-500 uppercase font-mono font-semibold">Risk Index</div>
                  <div className="text-[10px] font-semibold text-zinc-300 font-mono mt-0.5">{details.revenueRisk}</div>
                </div>
              </div>

              <div className="flex items-start gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-650 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[9px] text-zinc-500 uppercase font-mono font-semibold">Recovery ETA</div>
                  <div className="text-[10px] font-semibold text-zinc-300 font-mono mt-0.5">{details.eta}</div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-1.5 pt-3.5 border-t border-white/[0.04]">
              <Layout className="w-3.5 h-3.5 text-zinc-650 mt-0.5 shrink-0" />
              <div>
                <div className="text-[9px] text-zinc-500 uppercase font-mono font-semibold">Dependency Node</div>
                <div className="text-[10px] font-mono text-zinc-400 mt-0.5 truncate max-w-[200px]">{details.affected}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
