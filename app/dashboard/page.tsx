import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  Zap,
  GraduationCap,
  ArrowUpRight,
  Activity,
  Shield
} from 'lucide-react'
import { MarketPulseChart } from '@/components/dashboard/market-pulse-chart'
import { RiskGauge } from '@/components/dashboard/risk-gauge'
import { TrendingSkillsList } from '@/components/dashboard/trending-skills-list'
import { AlertsFeed } from '@/components/dashboard/alerts-feed'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const admin = createAdminClient()

  const [{ count: jobsCount }, { count: naukriCount }, { count: coursesCount }] = await Promise.all([
    admin.from('jobs').select('*', { count: 'exact', head: true }),
    admin.from('naukri_jobs').select('*', { count: 'exact', head: true }),
    admin.from('courses').select('*', { count: 'exact', head: true }),
  ])

  const totalPostings = (jobsCount ?? 0) + (naukriCount ?? 0)

  // Keep riskScore mocked until you add a risk table/model
  const riskScore = 65

  const marketTrend = totalPostings > 0 ? `${Math.min(99, Math.round(totalPostings / 100))}%` : '0%'

  // A simple “skills gap” proxy using course catalog size
  const skillsGap = coursesCount && coursesCount > 0 ? Math.min(9, Math.ceil(coursesCount / 50)) : 3

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">
          Command Center
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {profile?.full_name || profile?.job_title || 'Agent'}. Here&apos;s your workforce intelligence briefing.
        </p>
      </div>

      {/* Status Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Risk Level Card */}
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Automation Risk
            </CardTitle>
            <Target className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{riskScore}%</span>
              <Badge variant="outline" className="text-xs border-destructive/50 text-destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Medium
              </Badge>
            </div>
            <Progress value={riskScore} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        {/* Market Trend Card */}
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Job Market Trend
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{marketTrend}</span>
              <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                Growing
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              In {profile?.city || 'your area'} for similar roles
            </p>
          </CardContent>
        </Card>

        {/* Skills Gap Card */}
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Skills Gap
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{skillsGap}</span>
              <span className="text-sm text-muted-foreground">skills to acquire</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              To reach 85% market alignment
            </p>
          </CardContent>
        </Card>

        {/* Career Shield Score */}
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Career Shield
            </CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">72</span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Your resilience score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Market Pulse Chart - Spans 2 columns */}
        <Card className="lg:col-span-2 border-border/50 bg-card/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Market Pulse
                </CardTitle>
                <CardDescription>
                  Real-time job market signals for {profile?.job_title || 'your role'}
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-primary/30 text-primary">
                <Zap className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <MarketPulseChart />
          </CardContent>
        </Card>

        {/* Risk Gauge */}
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-destructive" />
              Risk Assessment
            </CardTitle>
            <CardDescription>
              Automation exposure analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RiskGauge score={riskScore} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trending Skills */}
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Trending Skills
            </CardTitle>
            <CardDescription>
              High-demand skills in your field
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrendingSkillsList />
          </CardContent>
        </Card>

        {/* Intelligence Alerts */}
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-chart-3" />
              Intelligence Alerts
            </CardTitle>
            <CardDescription>
              Recent signals and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertsFeed />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
