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
    <div className="flex h-screen w-full bg-[#050507] overflow-hidden text-sm selection:bg-white selection:text-black">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 flex flex-col hidden md:flex border-r border-white/[0.04] bg-[#070709] relative z-20">
        <div className="h-16 flex items-center px-6 border-b border-white/[0.04]">
          <div className="flex items-center gap-3 text-white font-medium text-sm tracking-tight cursor-pointer" onClick={() => setActiveTab("overview")}>
            <div className="w-5.5 h-5.5 rounded bg-white flex items-center justify-center text-black font-bold text-[10px]">
              T
            </div>
            <span className="font-semibold tracking-tight text-white text-xs uppercase tracking-wider font-mono">Trinetra AI</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <NavItem 
            icon={<LayoutDashboard size={14} />} 
            label="Overview" 
            active={activeTab === "overview"} 
            onClick={() => setActiveTab("overview")} 
          />
          <NavItem 
            icon={<TriangleAlert size={14} />} 
            label="Incidents" 
            badge={activeIncidentCount > 0 ? String(activeIncidentCount) : undefined} 
            active={activeTab === "incidents"} 
            onClick={() => setActiveTab("incidents")} 
          />
          <NavItem 
            icon={<Sparkles size={14} />} 
            label="AI Insights" 
            active={activeTab === "ai"} 
            onClick={() => setActiveTab("ai")} 
          />
          <NavItem 
            icon={<Activity size={14} />} 
            label="Recovery" 
            active={activeTab === "recovery"} 
            onClick={() => setActiveTab("recovery")} 
          />
          <NavItem 
            icon={<BarChart3 size={14} />} 
            label="Monitoring" 
            active={activeTab === "monitoring"} 
            onClick={() => setActiveTab("monitoring")} 
          />
        </div>

        <div className="p-4 border-t border-white/[0.04]">
          <NavItem 
            icon={<Settings size={14} />} 
            label="Settings" 
            active={activeTab === "settings"} 
            onClick={() => setActiveTab("settings")} 
          />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full relative z-10 bg-[#050507]">
        {/* TOPBAR */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/[0.04] bg-[#070709]/80 backdrop-blur-md">
          <div className="flex items-center gap-4 flex-1">
            {/* Project Selector */}
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-black border border-white/[0.04] hover:border-white/[0.1] transition-all text-zinc-400 hover:text-white font-mono cursor-pointer text-[10px] shrink-0 uppercase tracking-wider">
              prod-cluster
              <ChevronDown size={10} className="text-zinc-600" />
            </button>

            {/* Softened Search Bar */}
            <div className="relative hidden lg:flex items-center shrink-0">
              <Search className="absolute left-2.5 w-3 h-3 text-zinc-500" />
              <input
                type="text"
                placeholder="Search..."
                className="w-44 h-7.5 bg-black border border-white/[0.04] focus:border-white/[0.08] rounded px-8 text-[11px] text-zinc-300 placeholder:text-zinc-600 outline-none transition-all"
              />
              <div className="absolute right-2.5 flex items-center gap-0.5 text-[8px] font-mono text-zinc-600">
                <span>⌘K</span>
              </div>
            </div>

            {/* Persistent SRE Operational Status Strip */}
            <div className="hidden xl:flex items-center gap-5 px-5 border-l border-white/[0.04] text-[9px] font-mono text-zinc-500 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-600 uppercase">CLUSTER:</span>
                <span className="text-zinc-300 font-medium">prod-us-east-1</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-zinc-900"></div>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-600 uppercase">SLA STABILITY:</span>
                <span className="text-zinc-300 font-medium">
                  {metrics.systemHealth > 98 && activeIncidentCount === 0 ? "99.98%" : `${metrics.systemHealth.toFixed(2)}%`}
                </span>
              </div>
              <div className="w-1 h-1 rounded-full bg-zinc-900"></div>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-600 uppercase">AUTOPILOT:</span>
                <span className="text-zinc-300 font-medium">{aiConfidenceScore}%</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-zinc-900"></div>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-600 uppercase">OUTAGES:</span>
                <span className={`font-semibold ${activeIncidentCount > 0 ? "text-red-400 animate-pulse" : "text-zinc-400"}`}>
                  {activeIncidentCount}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 shrink-0">
            {/* System Health Capsule Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.04] bg-black text-[10px] font-mono tracking-wide">
              <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
              <span className="text-zinc-400 font-medium uppercase text-[9px] tracking-wider">
                {isHealthy ? "Nominal Operations" : `Degraded (${metrics.systemHealth.toFixed(1)}%)`}
              </span>
            </div>

            {/* Notifications */}
            <button className="relative text-zinc-500 hover:text-white transition-colors cursor-pointer p-1.5 rounded hover:bg-white/[0.02]">
              <Bell size={15} />
              {activeIncidentCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-black"></span>
              )}
            </button>

            {/* User Avatar */}
            <div className="w-6.5 h-6.5 rounded bg-zinc-900 border border-white/[0.04] hover:bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white text-[9px] font-mono font-medium cursor-pointer transition-colors">
              KR
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-10 bg-[#050507]">
          <div className="max-w-7xl mx-auto space-y-10">
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
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer group ${
        active
          ? "bg-white/[0.03] text-white font-medium border border-white/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
          : "text-zinc-400 hover:bg-white/[0.01] hover:text-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`transition-colors duration-200 ${active ? "text-white" : "text-zinc-600 group-hover:text-zinc-400"}`}>
          {icon}
        </span>
        <span className="tracking-wide">
          {label}
        </span>
      </div>
      {badge && (
        <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[8px] font-mono font-bold border border-red-500/20">
          {badge}
        </span>
      )}
    </button>
  )
}
