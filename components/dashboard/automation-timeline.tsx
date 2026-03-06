'use client'

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts'

const data = [
  { year: '2024', impact: 35, yourRole: 25 },
  { year: '2025', impact: 45, yourRole: 40 },
  { year: '2026', impact: 58, yourRole: 55 },
  { year: '2027', impact: 68, yourRole: 65 },
  { year: '2028', impact: 75, yourRole: 72 },
  { year: '2029', impact: 82, yourRole: 78 },
  { year: '2030', impact: 88, yourRole: 82 },
]

export function AutomationTimeline() {
  return (
    <div className="space-y-4">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 250)" vertical={false} />
            <XAxis 
              dataKey="year" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'oklch(0.65 0.02 250)', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'oklch(0.65 0.02 250)', fontSize: 12 }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(0.18 0.025 250)',
                border: '1px solid oklch(0.28 0.02 250)',
                borderRadius: '8px',
                color: 'oklch(0.95 0.01 250)',
              }}
              labelStyle={{ color: 'oklch(0.65 0.02 250)' }}
              formatter={(value: number) => [`${value}%`, '']}
            />
            <ReferenceLine 
              y={70} 
              stroke="oklch(0.55 0.22 25)" 
              strokeDasharray="5 5"
              label={{ 
                value: 'Critical Threshold', 
                fill: 'oklch(0.55 0.22 25)',
                fontSize: 10,
                position: 'right'
              }}
            />
            <Line
              type="monotone"
              dataKey="impact"
              stroke="oklch(0.65 0.02 250)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Industry Average"
            />
            <Line
              type="monotone"
              dataKey="yourRole"
              stroke="oklch(0.75 0.18 145)"
              strokeWidth={3}
              dot={{ fill: 'oklch(0.75 0.18 145)', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: 'oklch(0.75 0.18 145)' }}
              name="Your Role"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-primary" />
          <span className="text-xs text-muted-foreground">Your Role</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-muted-foreground" style={{ borderTop: '2px dashed' }} />
          <span className="text-xs text-muted-foreground">Industry Average</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-destructive" style={{ borderTop: '2px dashed' }} />
          <span className="text-xs text-muted-foreground">Critical Threshold</span>
        </div>
      </div>
      
      <div className="p-4 rounded-lg bg-chart-3/10 border border-chart-3/30">
        <p className="text-sm text-muted-foreground">
          <strong className="text-chart-3">Timeline Insight:</strong> Based on current AI advancement rates, 
          your role is projected to reach 70% automation exposure by 2028. Starting reskilling now gives you 
          a 2-year advantage to transition smoothly.
        </p>
      </div>
    </div>
  )
}
