'use client'

import { AlertTriangle, TrendingUp, Zap, Clock, BookOpen } from 'lucide-react'

const alerts = [
  {
    id: 1,
    type: 'warning',
    title: 'High Automation Risk Detected',
    description: 'AI tools are automating 3 of your daily tasks',
    time: '2 hours ago',
    icon: AlertTriangle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
  {
    id: 2,
    type: 'opportunity',
    title: 'New Job Surge',
    description: '+45 new positions in your area this week',
    time: '4 hours ago',
    icon: TrendingUp,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    id: 3,
    type: 'skill',
    title: 'Skill Gap Alert',
    description: 'Python proficiency now required in 78% of postings',
    time: '1 day ago',
    icon: Zap,
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
  },
  {
    id: 4,
    type: 'learning',
    title: 'Course Recommendation',
    description: 'AWS Certified Solutions Architect matches your path',
    time: '2 days ago',
    icon: BookOpen,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
  },
]

export function AlertsFeed() {
  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
        >
          <div className={`w-8 h-8 rounded-full ${alert.bgColor} flex items-center justify-center flex-shrink-0`}>
            <alert.icon className={`w-4 h-4 ${alert.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{alert.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
            <div className="flex items-center gap-1 mt-1.5">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{alert.time}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
