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
      <aside className="w-56 flex flex-col hidden md:flex border-r border-white/[0.03] bg-[#070709] relative z-20">
        <div className="h-16 flex items-center px-6 border-b border-white/[0.03]">
          <div className="flex items-center gap-3 text-white font-medium tracking-tight cursor-pointer" onClick={() => setActiveTab("overview")}>
            <div className="w-6 h-6 flex items-center justify-center relative rounded overflow-hidden">
              <img src="/Logo.png" alt="Trinetra Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold tracking-tight text-white text-xs uppercase tracking-wider font-mono">Trinetra AI</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-0.5">
          <NavItem 
            icon={<LayoutDashboard size={13} />} 
            label="Overview" 
            active={activeTab === "overview"} 
            onClick={() => setActiveTab("overview")} 
          />
          <NavItem 
            icon={<TriangleAlert size={13} />} 
            label="Incidents" 
            badge={activeIncidentCount > 0 ? String(activeIncidentCount) : undefined} 
            active={activeTab === "incidents"} 
            onClick={() => setActiveTab("incidents")} 
          />
          <NavItem 
            icon={<Sparkles size={13} />} 
            label="AI Insights" 
            active={activeTab === "ai"} 
            onClick={() => setActiveTab("ai")} 
          />
          <NavItem 
            icon={<Activity size={13} />} 
            label="Recovery" 
            active={activeTab === "recovery"} 
            onClick={() => setActiveTab("recovery")} 
          />
          <NavItem 
            icon={<BarChart3 size={13} />} 
            label="Monitoring" 
            active={activeTab === "monitoring"} 
            onClick={() => setActiveTab("monitoring")} 
          />
          <NavItem 
            id="sdk-nav"
            icon={<TerminalSquare size={13} />} 
            label="SDK" 
            active={activeTab === "sdk"} 
            onClick={() => setActiveTab("sdk")} 
          />
        </div>

        <div className="p-3 border-t border-white/[0.03]">
          <NavItem 
            icon={<Settings size={13} />} 
            label="Settings" 
            active={activeTab === "settings"} 
            onClick={() => setActiveTab("settings")} 
          />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full relative z-10 bg-[#050507]">
        {/* TOPBAR */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-white/[0.03] bg-[#070709]/60 backdrop-blur-md">
          <div className="flex items-center gap-3.5 flex-1">
            {/* Project/Cluster Selector */}
            <button className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/60 border border-white/[0.03] hover:border-white/[0.08] transition-all text-zinc-400 hover:text-white font-mono cursor-pointer text-[9px] shrink-0 uppercase tracking-wider">
              prod-cluster
              <ChevronDown size={8} className="text-zinc-650" />
            </button>

            {/* Softened Search Bar */}
            <div className="relative hidden lg:flex items-center shrink-0">
              <Search className="absolute left-2.5 w-3 h-3 text-zinc-550" />
              <input
                type="text"
                placeholder="Search..."
                className="w-40 h-6.5 bg-black/40 border border-white/[0.03] focus:border-white/[0.06] rounded px-8 text-[10px] text-zinc-300 placeholder:text-zinc-600 outline-none transition-all"
              />
              <div className="absolute right-2.5 flex items-center gap-0.5 text-[7px] font-mono text-zinc-650">
                <span>⌘K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* System Health Capsule Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.03] bg-black text-[9px] font-mono tracking-wide">
              <span className={`w-1 h-1 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
              <span className="text-zinc-400 font-medium uppercase text-[8px] tracking-wider">
                {isHealthy ? "Nominal" : `Degraded`}
              </span>
            </div>

            {/* User Avatar */}
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-7 h-7 rounded-full border border-white/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.8)] overflow-hidden group-hover:border-white/[0.15] transition-colors relative">
                <img src="/profile pic.jpeg" alt="KR" className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] font-mono font-medium text-zinc-400 group-hover:text-white transition-colors">KR</span>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#050507]">
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
  id?: string
}

function NavItem({ icon, label, active, badge, onClick, id }: NavItemProps) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-[11px] font-mono uppercase tracking-wider transition-all cursor-pointer group ${
        active
          ? "bg-white/[0.04] text-white font-semibold border border-white/[0.08] shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
          : "text-zinc-400 hover:bg-white/[0.02] hover:text-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`transition-colors duration-200 flex items-center justify-center ${active ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"} [&>svg]:w-4 [&>svg]:h-4`}>
          {icon}
        </span>
        <span className="tracking-wide text-zinc-300 group-hover:text-white">
          {label}
        </span>
      </div>
      {badge && (
        <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[7px] font-mono font-bold border border-red-500/20">
          {badge}
        </span>
      )}
    </button>
  )
}
