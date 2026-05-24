"use client"

import { Database, Bot, Zap, ShieldCheck, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTelemetry } from "@/lib/telemetry-store"
import type { FailureScenario } from "@/lib/types"

const scenarios: { id: FailureScenario; label: string; icon: React.ReactNode; description: string }[] = [
  { id: "database", label: "Database Failure",  icon: <Database size={14} />,      description: "Exhaust connection pool on pg-cluster-prod" },
  { id: "openai",   label: "AI Timeout",        icon: <Bot size={14} />,           description: "Simulate upstream AI provider timeouts" },
  { id: "traffic",  label: "Traffic Spike",      icon: <Zap size={14} />,           description: "3x traffic surge across all services" },
  { id: "auth",     label: "Auth Failures",      icon: <AlertTriangle size={14} />, description: "JWT verification failures on auth-service" },
]

export function SimulationControls() {
  const { simulateFailure, recoverSystem, activeFailures } = useTelemetry()

  return (
    <div className="flex flex-wrap items-center gap-2">
      {scenarios.map(s => {
        const isActive = activeFailures.has(s.id)
        return (
          <Button
            key={s.id}
            variant={isActive ? "destructive" : "outline"}
            size="sm"
            className={`text-xs gap-1.5 transition-all duration-300 ${
              isActive ? "shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse" : ""
            }`}
            onClick={() => simulateFailure(s.id)}
            title={s.description}
          >
            {s.icon}
            {s.label}
            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping ml-1"></span>}
          </Button>
        )
      })}
      <Button
        variant="default"
        size="sm"
        className="text-xs gap-1.5"
        onClick={recoverSystem}
      >
        <ShieldCheck size={14} />
        Recover System
      </Button>
    </div>
  )
}
