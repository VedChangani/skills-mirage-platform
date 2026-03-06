'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

const data = [
  { month: 'Jan', postings: 2400, demand: 2100 },
  { month: 'Feb', postings: 2100, demand: 2300 },
  { month: 'Mar', postings: 2800, demand: 2500 },
  { month: 'Apr', postings: 3200, demand: 2900 },
  { month: 'May', postings: 2900, demand: 3100 },
  { month: 'Jun', postings: 3500, demand: 3400 },
  { month: 'Jul', postings: 3800, demand: 3600 },
  { month: 'Aug', postings: 4100, demand: 3800 },
  { month: 'Sep', postings: 3900, demand: 4000 },
  { month: 'Oct', postings: 4300, demand: 4200 },
  { month: 'Nov', postings: 4600, demand: 4400 },
  { month: 'Dec', postings: 4900, demand: 4700 },
]

export function MarketPulseChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPostings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.75 0.18 145)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(0.75 0.18 145)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.6 0.15 200)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(0.6 0.15 200)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 250)" vertical={false} />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: 'oklch(0.65 0.02 250)', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: 'oklch(0.65 0.02 250)', fontSize: 12 }}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'oklch(0.18 0.025 250)',
              border: '1px solid oklch(0.28 0.02 250)',
              borderRadius: '8px',
              color: 'oklch(0.95 0.01 250)',
            }}
            labelStyle={{ color: 'oklch(0.65 0.02 250)' }}
          />
          <Area
            type="monotone"
            dataKey="postings"
            stroke="oklch(0.75 0.18 145)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPostings)"
            name="Job Postings"
          />
          <Area
            type="monotone"
            dataKey="demand"
            stroke="oklch(0.6 0.15 200)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorDemand)"
            name="Skill Demand"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Job Postings</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-chart-2" />
          <span className="text-xs text-muted-foreground">Skill Demand</span>
        </div>
      </div>
    </div>
  )
}
