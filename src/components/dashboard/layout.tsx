"use client"

import React from "react"
import {
  Activity,
  BarChart3,
  Bell,
  Box,
  ChevronDown,
  LayoutDashboard,
  Search,
  Settings,
  Sparkles,
  TerminalSquare,
  TriangleAlert
} from "lucide-react"
import { useTelemetry } from "@/lib/telemetry-store"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { metrics, activeIncidentCount, activeTab, setActiveTab, aiConfidenceScore } = useTelemetry()

  const isHealthy = metrics.systemHealth > 90

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden text-sm selection:bg-white selection:text-black">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 flex flex-col hidden md:flex border-r border-[#1f1f23] bg-black relative z-20">
        <div className="h-16 flex items-center px-6 border-b border-[#1f1f23]">
          <div className="flex items-center gap-2.5 text-white font-medium text-sm tracking-tight cursor-pointer" onClick={() => setActiveTab("overview")}>
            <div className="w-6 h-6 rounded bg-white flex items-center justify-center text-black font-semibold text-xs">
              T
            </div>
            <span className="font-semibold tracking-tight text-white">Trinetra AI</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
          <NavItem 
            icon={<LayoutDashboard size={15} />} 
            label="Overview" 
            active={activeTab === "overview"} 
            onClick={() => setActiveTab("overview")} 
          />
          <NavItem 
            icon={<TriangleAlert size={15} />} 
            label="Incidents" 
            badge={activeIncidentCount > 0 ? String(activeIncidentCount) : undefined} 
            active={activeTab === "incidents"} 
            onClick={() => setActiveTab("incidents")} 
          />
          <NavItem 
            icon={<Sparkles size={15} />} 
            label="AI Insights" 
            active={activeTab === "ai"} 
            onClick={() => setActiveTab("ai")} 
          />
          <NavItem 
            icon={<Activity size={15} />} 
            label="Recovery" 
            active={activeTab === "recovery"} 
            onClick={() => setActiveTab("recovery")} 
          />
          <NavItem 
            icon={<BarChart3 size={15} />} 
            label="Monitoring" 
            active={activeTab === "monitoring"} 
            onClick={() => setActiveTab("monitoring")} 
          />
        </div>

        <div className="p-4 border-t border-[#1f1f23]">
          <NavItem 
            icon={<Settings size={15} />} 
            label="Settings" 
            active={activeTab === "settings"} 
            onClick={() => setActiveTab("settings")} 
          />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full relative z-10 bg-[#060608]">
        {/* TOPBAR */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-[#1f1f23] bg-black/60 backdrop-blur-md">
          <div className="flex items-center gap-4 flex-1">
            {/* Project Selector */}
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-white font-medium cursor-pointer text-xs border border-zinc-900 shrink-0">
              prod-cluster
              <ChevronDown size={11} className="text-zinc-600" />
            </button>

            {/* Softened Search Bar */}
            <div className="relative hidden lg:flex items-center shrink-0">
              <Search className="absolute left-2.5 w-3 h-3 text-zinc-600" />
              <input
                type="text"
                placeholder="Search..."
                className="w-48 h-8 bg-zinc-950/20 border border-zinc-900/60 focus:border-zinc-800 rounded-md px-8 text-xs text-zinc-300 placeholder:text-zinc-700 outline-none transition-all"
              />
              <div className="absolute right-2.5 flex items-center gap-0.5 text-[8px] font-mono text-zinc-700">
                <span>⌘K</span>
              </div>
            </div>

            {/* Persistent SRE Operational Status Strip */}
            <div className="hidden xl:flex items-center gap-5 px-5 border-l border-zinc-900/80 text-[10px] font-mono text-zinc-500 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-600">CLUSTER:</span>
                <span className="text-zinc-300">prod-us-east-1</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-zinc-900"></div>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-600">SLA STABILITY:</span>
                <span className="text-zinc-300">
                  {metrics.systemHealth > 98 && activeIncidentCount === 0 ? "99.98%" : `${metrics.systemHealth.toFixed(2)}%`}
                </span>
              </div>
              <div className="w-1 h-1 rounded-full bg-zinc-900"></div>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-600">AUTOPILOT CERTAINTY:</span>
                <span className="text-zinc-300">{aiConfidenceScore}%</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-zinc-900"></div>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-600">OUTAGES:</span>
                <span className={`font-semibold ${activeIncidentCount > 0 ? "text-red-400" : "text-zinc-400"}`}>
                  {activeIncidentCount}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 shrink-0">
            {/* System Health Dot Badge */}
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></span>
              <span className="font-medium text-zinc-400">
                {isHealthy ? "Nominal Operations" : `System Degraded (${metrics.systemHealth.toFixed(1)}%)`}
              </span>
            </div>

            {/* Notifications */}
            <button className="relative text-zinc-500 hover:text-white transition-colors cursor-pointer p-1.5 rounded hover:bg-zinc-900">
              <Bell size={16} />
              {activeIncidentCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-black"></span>
              )}
            </button>

            {/* User Avatar */}
            <div className="w-7 h-7 rounded-full bg-zinc-800/40 hover:bg-zinc-700 border border-zinc-850 flex items-center justify-center text-white text-[10px] font-semibold cursor-pointer transition-colors">
              KR
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-10 bg-[#060608]">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

interface NavItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  badge?: string
  onClick?: () => void
}

function NavItem({ icon, label, active, badge, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs transition-all cursor-pointer group ${
        active
          ? "bg-zinc-900 text-white font-medium border border-zinc-800/80 shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
          : "text-zinc-400 hover:bg-zinc-900/40 hover:text-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`transition-colors ${active ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"}`}>
          {icon}
        </span>
        <span className="tracking-wide">
          {label}
        </span>
      </div>
      {badge && (
        <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[9px] font-mono font-bold border border-red-500/20">
          {badge}
        </span>
      )}
    </button>
  )
}
