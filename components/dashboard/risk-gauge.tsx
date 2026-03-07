'use client'

interface RiskGaugeProps {
  score: number
  /** Optional breakdown to show real task automation, AI replacement, market saturation */
  taskAutomation?: number
  aiReplacement?: number
  marketSaturation?: number
}

export function RiskGauge({ score, taskAutomation, aiReplacement, marketSaturation }: RiskGaugeProps) {
  // Calculate the angle for the needle (0% = -90deg, 100% = 90deg)
  const rotation = (score / 100) * 180 - 90
  
  // Determine risk level and color
  const getRiskLevel = (score: number) => {
    if (score < 30) return { level: 'Low', color: 'text-primary', bgColor: 'bg-primary/10' }
    if (score < 60) return { level: 'Medium', color: 'text-chart-3', bgColor: 'bg-chart-3/10' }
    return { level: 'High', color: 'text-destructive', bgColor: 'bg-destructive/10' }
  }
  
  const { level, color, bgColor } = getRiskLevel(score)

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Gauge SVG */}
      <div className="relative w-48 h-28">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="oklch(0.22 0.02 250)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* Low risk segment (green) */}
          <path
            d="M 20 100 A 80 80 0 0 1 60 35"
            fill="none"
            stroke="oklch(0.75 0.18 145)"
            strokeWidth="12"
            strokeLinecap="round"
            opacity={score >= 0 ? 1 : 0.3}
          />
          
          {/* Medium risk segment (amber) */}
          <path
            d="M 60 35 A 80 80 0 0 1 140 35"
            fill="none"
            stroke="oklch(0.7 0.12 60)"
            strokeWidth="12"
            strokeLinecap="round"
            opacity={score >= 30 ? 1 : 0.3}
          />
          
          {/* High risk segment (red) */}
          <path
            d="M 140 35 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="oklch(0.55 0.22 25)"
            strokeWidth="12"
            strokeLinecap="round"
            opacity={score >= 60 ? 1 : 0.3}
          />
          
          {/* Needle */}
          <g transform={`rotate(${rotation}, 100, 100)`}>
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="35"
              stroke="oklch(0.95 0.01 250)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle
              cx="100"
              cy="100"
              r="8"
              fill="oklch(0.18 0.025 250)"
              stroke="oklch(0.95 0.01 250)"
              strokeWidth="3"
            />
          </g>
        </svg>
      </div>
      
      {/* Score Display */}
      <div className="text-center mt-2">
        <div className="text-4xl font-bold text-foreground">{score}%</div>
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mt-2 ${bgColor}`}>
          <span className={`text-sm font-medium ${color}`}>{level} Risk</span>
        </div>
      </div>

      {/* Risk Breakdown */}
      <div className="w-full mt-6 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Task Automation</span>
          <span className="text-foreground font-medium">{taskAutomation ?? 72}%</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">AI Replacement</span>
          <span className="text-foreground font-medium">{aiReplacement ?? 58}%</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Market Saturation</span>
          <span className="text-foreground font-medium">{marketSaturation ?? 45}%</span>
        </div>
      </div>
    </div>
  )
}
