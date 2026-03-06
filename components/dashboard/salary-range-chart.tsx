'use client'

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'

const data = [
  { range: '$80-100k', count: 450, percentage: 15 },
  { range: '$100-120k', count: 780, percentage: 26 },
  { range: '$120-140k', count: 920, percentage: 31 },
  { range: '$140-160k', count: 540, percentage: 18 },
  { range: '$160k+', count: 310, percentage: 10 },
]

export function SalaryRangeChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          layout="vertical"
          margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
        >
          <XAxis 
            type="number"
            axisLine={false} 
            tickLine={false}
            tick={{ fill: 'oklch(0.65 0.02 250)', fontSize: 12 }}
          />
          <YAxis 
            type="category"
            dataKey="range"
            axisLine={false} 
            tickLine={false}
            tick={{ fill: 'oklch(0.65 0.02 250)', fontSize: 12 }}
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'oklch(0.18 0.025 250)',
              border: '1px solid oklch(0.28 0.02 250)',
              borderRadius: '8px',
              color: 'oklch(0.95 0.01 250)',
            }}
            labelStyle={{ color: 'oklch(0.65 0.02 250)' }}
            formatter={(value: number, name: string) => [
              `${value} postings (${data.find(d => d.count === value)?.percentage}%)`,
              'Count'
            ]}
          />
          <Bar 
            dataKey="count" 
            radius={[0, 4, 4, 0]} 
            name="Postings"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === 2 ? 'oklch(0.75 0.18 145)' : 'oklch(0.75 0.18 145 / 0.5)'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="text-center mt-4">
        <p className="text-xs text-muted-foreground">
          Your target range is highlighted. Most common: <span className="text-primary font-medium">$120-140k</span>
        </p>
      </div>
    </div>
  )
}
