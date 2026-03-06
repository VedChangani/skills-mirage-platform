'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

const data = [
  { month: 'Jan', postings: 1800, hired: 1200 },
  { month: 'Feb', postings: 2100, hired: 1400 },
  { month: 'Mar', postings: 2400, hired: 1600 },
  { month: 'Apr', postings: 2200, hired: 1500 },
  { month: 'May', postings: 2800, hired: 1900 },
  { month: 'Jun', postings: 3200, hired: 2200 },
]

export function MarketTrendsChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          <Bar 
            dataKey="postings" 
            fill="oklch(0.75 0.18 145)" 
            radius={[4, 4, 0, 0]} 
            name="Job Postings"
          />
          <Bar 
            dataKey="hired" 
            fill="oklch(0.6 0.15 200)" 
            radius={[4, 4, 0, 0]} 
            name="Hired"
          />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary" />
          <span className="text-xs text-muted-foreground">Job Postings</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-chart-2" />
          <span className="text-xs text-muted-foreground">Hired</span>
        </div>
      </div>
    </div>
  )
}
