'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const skills = [
  { name: 'AI/ML Engineering', demand: 92, trend: 'up', change: '+24%' },
  { name: 'Cloud Architecture', demand: 87, trend: 'up', change: '+18%' },
  { name: 'Data Engineering', demand: 84, trend: 'up', change: '+15%' },
  { name: 'Cybersecurity', demand: 81, trend: 'up', change: '+12%' },
  { name: 'DevOps', demand: 78, trend: 'stable', change: '+3%' },
  { name: 'Backend Development', demand: 72, trend: 'down', change: '-5%' },
]

export function TrendingSkillsList() {
  return (
    <div className="space-y-4">
      {skills.map((skill, index) => (
        <div key={skill.name} className="flex items-center gap-4">
          <div className="w-6 text-center">
            <span className="text-xs font-mono text-muted-foreground">{index + 1}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground truncate">
                {skill.name}
              </span>
              <div className="flex items-center gap-2">
                {skill.trend === 'up' && (
                  <Badge variant="outline" className="border-primary/30 text-primary text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {skill.change}
                  </Badge>
                )}
                {skill.trend === 'down' && (
                  <Badge variant="outline" className="border-destructive/30 text-destructive text-xs">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    {skill.change}
                  </Badge>
                )}
                {skill.trend === 'stable' && (
                  <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground text-xs">
                    <Minus className="w-3 h-3 mr-1" />
                    {skill.change}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={skill.demand} className="h-1.5 flex-1" />
              <span className="text-xs text-muted-foreground w-8">{skill.demand}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
