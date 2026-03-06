'use client'

import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface TaskRiskAnalysisProps {
  dailyTasks?: string | null
}

// Mock task analysis - in production this would use AI to analyze the user's actual tasks
const mockTasks = [
  { 
    name: 'Code writing and debugging', 
    risk: 75, 
    status: 'high',
    reason: 'AI coding assistants are rapidly improving'
  },
  { 
    name: 'Data analysis and reporting', 
    risk: 68, 
    status: 'high',
    reason: 'Automated analytics tools can handle routine analysis'
  },
  { 
    name: 'Documentation', 
    risk: 82, 
    status: 'high',
    reason: 'AI can generate technical documentation efficiently'
  },
  { 
    name: 'Code reviews', 
    risk: 45, 
    status: 'medium',
    reason: 'Requires nuanced judgment that AI struggles with'
  },
  { 
    name: 'System design', 
    risk: 32, 
    status: 'low',
    reason: 'Complex architectural decisions need human expertise'
  },
  { 
    name: 'Team collaboration', 
    risk: 18, 
    status: 'low',
    reason: 'Human interaction and leadership remain essential'
  },
]

export function TaskRiskAnalysis({ dailyTasks }: TaskRiskAnalysisProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-destructive" />
      case 'medium':
        return <AlertCircle className="w-4 h-4 text-chart-3" />
      case 'low':
        return <CheckCircle className="w-4 h-4 text-primary" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high':
        return 'text-destructive'
      case 'medium':
        return 'text-chart-3'
      case 'low':
        return 'text-primary'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div className="space-y-4">
      {mockTasks.map((task, index) => (
        <div key={index} className="p-4 rounded-lg border border-border/50 bg-muted/20">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(task.status)}
              <span className="font-medium text-foreground">{task.name}</span>
            </div>
            <span className={`text-sm font-bold ${getStatusColor(task.status)}`}>
              {task.risk}% risk
            </span>
          </div>
          <Progress value={task.risk} className="h-1.5 mb-2" />
          <p className="text-xs text-muted-foreground">{task.reason}</p>
        </div>
      ))}
    </div>
  )
}
