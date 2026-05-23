"use client"

import { Activity, Clock, Server, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useTelemetry } from "@/lib/telemetry-store"

export function HeroMetrics() {
  const { metrics } = useTelemetry()

  const cards = [
    {
      title: "System Health",
      value: `${metrics.systemHealth.toFixed(2)}%`,
      change: `${(metrics.systemHealth - metrics.prevSystemHealth) >= 0 ? '+' : ''}${(metrics.systemHealth - metrics.prevSystemHealth).toFixed(2)}%`,
      trend: metrics.systemHealth >= metrics.prevSystemHealth ? "up" : "down",
      icon: <Activity className="w-3.5 h-3.5 text-zinc-400" />,
      critical: metrics.systemHealth < 90,
    },
    {
      title: "API Requests/min",
      value: metrics.requestsPerMin.toLocaleString(),
      change: `${(metrics.requestsPerMin - metrics.prevRequestsPerMin) >= 0 ? '+' : ''}${((metrics.requestsPerMin - metrics.prevRequestsPerMin) / Math.max(metrics.prevRequestsPerMin, 1) * 100).toFixed(1)}%`,
      trend: metrics.requestsPerMin >= metrics.prevRequestsPerMin ? "up" : "down",
      icon: <Zap className="w-3.5 h-3.5 text-zinc-400" />,
    },
    {
      title: "Avg Latency",
      value: `${metrics.avgLatencyMs}ms`,
      change: `${(metrics.avgLatencyMs - metrics.prevAvgLatencyMs) >= 0 ? '+' : ''}${metrics.avgLatencyMs - metrics.prevAvgLatencyMs}ms`,
      trend: metrics.avgLatencyMs <= metrics.prevAvgLatencyMs ? "down" : "up",
      icon: <Clock className="w-3.5 h-3.5 text-zinc-400" />,
      critical: metrics.avgLatencyMs > 500,
    },
    {
      title: "Error Rate",
      value: `${metrics.errorRate.toFixed(2)}%`,
      change: `${(metrics.errorRate - metrics.prevErrorRate) >= 0 ? '+' : ''}${(metrics.errorRate - metrics.prevErrorRate).toFixed(2)}%`,
      trend: metrics.errorRate <= metrics.prevErrorRate ? "down" : "up",
      icon: <Server className="w-3.5 h-3.5 text-zinc-400" />,
      isErrorMetric: true,
      critical: metrics.errorRate > 5,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const isGood =
          (card.isErrorMetric && card.trend === "down") ||
          (!card.isErrorMetric && card.title === "Avg Latency" && card.trend === "down") ||
          (!card.isErrorMetric && card.title !== "Avg Latency" && card.trend === "up")

        return (
          <Card
            key={i}
            className={`bg-[#09090B] border shadow-[0_1px_3px_rgba(0,0,0,0.6)] rounded-lg transition-all duration-300 ${
              card.critical
                ? "border-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.02)]"
                : "border-white/[0.04] hover:border-white/[0.08]"
            }`}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <span className="text-zinc-650">
                  {card.icon}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <h2 className={`text-2xl font-light font-mono tracking-tight ${card.critical ? 'text-red-400' : 'text-white'}`}>
                  {card.value}
                </h2>
              </div>

              <div className="mt-2.5 flex items-center gap-1.5 text-[9px] font-mono">
                <span className={`font-semibold ${isGood ? "text-zinc-400" : card.critical ? "text-red-400" : "text-amber-500"}`}>
                  {card.change}
                </span>
                <span className="text-zinc-600">vs prev</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
