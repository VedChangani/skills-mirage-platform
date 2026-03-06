import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown,
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
  Clock,
  ArrowUpRight
} from 'lucide-react'
import { MarketTrendsChart } from '@/components/dashboard/market-trends-chart'
import { JobPostingsTable } from '@/components/dashboard/job-postings-table'
import { SalaryRangeChart } from '@/components/dashboard/salary-range-chart'

export default async function MarketPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  // Mock market statistics
  const marketStats = {
    totalPostings: 12847,
    postingsChange: '+8.4%',
    avgSalary: '$125,000',
    salaryChange: '+5.2%',
    demandIndex: 87,
    topLocation: profile?.city || 'San Francisco',
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Market Signals</h1>
        <p className="text-muted-foreground">
          Real-time job market intelligence for {profile?.job_title || 'your role'}
        </p>
      </div>

      {/* Market Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Job Postings
            </CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {marketStats.totalPostings.toLocaleString()}
              </span>
              <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                <TrendingUp className="w-3 h-3 mr-1" />
                {marketStats.postingsChange}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">vs last month</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Salary
            </CardTitle>
            <DollarSign className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{marketStats.avgSalary}</span>
              <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                {marketStats.salaryChange}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">median for similar roles</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Demand Index
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{marketStats.demandIndex}</span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">High demand indicator</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Location
            </CardTitle>
            <MapPin className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground truncate">
              {marketStats.topLocation}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Most active market</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-foreground">Job Market Trends</CardTitle>
            <CardDescription>Monthly posting volume and hiring velocity</CardDescription>
          </CardHeader>
          <CardContent>
            <MarketTrendsChart />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-foreground">Salary Distribution</CardTitle>
            <CardDescription>Salary ranges for similar positions</CardDescription>
          </CardHeader>
          <CardContent>
            <SalaryRangeChart />
          </CardContent>
        </Card>
      </div>

      {/* Job Postings Table */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Job Postings</CardTitle>
          <CardDescription>Latest opportunities matching your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <JobPostingsTable />
        </CardContent>
      </Card>
    </div>
  )
}
