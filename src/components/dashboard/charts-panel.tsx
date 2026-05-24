"use client"

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTelemetry } from "@/lib/telemetry-store"

export function ChartsPanel({ showTraffic = true }: { showTraffic?: boolean }) {
  const { chartData } = useTelemetry()

  return (
    <div className={`grid grid-cols-1 ${showTraffic ? 'lg:grid-cols-2' : ''} gap-6`}>
      {/* Latency Chart */}
      <Card className="border border-white/[0.03] bg-[#09090B] shadow-[0_1px_3px_rgba(0,0,0,0.6)] rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/[0.03]">
          <CardTitle className="text-[11px] font-semibold text-white uppercase tracking-wider font-mono">Global API Latency</CardTitle>
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-400 tracking-wider">
            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full"></span>
            <span>LIVE</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[230px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.05} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorP99" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#71717a" stopOpacity={0.05} />
                    <stop offset="95%" stopColor="#71717a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis
                  dataKey="time"
                  stroke="#52525b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#52525b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}ms`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090B', borderColor: '#27272A', borderRadius: '4px', color: '#ffffff', fontSize: '11px' }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Area
                  type="monotone"
                  dataKey="p99"
                  stroke="#71717a"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorP99)"
                  name="p99 Latency"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="latency"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorLatency)"
                  name="Avg Latency"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Traffic Chart */}
      {showTraffic && (
        <Card className="border border-white/[0.03] bg-[#09090B] shadow-[0_1px_3px_rgba(0,0,0,0.6)] rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/[0.03]">
            <CardTitle className="text-[11px] font-semibold text-white uppercase tracking-wider font-mono">Request Traffic &amp; Errors</CardTitle>
            <div className="flex items-center gap-3 text-[9px] font-mono text-zinc-400">
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-white"></div> REQUESTS</span>
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> ERRORS</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[230px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 0, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                  <XAxis
                    dataKey="time"
                    stroke="#52525b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#52525b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#52525b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090B', borderColor: '#27272A', borderRadius: '4px', color: '#ffffff', fontSize: '11px' }}
                    cursor={{ fill: '#18181b', opacity: 0.2 }}
                  />
                  <Bar yAxisId="left" dataKey="requests" fill="#ffffff" radius={[2, 2, 0, 0]} name="Requests" isAnimationActive={false} barSize={8} />
                  <Bar yAxisId="right" dataKey="errors" fill="#ef4444" radius={[2, 2, 0, 0]} name="Errors" isAnimationActive={false} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
