"use client"

import React, { useState } from "react"
import { useTelemetry } from "@/lib/telemetry-store"
import {
  Activity,
  ArrowRight,
  Check,
  Copy,
  Database,
  Download,
  FileCode,
  Globe,
  LayoutGrid,
  Lock,
  MessageSquare,
  Network,
  Radio,
  Server,
  Sparkles,
  Terminal
} from "lucide-react"

export function SdkView() {
  const { connectedApps } = useTelemetry()
  
  // Clipboard copied states
  const [copiedCDN, setCopiedCDN] = useState(false)
  const [copiedStep1, setCopiedStep1] = useState(false)
  const [copiedStep2, setCopiedStep2] = useState(false)
  const [copiedStep3, setCopiedStep3] = useState(false)
  const [copiedStep4, setCopiedStep4] = useState(false)

  const handleCopy = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const cdnSnippet = `<script src="https://trinetra-ai-ten.vercel.app/js/trinetra.js"></script>`

  const step1Code = `<script src="/js/trinetra.js"></script>`
  
  const step2Code = `Trinetra.init({
  endpoint: "https://trinetra-ai-ten.vercel.app/api/telemetry",
  projectName: "Nagrik AI"
})`

  const step3Code = `Trinetra.captureRequest({
  route: "/chat",
  method: "POST",
  status: 200,
  latency: 320,
  service: "gemini"
})`

  const step4Code = `Trinetra.captureError(error)`

  return (
    <div className="space-y-16 animate-in fade-in duration-500 pb-16">
      {/* Custom Styles for Subtle Pulse Flow Animation and Custom Grid patterns */}
      <style>{`
        @keyframes pulse-flow {
          0% { transform: translateX(-10%); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateX(110%); opacity: 0; }
        }
        .pulse-particle {
          animation: pulse-flow 3s infinite linear;
        }
        .pulse-particle-delayed {
          animation: pulse-flow 3s infinite linear;
          animation-delay: 1.5s;
        }
        .grid-mask {
          mask-image: radial-gradient(ellipse at center, black, transparent 70%);
        }
      `}</style>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden border border-white/[0.03] bg-[#070709] rounded-2xl py-16 px-6 lg:px-12 shadow-[0_1px_4px_rgba(0,0,0,0.7)] flex flex-col items-center text-center">
        {/* Visual background decoration */}
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none grid-mask select-none bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Subtle monochrome glowing center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-zinc-950/40 rounded-full blur-[120px] pointer-events-none z-0"></div>

        {/* Floating Glowing Code Decors behind Content */}
        <div className="absolute -right-16 top-6 opacity-[0.03] font-mono text-[9px] text-white text-left select-none pointer-events-none hidden lg:block z-0">
          <pre>{`Trinetra.init({
  endpoint: "/api/telemetry",
  projectName: "Core Service"
});
Trinetra.captureRequest({
  route: "/metrics",
  latency: 120
});`}</pre>
        </div>
        <div className="absolute -left-16 bottom-6 opacity-[0.03] font-mono text-[9px] text-white text-left select-none pointer-events-none hidden lg:block z-0">
          <pre>{`Trinetra.captureError(new Error("Database connection timeout"));`}</pre>
        </div>

        <div className="relative z-10 space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.04] text-[9px] font-mono tracking-widest text-zinc-400 uppercase">
            <Sparkles className="w-2.5 h-2.5 text-zinc-400" />
            Active Observability
          </div>
          
          <h1 className="text-3xl lg:text-4xl font-light text-white tracking-tight leading-tight">
            Connect Any Application <br className="hidden sm:inline" />
            <span className="font-semibold">to Trinetra</span>
          </h1>
          
          <p className="text-xs lg:text-sm text-zinc-400 leading-relaxed font-sans max-w-lg mx-auto">
            Stream real-time telemetry, monitor incidents, and enable AI-powered observability in minutes. Zero configurations required.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-3.5 pt-4">
            <a
              href="#download-card"
              className="bg-white hover:bg-zinc-200 text-black font-semibold font-mono text-[10px] uppercase tracking-wider px-5 py-3 rounded-lg cursor-pointer transition-colors shadow-sm"
            >
              Download SDK
            </a>
            <a
              href="#integration-guide"
              className="bg-[#0c0c0e] hover:bg-[#141417] text-zinc-300 hover:text-white font-mono text-[10px] border border-white/[0.04] hover:border-white/[0.1] uppercase tracking-wider px-5 py-3 rounded-lg cursor-pointer transition-all"
            >
              View Integration Guide
            </a>
          </div>
        </div>
      </section>

      {/* DOWNLOAD SECTION */}
      <section id="download-card" className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        <div className="lg:col-span-2 border border-white/[0.04] bg-[#09090B] rounded-xl p-6 lg:p-8 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-white">
                  <FileCode className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">trinetra.js</h3>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Standalone client observability package</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-white/[0.02] text-zinc-400 border border-white/[0.04] text-[8px] font-mono uppercase tracking-wider font-semibold">
                lightweight bundle
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Latest Version</span>
                <span className="text-xs font-mono text-white font-semibold">v1.2.0-beta</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Bundle Size</span>
                <span className="text-xs font-mono text-white font-semibold">&lt; 1.2 KB (gzipped)</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Browser Support</span>
                <span className="text-xs font-mono text-white font-semibold">Chrome, Safari, Firefox</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">License</span>
                <span className="text-xs font-mono text-white font-semibold">MIT License</span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed pt-2">
              Integrated cleanly as a standard global script, <code className="font-mono text-white px-1 py-0.5 bg-black rounded text-[10px]">trinetra.js</code> acts as a thin operational bridge. It captures unhandled dashboard promises and requests silently, and pipes telemetry packets via CORS asynchronously.
            </p>
          </div>

          <div className="pt-6 border-t border-white/[0.04] mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex-1 max-w-md bg-black rounded-lg border border-white/[0.04] px-4 py-2 flex items-center justify-between font-mono text-[9px] text-zinc-400">
              <span className="truncate mr-4">{cdnSnippet}</span>
              <button
                onClick={() => handleCopy(cdnSnippet, setCopiedCDN)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                title="Copy CDN snippet"
              >
                {copiedCDN ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            
            <a
              href="/js/trinetra.js"
              download="trinetra.js"
              className="bg-white hover:bg-zinc-200 text-black text-[10px] font-bold uppercase tracking-wider py-3 px-6 rounded-lg text-center flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm font-mono shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Download trinetra.js
            </a>
          </div>
        </div>

        {/* Developer summary info */}
        <div className="lg:col-span-1 border border-white/[0.04] bg-[#09090B] rounded-xl p-6 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
          <div className="space-y-4">
            <h4 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest border-b border-white/[0.04] pb-2">
              SDK Capabilities
            </h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-2.5 text-xs text-zinc-400">
                <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">✓</div>
                <div>
                  <span className="text-zinc-200 font-medium block">Automatic Error Catching</span>
                  Listens to <code className="text-[9px] font-mono">window.onerror</code> triggers automatically.
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-zinc-400">
                <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">✓</div>
                <div>
                  <span className="text-zinc-200 font-medium block">CORS Multi-Origin Telemetry</span>
                  Stream data securely without proxying endpoints.
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-zinc-400">
                <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">✓</div>
                <div>
                  <span className="text-zinc-200 font-medium block">Non-Blocking Queueing</span>
                  Uses asynchronous worker fetch cycles to prevent page thread blocking.
                </div>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-white/[0.04] text-[9.5px] font-mono text-zinc-500 leading-normal">
            ⚙️ Supports vanilla HTML5 frontend scripts, Next.js setups, Single Page Apps, and generic framework integrations.
          </div>
        </div>
      </section>

      {/* TELEMETRY FLOW VISUALIZATION */}
      <section className="space-y-6">
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">Telemetry Architecture Flow</h2>
          <p className="text-[11px] text-zinc-500 font-sans">
            Minimal, zero-overhead pipeline streaming operational metrics in real-time.
          </p>
        </div>

        <div className="border border-white/[0.04] bg-[#09090B] rounded-xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Responsive Layout: Dotted Flex Flow for Desktop, Stacked list for Mobile */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-3 relative">
            
            {/* 1. External App */}
            <div className="flex-1 w-full lg:max-w-[150px] border border-white/[0.04] bg-black px-4 py-4 rounded-lg flex flex-col items-center text-center relative z-10 group hover:border-white/[0.1] transition-all">
              <Globe className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors mb-2.5" />
              <span className="text-[9.5px] font-mono font-bold text-white uppercase tracking-wider">External App</span>
              <span className="text-[8px] font-mono text-zinc-500 mt-1">Host Hostname</span>
            </div>

            {/* Arrow + Dotted pulse */}
            <div className="hidden lg:block relative flex-1 h-0.5 bg-white/[0.02]">
              <div className="absolute inset-0 border-t border-dashed border-white/[0.08]" />
              <div className="absolute top-1/2 left-0 w-1.5 h-1.5 rounded-full bg-white -translate-y-1/2 pulse-particle" />
            </div>

            {/* 2. Trinetra SDK */}
            <div className="flex-1 w-full lg:max-w-[150px] border border-white/[0.04] bg-black px-4 py-4 rounded-lg flex flex-col items-center text-center relative z-10 group hover:border-white/[0.1] transition-all">
              <Terminal className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors mb-2.5" />
              <span className="text-[9.5px] font-mono font-bold text-white uppercase tracking-wider">Trinetra SDK</span>
              <span className="text-[8px] font-mono text-zinc-500 mt-1">trinetra.js</span>
            </div>

            {/* Arrow + Dotted pulse */}
            <div className="hidden lg:block relative flex-1 h-0.5 bg-white/[0.02]">
              <div className="absolute inset-0 border-t border-dashed border-white/[0.08]" />
              <div className="absolute top-1/2 left-0 w-1.5 h-1.5 rounded-full bg-white -translate-y-1/2 pulse-particle-delayed" />
            </div>

            {/* 3. Telemetry Ingestion Endpoint */}
            <div className="flex-1 w-full lg:max-w-[150px] border border-white/[0.04] bg-black px-4 py-4 rounded-lg flex flex-col items-center text-center relative z-10 group hover:border-white/[0.1] transition-all">
              <Server className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors mb-2.5" />
              <span className="text-[9.5px] font-mono font-bold text-white uppercase tracking-wider">Telemetry API</span>
              <span className="text-[8px] font-mono text-zinc-500 mt-1">/api/telemetry</span>
            </div>

            {/* Arrow + Dotted pulse */}
            <div className="hidden lg:block relative flex-1 h-0.5 bg-white/[0.02]">
              <div className="absolute inset-0 border-t border-dashed border-white/[0.08]" />
              <div className="absolute top-1/2 left-0 w-1.5 h-1.5 rounded-full bg-white -translate-y-1/2 pulse-particle" />
            </div>

            {/* 4. AI Observability Engine */}
            <div className="flex-1 w-full lg:max-w-[150px] border border-white/[0.04] bg-black px-4 py-4 rounded-lg flex flex-col items-center text-center relative z-10 group hover:border-white/[0.1] transition-all">
              <Sparkles className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors mb-2.5" />
              <span className="text-[9.5px] font-mono font-bold text-white uppercase tracking-wider">AI Observability</span>
              <span className="text-[8px] font-mono text-zinc-500 mt-1">SRE Autopilot</span>
            </div>

            {/* Arrow + Dotted pulse */}
            <div className="hidden lg:block relative flex-1 h-0.5 bg-white/[0.02]">
              <div className="absolute inset-0 border-t border-dashed border-white/[0.08]" />
              <div className="absolute top-1/2 left-0 w-1.5 h-1.5 rounded-full bg-white -translate-y-1/2 pulse-particle-delayed" />
            </div>

            {/* 5. Incident Detection & Resolution */}
            <div className="flex-1 w-full lg:max-w-[150px] border border-white/[0.04] bg-black px-4 py-4 rounded-lg flex flex-col items-center text-center relative z-10 group hover:border-white/[0.1] transition-all">
              <Activity className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors mb-2.5" />
              <span className="text-[9.5px] font-mono font-bold text-white uppercase tracking-wider">Detection</span>
              <span className="text-[8px] font-mono text-zinc-500 mt-1">Realtime Fixes</span>
            </div>

          </div>
        </div>
      </section>

      {/* STEP-BY-STEP WALKTHROUGH */}
      <section id="integration-guide" className="space-y-8">
        <div className="border-b border-white/[0.04] pb-4">
          <h2 className="text-lg font-light text-white tracking-tight">Step-by-Step Integration Guide</h2>
          <p className="text-xs text-zinc-500 mt-1">Implement telemetry loops inside your external browser applications in under two minutes.</p>
        </div>

        <div className="space-y-6">
          
          {/* STEP 1: Include script */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 space-y-2 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-zinc-900 border border-white/[0.04] flex items-center justify-center text-white font-mono text-[10px] font-bold">
                  01
                </div>
                <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">Include Telemetry SDK</h3>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed pl-9">
                Load the script bundle dynamically or absolute directly inside the HTML <code className="font-mono text-white px-0.5 bg-black text-[9.5px]">&lt;head&gt;</code> context block. Exposes the global singleton `Trinetra`.
              </p>
            </div>
            <div className="lg:col-span-2 relative bg-[#060608] border border-white/[0.04] rounded-lg overflow-hidden group">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.02] bg-[#09090C]/50 font-mono text-[9px] text-zinc-500">
                <span>HTML script tag</span>
                <button
                  onClick={() => handleCopy(step1Code, setCopiedStep1)}
                  className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors"
                >
                  {copiedStep1 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedStep1 ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-[10.5px] font-mono text-zinc-300 leading-relaxed">
                <code>{step1Code}</code>
              </pre>
            </div>
          </div>

          {/* STEP 2: Initialize */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pt-6 border-t border-white/[0.03]">
            <div className="lg:col-span-1 space-y-2 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-zinc-900 border border-white/[0.04] flex items-center justify-center text-white font-mono text-[10px] font-bold">
                  02
                </div>
                <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">Initialize Stream</h3>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed pl-9">
                Call the client init loop pointing to your deployed telemetry ingestion API endpoint. Define your custom application identifier name.
              </p>
            </div>
            <div className="lg:col-span-2 relative bg-[#060608] border border-white/[0.04] rounded-lg overflow-hidden group">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.02] bg-[#09090C]/50 font-mono text-[9px] text-zinc-500">
                <span>JavaScript setup</span>
                <button
                  onClick={() => handleCopy(step2Code, setCopiedStep2)}
                  className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors"
                >
                  {copiedStep2 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedStep2 ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-[10.5px] font-mono text-zinc-300 leading-relaxed">
                <code>{step2Code}</code>
              </pre>
            </div>
          </div>

          {/* STEP 3: Track Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pt-6 border-t border-white/[0.03]">
            <div className="lg:col-span-1 space-y-2 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-zinc-900 border border-white/[0.04] flex items-center justify-center text-white font-mono text-[10px] font-bold">
                  03
                </div>
                <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">Track Performance Traces</h3>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed pl-9">
                Stream inbound or outbound API request logs instantly. Capture path routes, HTTP methods, latency counts, and provider names (e.g. Gemini).
              </p>
            </div>
            <div className="lg:col-span-2 relative bg-[#060608] border border-white/[0.04] rounded-lg overflow-hidden group">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.02] bg-[#09090C]/50 font-mono text-[9px] text-zinc-500">
                <span>Capture request metrics</span>
                <button
                  onClick={() => handleCopy(step3Code, setCopiedStep3)}
                  className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors"
                >
                  {copiedStep3 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedStep3 ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-[10.5px] font-mono text-zinc-300 leading-relaxed">
                <code>{step3Code}</code>
              </pre>
            </div>
          </div>

          {/* STEP 4: Track Errors */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pt-6 border-t border-white/[0.03]">
            <div className="lg:col-span-1 space-y-2 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-zinc-900 border border-white/[0.04] flex items-center justify-center text-white font-mono text-[10px] font-bold">
                  04
                </div>
                <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">Capture System Exceptions</h3>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed pl-9">
                Pipe JS exceptions directly from <code className="text-[9.5px] font-mono font-bold text-zinc-200">try/catch</code> wrappers. Autopilot processes stacks for instant anomaly detection.
              </p>
            </div>
            <div className="lg:col-span-2 relative bg-[#060608] border border-white/[0.04] rounded-lg overflow-hidden group">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.02] bg-[#09090C]/50 font-mono text-[9px] text-zinc-500">
                <span>Capture unhandled error stacks</span>
                <button
                  onClick={() => handleCopy(step4Code, setCopiedStep4)}
                  className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors"
                >
                  {copiedStep4 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedStep4 ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-[10.5px] font-mono text-zinc-300 leading-relaxed">
                <code>{step4Code}</code>
              </pre>
            </div>
          </div>

        </div>
      </section>

      {/* USE CASES SECTION */}
      <section className="space-y-6">
        <div className="border-b border-white/[0.04] pb-4">
          <h2 className="text-lg font-light text-white tracking-tight">Supported Use Cases</h2>
          <p className="text-xs text-zinc-500 mt-1">Powering high-performance telemetry logs across all domains.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="border border-white/[0.03] bg-[#09090B] rounded-xl p-5 hover:border-white/[0.08] transition-all flex flex-col justify-between group h-44 shadow-sm">
            <div className="space-y-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-white group-hover:border-white/[0.08] transition-colors">
                <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <h4 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">AI Chat Applications</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Monitor generative text completions, record token consumption limits, log API retry triggers, and analyze Gemini response latency.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="border border-white/[0.03] bg-[#09090B] rounded-xl p-5 hover:border-white/[0.08] transition-all flex flex-col justify-between group h-44 shadow-sm">
            <div className="space-y-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-white group-hover:border-white/[0.08] transition-colors">
                <LayoutGrid className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <h4 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">SaaS Dashboards</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Track dynamic user analytics, trace front-end page load durations, audit security verifications, and record active socket operations.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="border border-white/[0.03] bg-[#09090B] rounded-xl p-5 hover:border-white/[0.08] transition-all flex flex-col justify-between group h-44 shadow-sm">
            <div className="space-y-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-white group-hover:border-white/[0.08] transition-colors">
                <Network className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <h4 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">Customer Support AI</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Log live interaction loops, capture sentiment metrics, check connection drop thresholds, and record message-broker queue times.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="border border-white/[0.03] bg-[#09090B] rounded-xl p-5 hover:border-white/[0.08] transition-all flex flex-col justify-between group h-44 shadow-sm">
            <div className="space-y-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-white group-hover:border-white/[0.08] transition-colors">
                <Database className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <h4 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">Internal Tools</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Analyze database connection checkouts, monitor administration controls, audit configurations, and logs server thread operations.
              </p>
            </div>
          </div>

          {/* Card 5 */}
          <div className="border border-white/[0.03] bg-[#09090B] rounded-xl p-5 hover:border-white/[0.08] transition-all flex flex-col justify-between group h-44 shadow-sm">
            <div className="space-y-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-white group-hover:border-white/[0.08] transition-colors">
                <Activity className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <h4 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">API Monitoring</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Measure network roundtrips, analyze response payloads, verify status responses, and log gateway timeout thresholds.
              </p>
            </div>
          </div>

          {/* Card 6 */}
          <div className="border border-white/[0.03] bg-[#09090B] rounded-xl p-5 hover:border-white/[0.08] transition-all flex flex-col justify-between group h-44 shadow-sm">
            <div className="space-y-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-white group-hover:border-white/[0.08] transition-colors">
                <Lock className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <h4 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">LLM Observability</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Track temperature variations, calculate dynamic embedding latencies, capture LLM accuracy rates, and log prompt histories safely.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* LIVE CONNECTED APPLICATIONS */}
      <section className="space-y-6">
        <div className="border-b border-white/[0.04] pb-4">
          <h2 className="text-lg font-light text-white tracking-tight">Active Ecosystem Connections</h2>
          <p className="text-xs text-zinc-500 mt-1">Live overview of external systems currently streaming telemetries into Trinetra.</p>
        </div>

        {connectedApps && connectedApps.length > 0 ? (
          <div className="border border-white/[0.04] bg-[#09090B] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-[10.5px]">
                <thead>
                  <tr className="bg-black/60 border-b border-white/[0.03] text-zinc-500 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-semibold text-[9px]">Application Name</th>
                    <th className="py-3.5 px-4 font-semibold text-[9px]">Total Requests</th>
                    <th className="py-3.5 px-4 font-semibold text-[9px]">Avg Latency</th>
                    <th className="py-3.5 px-4 font-semibold text-[9px]">Ingestion State</th>
                    <th className="py-3.5 px-4 font-semibold text-[9px]">Ecosystem Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {connectedApps.map((app: any) => {
                    const isHealthy = app.status === "healthy"
                    const isDegraded = app.status === "degraded"
                    const isCritical = app.status === "critical"
                    return (
                      <tr key={app.name} className="hover:bg-white/[0.005] transition-colors">
                        <td className="py-4 px-4 font-sans font-medium text-white flex items-center gap-2">
                          <span className="relative flex h-1.5 w-1.5 shrink-0">
                            {isHealthy && (
                              <>
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                              </>
                            )}
                            {isDegraded && (
                              <>
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                              </>
                            )}
                            {isCritical && (
                              <>
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                              </>
                            )}
                          </span>
                          {app.name}
                        </td>
                        <td className="py-4 px-4 text-zinc-300">{app.requests} reqs</td>
                        <td className="py-4 px-4 text-zinc-300">{app.avgLatency}ms</td>
                        <td className="py-4 px-4 text-zinc-500">{app.message || "Connected • streaming"}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                              isHealthy ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                              isDegraded ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                              "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-white/[0.05] rounded-xl p-8 text-center space-y-2">
            <Radio className="w-8 h-8 text-zinc-700 animate-pulse mx-auto" />
            <h4 className="text-xs font-semibold text-zinc-400 font-mono uppercase tracking-wider">Listening For Telemetries...</h4>
            <p className="text-[10px] text-zinc-650 max-w-xs mx-auto leading-normal">
              No external applications are streaming data yet. Use the guide above to initialize Trinetra client script inside your app.
            </p>
          </div>
        )}
      </section>

    </div>
  )
}
