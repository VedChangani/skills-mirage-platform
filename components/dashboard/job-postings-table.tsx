'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, MapPin, Building2, Clock } from 'lucide-react'

export type JobPosting = {
  id: string | number
  title: string
  company: string
  location: string
  salary: string
  posted: string
  match?: number | null
  type?: string | null
  url?: string | null
  details?: string[] | null
  source?: string | null
  sortDate?: number | null
}

interface JobPostingsTableProps {
  jobs: JobPosting[]
}

export function JobPostingsTable({ jobs }: JobPostingsTableProps) {
  if (!jobs.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No matching job postings found yet. Adjust your filters or check back soon.
      </p>
    )
  }

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
              {job.type && (
                <Badge variant="outline" className="text-xs">
                  {job.type}
                </Badge>
              )}
              {job.source && (
                <Badge variant="secondary" className="text-xs bg-muted/50">
                  {job.source}
                </Badge>
              )}
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
            {!!job.details?.length && (
              <div className="text-xs text-muted-foreground line-clamp-2">
                {job.details.filter(Boolean).join(' • ')}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              {typeof job.match === 'number' && (
                <>
                  <div className="text-xs text-muted-foreground">Match Score</div>
                  <div
                    className={`text-lg font-bold ${
                      job.match >= 85
                        ? 'text-primary'
                        : job.match >= 70
                          ? 'text-chart-3'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {job.match}%
                  </div>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-border"
              asChild={!!job.url}
            >
              {job.url ? (
                <a href={job.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View
                </a>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View
                </>
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
