"use client"

import { useTelemetry } from "@/lib/telemetry-store"
import { Card, CardContent } from "@/components/ui/card"
import { Activity, Globe, Cpu } from "lucide-react"

export function ServiceMeshStatus() {
  const { activeFailures } = useTelemetry()

  const services = [
    {
      name: "API Gateway",
      tag: "gateway",
      status: activeFailures.has("traffic") ? "degraded" : "nominal",
      desc: activeFailures.has("traffic") ? "Queue overload" : "nominal",
      latency: activeFailures.has("traffic") ? "245ms" : "2ms",
    },
    {
      name: "Auth Service",
      tag: "auth-service",
      status: activeFailures.has("auth") ? "critical" : "nominal",
      desc: activeFailures.has("auth") ? "JWT verification" : "nominal",
      latency: activeFailures.has("auth") ? "15ms" : "15ms",
    },
    {
      name: "Payment Service",
      tag: "payment-service",
      status: activeFailures.has("database") ? "critical" : "nominal",
      desc: activeFailures.has("database") ? "Pool exhausted" : "nominal",
      latency: activeFailures.has("database") ? "4200ms" : "120ms",
    },
    {
      name: "LLM Gateway",
      tag: "llm-gateway",
      status: activeFailures.has("openai") ? "critical" : "nominal",
      desc: activeFailures.has("openai") ? "Rate limit (429)" : "nominal",
      latency: activeFailures.has("openai") ? "32500ms" : "800ms",
    },
    {
      name: "Order Service",
      tag: "order-service",
      status: activeFailures.has("database") ? "degraded" : activeFailures.has("traffic") ? "degraded" : "nominal",
      desc: activeFailures.has("database") ? "DB Pool saturated" : activeFailures.has("traffic") ? "Elevated" : "nominal",
      latency: activeFailures.has("database") ? "2400ms" : activeFailures.has("traffic") ? "220ms" : "90ms",
    },
    {
      name: "Catalog Service",
      tag: "catalog-service",
      status: "nominal",
      desc: "nominal",
      latency: "35ms",
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-500"
      case "degraded":
        return "bg-amber-500"
      default:
        return "bg-zinc-650"
    }
  }

  return (
    <Card className="border border-white/[0.04] bg-[#09090B] shadow-[0_1px_3px_rgba(0,0,0,0.6)] rounded-lg">
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-1.5 mb-4 pb-2 border-b border-white/[0.04]">
            <Activity className="w-3.5 h-3.5 text-zinc-500" />
            <h3 className="font-mono text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
              Service Mesh Status
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {services.map((svc) => {
              const color = getStatusColor(svc.status)
              return (
                <div
                  key={svc.tag}
                  className="flex flex-col p-2.5 rounded border border-white/[0.03] bg-black"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-300 text-xs truncate mr-2 font-mono">{svc.name}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
                  </div>
                  <span className="text-[9px] text-zinc-600 font-mono mt-0.5 truncate">{svc.desc}</span>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/[0.03]">
                    <span className="text-[9px] text-zinc-650 font-mono">LATENCY</span>
                    <span className={`text-[9px] font-mono font-medium ${svc.status === "nominal" ? "text-zinc-500" : "text-amber-500"}`}>
                      {svc.latency}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function RegionConfidenceStatus() {
  const { activeFailures, metrics, aiConfidenceScore } = useTelemetry()

  const isAnyActiveIncident = activeFailures.size > 0
  const regions = [
    { name: "US-East (Virginia)", health: isAnyActiveIncident ? `${metrics.systemHealth.toFixed(1)}%` : "99.9%", status: isAnyActiveIncident ? "degraded" : "healthy" },
    { name: "US-West (Oregon)", health: "99.9%", status: "healthy" },
    { name: "EU-Central (Frankfurt)", health: "100.0%", status: "healthy" },
    { name: "AP-South (Mumbai)", health: "99.9%", status: "healthy" }
  ]

  return (
    <Card className="border border-white/[0.04] bg-[#09090B] shadow-[0_1px_3px_rgba(0,0,0,0.6)] rounded-lg">
      <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
        
        {/* AI Confidence Meter */}
        <div className="flex items-center justify-between border-b border-white/[0.04] pb-2.5">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-zinc-500" />
            <h3 className="font-mono text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
              AI Confidence Score
            </h3>
          </div>
          <span className="text-sm font-semibold text-white font-mono">{aiConfidenceScore}%</span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500 text-[9px] font-mono uppercase font-semibold">Remediation Certainty</span>
            <span className="font-mono text-zinc-400 text-[8px] font-bold">
              {aiConfidenceScore > 90 ? "OPTIMAL" : "DEGRADED"}
            </span>
          </div>
          <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden border border-white/[0.02]">
            <div 
              className="h-full bg-white transition-all duration-700"
              style={{ width: `${aiConfidenceScore}%` }}
            ></div>
          </div>
          <p className="text-[9px] font-mono text-zinc-600 leading-normal mt-1.5">
            {aiConfidenceScore > 90 
              ? "Telemetry signals clear. Auto-pilot operations online." 
              : "Active anomaly detected. AI evaluating mitigation parameters."}
          </p>
        </div>

        {/* Regional Health Nodes */}
        <div className="space-y-2 pt-3.5 border-t border-white/[0.04]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Globe className="w-3 h-3 text-zinc-650" />
            <span className="text-[9px] font-mono font-semibold text-zinc-550 uppercase tracking-wider">Region Clusters</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {regions.map((reg) => (
              <div key={reg.name} className="flex items-center justify-between bg-black p-2 rounded border border-white/[0.03]">
                <span className="text-[9px] text-zinc-500 font-mono truncate mr-2">{reg.name.split(" ")[0]}</span>
                <span className={`font-mono text-[9px] font-semibold ${reg.status === "healthy" ? "text-zinc-550" : "text-red-400 animate-pulse"}`}>
                  {reg.health}
                </span>
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
