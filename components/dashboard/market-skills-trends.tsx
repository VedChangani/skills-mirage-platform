import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'

export type SkillTrend = {
  name: string
  baseShare: number
  recentShare: number
  delta: number
  baseCount: number
  recentCount: number
}

interface MarketSkillsTrendsProps {
  jobTitle: string
  trending: SkillTrend[]
  declining: SkillTrend[]
}

function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function MarketSkillsTrends({ jobTitle, trending, declining }: MarketSkillsTrendsProps) {
  const hasData = trending.length > 0 || declining.length > 0

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-foreground">Trending vs Declining Skills</CardTitle>
        <CardDescription>
          {hasData
            ? `Skills momentum for ${jobTitle || 'your role'} based on share of postings.`
            : 'Not enough data to compute skill trends for your role yet.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="text-sm text-muted-foreground">
            Once there are enough postings in both recent and historical data, we&apos;ll show the
            top 20 trending and top 20 declining skills here.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  Top 20 Trending Skills
                </h3>
                <span className="text-xs text-muted-foreground">rising share of postings</span>
              </div>
              <ul className="space-y-1">
                {trending.map((s) => (
                  <li key={`trending-${s.name}`} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-foreground truncate capitalize">{s.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs border-emerald-500/60 text-emerald-300 flex items-center gap-1"
                      >
                        <TrendingUp className="h-3 w-3" />
                        {formatPct(s.delta)} pts
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        now {formatPct(s.recentShare)} (was {formatPct(s.baseShare)})
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  Top 20 Declining Skills
                </h3>
                <span className="text-xs text-muted-foreground">shrinking share of postings</span>
              </div>
              <ul className="space-y-1">
                {declining.map((s) => (
                  <li key={`declining-${s.name}`} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-foreground truncate capitalize">{s.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs border-red-500/60 text-red-300 flex items-center gap-1"
                      >
                        <TrendingDown className="h-3 w-3" />
                        {formatPct(Math.abs(s.delta))} pts
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        now {formatPct(s.recentShare)} (was {formatPct(s.baseShare)})
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

