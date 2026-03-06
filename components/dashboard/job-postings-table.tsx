'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, MapPin, Building2, Clock } from 'lucide-react'

const jobs = [
  {
    id: 1,
    title: 'Senior Software Engineer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    salary: '$140k - $180k',
    posted: '2 days ago',
    match: 92,
    type: 'Full-time',
  },
  {
    id: 2,
    title: 'Staff Engineer',
    company: 'DataFlow Systems',
    location: 'Remote',
    salary: '$160k - $200k',
    posted: '3 days ago',
    match: 87,
    type: 'Full-time',
  },
  {
    id: 3,
    title: 'Engineering Manager',
    company: 'CloudScale',
    location: 'New York, NY',
    salary: '$180k - $220k',
    posted: '5 days ago',
    match: 78,
    type: 'Full-time',
  },
  {
    id: 4,
    title: 'Principal Engineer',
    company: 'AI Labs',
    location: 'Austin, TX',
    salary: '$200k - $250k',
    posted: '1 week ago',
    match: 72,
    type: 'Full-time',
  },
]

export function JobPostingsTable() {
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
        >
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-3">
              <h4 className="font-medium text-foreground">{job.title}</h4>
              <Badge variant="outline" className="text-xs">
                {job.type}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {job.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {job.posted}
              </span>
            </div>
            <div className="text-sm font-medium text-primary">{job.salary}</div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Match Score</div>
              <div className={`text-lg font-bold ${
                job.match >= 85 ? 'text-primary' : 
                job.match >= 70 ? 'text-chart-3' : 
                'text-muted-foreground'
              }`}>
                {job.match}%
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-border">
              <ExternalLink className="w-4 h-4 mr-1" />
              View
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
