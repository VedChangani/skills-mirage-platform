import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Target,
  AlertTriangle,
  Shield,
  Cpu,
  Bot,
  Zap,
  TrendingDown,
  CheckCircle
} from 'lucide-react'
import { RiskGauge } from '@/components/dashboard/risk-gauge'
import { TaskRiskAnalysis } from '@/components/dashboard/task-risk-analysis'
import { AutomationTimeline } from '@/components/dashboard/automation-timeline'
import { fetchRiskAnalysis } from '@/lib/risk'

function riskLevelToBadgeClass(level: string): string {
  switch (level) {
    case 'Critical':
    case 'High':
      return 'border-destructive/50 text-destructive'
    case 'Medium':
      return 'border-chart-3/50 text-chart-3'
    case 'Low':
    default:
      return 'border-primary/50 text-primary'
  }
}

export default async function RiskPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const admin = createAdminClient()
  const risk = await fetchRiskAnalysis(admin, profile)

  const overallRisk = risk.overallRisk
  const taskAutomation = risk.taskAutomation
  const aiReplacement = risk.aiReplacement
  const marketSaturation = risk.marketSaturation
  const riskLevel = risk.riskLevel

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Risk Analysis</h1>
        <p className="text-muted-foreground">
          Automation exposure assessment for {profile?.job_title || 'your role'}
        </p>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Risk Score
            </CardTitle>
            <Target className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{overallRisk}%</span>
              <Badge variant="outline" className={`text-xs ${riskLevelToBadgeClass(riskLevel)}`}>
                {riskLevel}
              </Badge>
            </div>
            <Progress value={overallRisk} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Task Automation
            </CardTitle>
            <Cpu className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{taskAutomation}%</span>
              <Badge variant="outline" className={`text-xs ${taskAutomation >= 60 ? 'border-destructive/50 text-destructive' : taskAutomation >= 40 ? 'border-chart-3/50 text-chart-3' : 'border-primary/50 text-primary'}`}>
                {taskAutomation >= 60 ? 'High' : taskAutomation >= 40 ? 'Medium' : 'Low'}
              </Badge>
            </div>
            <Progress value={taskAutomation} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              AI Replacement Risk
            </CardTitle>
            <Bot className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{aiReplacement}%</span>
              <Badge variant="outline" className={`text-xs ${aiReplacement >= 60 ? 'border-destructive/50 text-destructive' : aiReplacement >= 40 ? 'border-chart-3/50 text-chart-3' : 'border-primary/50 text-primary'}`}>
                {aiReplacement >= 60 ? 'High' : aiReplacement >= 40 ? 'Medium' : 'Low'}
              </Badge>
            </div>
            <Progress value={aiReplacement} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Market Saturation
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{marketSaturation}%</span>
              <Badge variant="outline" className={`text-xs ${marketSaturation >= 60 ? 'border-destructive/50 text-destructive' : marketSaturation >= 40 ? 'border-chart-3/50 text-chart-3' : 'border-primary/50 text-primary'}`}>
                {marketSaturation >= 60 ? 'High' : marketSaturation >= 40 ? 'Medium' : 'Low'}
              </Badge>
            </div>
            <Progress value={marketSaturation} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Risk Gauge - Large */}
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Risk Assessment
            </CardTitle>
            <CardDescription>
              Your comprehensive automation exposure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RiskGauge
              score={overallRisk}
              taskAutomation={taskAutomation}
              aiReplacement={aiReplacement}
              marketSaturation={marketSaturation}
            />
          </CardContent>
        </Card>

        {/* Task Risk Analysis */}
        <Card className="lg:col-span-2 border-border/50 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Cpu className="w-5 h-5 text-destructive" />
              Task-Level Analysis
            </CardTitle>
            <CardDescription>
              Which of your daily tasks are at risk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TaskRiskAnalysis dailyTasks={profile?.daily_tasks} />
          </CardContent>
        </Card>
      </div>

      {/* Automation Timeline */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-chart-3" />
            Automation Timeline
          </CardTitle>
          <CardDescription>
            Projected impact of automation on your role over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AutomationTimeline />
        </CardContent>
      </Card>

      {/* Mitigation Recommendations */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Risk Mitigation Recommendations
          </CardTitle>
          <CardDescription>
            Steps to reduce your automation exposure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border border-border/50 bg-muted/20">
              <h4 className="font-medium text-foreground mb-2">Upskill in AI/ML</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Learn to work with AI tools rather than compete against them. Understanding AI fundamentals makes you more valuable.
              </p>
              <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                High Impact
              </Badge>
            </div>
            <div className="p-4 rounded-lg border border-border/50 bg-muted/20">
              <h4 className="font-medium text-foreground mb-2">Develop Soft Skills</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Leadership, communication, and creative problem-solving are difficult to automate and increasingly valuable.
              </p>
              <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                High Impact
              </Badge>
            </div>
            <div className="p-4 rounded-lg border border-border/50 bg-muted/20">
              <h4 className="font-medium text-foreground mb-2">Specialize in Complex Systems</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Focus on areas requiring deep domain expertise and system-level thinking that AI struggles with.
              </p>
              <Badge variant="outline" className="text-xs border-chart-3/50 text-chart-3">
                Medium Impact
              </Badge>
            </div>
            <div className="p-4 rounded-lg border border-border/50 bg-muted/20">
              <h4 className="font-medium text-foreground mb-2">Build a Personal Brand</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Establish yourself as a thought leader in your field through writing, speaking, and community engagement.
              </p>
              <Badge variant="outline" className="text-xs border-chart-3/50 text-chart-3">
                Medium Impact
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
