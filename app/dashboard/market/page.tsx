import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, MapPin, Briefcase, DollarSign, ArrowUpRight } from 'lucide-react'
import { MarketTrendsChart, type MarketTrendPoint } from '@/components/dashboard/market-trends-chart'
import { JobPostingsTable, type JobPosting } from '@/components/dashboard/job-postings-table'

type JobRow = {
  uniq_id: string
  jobid: string | null
  jobtitle: string
  company: string
  joblocation_address: string | null
  payrate: string | null
  postdate: string | null
  industry: string | null
  experience: string | null
  education: string | null
  numberofpositions: number | null
  site_name: string | null
  skills: string | null
}

type NaukriJobRow = {
  id: number
  uniq_id: string
  jobtitle: string
  company: string
  stars: string | null
  experience: string | null
  location: string | null
  skills: string | null
  posted: string | null
  postdate: string | null
  site_name: string | null
}

function formatPostedRelative(dateString?: string | null): string {
  if (!dateString) return 'Recently'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Recently'
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  const weeks = Math.floor(diffDays / 7)
  return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
}

function parsePayrateToNumber(payrate: string | null): number | null {
  if (!payrate) return null
  const cleaned = payrate.replace(/[,₹$]/g, '')
  const match = cleaned.match(/(\d+(\.\d+)?)/)
  if (!match) return null
  const value = Number(match[1])
  return Number.isFinite(value) ? value : null
}

function formatSalary(job: JobRow): string {
  if (job.payrate) return job.payrate
  return 'Not specified'
}

function computeMarketStats(jobs: JobRow[], fallbackTopLocation: string) {
  const totalPostings = jobs.length

  const salaryValues = jobs
    .map((job) => parsePayrateToNumber(job.payrate))
    .filter((v): v is number => v !== null)

  const avgSalaryNumber =
    salaryValues.length > 0
      ? salaryValues.reduce((sum, v) => sum + v, 0) / salaryValues.length
      : undefined

  const avgSalary = avgSalaryNumber
    ? `₹${Math.round(avgSalaryNumber).toLocaleString()}`
    : '₹125,000'

  const locationCounts = new Map<string, number>()
  for (const job of jobs) {
    const loc = job.joblocation_address
    if (!loc) continue
    locationCounts.set(loc, (locationCounts.get(loc) ?? 0) + 1)
  }
  let topLocation = fallbackTopLocation
  if (locationCounts.size > 0) {
    topLocation = Array.from(locationCounts.entries()).sort((a, b) => b[1] - a[1])[0][0]
  }

  // For now keep percentage / demand index simple; you can refine later.
  return {
    totalPostings,
    postingsChange: '+8.4%',
    avgSalary,
    salaryChange: '+5.2%',
    demandIndex: Math.min(100, 50 + totalPostings),
    topLocation,
  }
}

function computeTopLocationFromAll(
  jobs: JobRow[],
  naukriJobs: NaukriJobRow[],
  fallbackTopLocation: string,
) {
  const counts = new Map<string, number>()
  for (const job of jobs) {
    if (!job.joblocation_address) continue
    counts.set(job.joblocation_address, (counts.get(job.joblocation_address) ?? 0) + 1)
  }
  for (const job of naukriJobs) {
    if (!job.location) continue
    counts.set(job.location, (counts.get(job.location) ?? 0) + 1)
  }

  if (!counts.size) return fallbackTopLocation
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0]
}

/** Filter jobs in memory by user's job_title (keywords in jobtitle or skills). */
function filterByJobTitle<T extends { jobtitle?: string | null; skills?: string | null }>(
  items: T[],
  jobTitle: string,
): T[] {
  const trimmed = jobTitle.trim()
  if (!trimmed) return items
  const keywords = trimmed.toLowerCase().split(/\s+/).filter((w) => w.length >= 2)
  if (!keywords.length) return items
  return items.filter((item) => {
    const title = (item.jobtitle ?? '').toLowerCase()
    const skills = (item.skills ?? '').toLowerCase()
    return keywords.some((k) => title.includes(k) || skills.includes(k))
  })
}

/** Trends from both jobs and naukri jobs combined, by month. */
function buildTrendsFromAll(jobs: JobRow[], naukriJobs: NaukriJobRow[]): MarketTrendPoint[] {
  const byMonth = new Map<string, { postings: number; hired: number }>()
  const add = (postdate?: string | null) => {
    const d = postdate ? new Date(postdate) : new Date()
    if (Number.isNaN(d.getTime())) return
    const month = d.toLocaleString('en-US', { month: 'short' })
    const entry = byMonth.get(month) ?? { postings: 0, hired: 0 }
    entry.postings += 1
    entry.hired += 0.6
    byMonth.set(month, entry)
  }
  jobs.forEach((j) => add(j.postdate))
  naukriJobs.forEach((j) => add(j.postdate))
  if (!byMonth.size) return []
  const order: Record<string, number> = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 }
  return Array.from(byMonth.entries())
    .map(([month, v]) => ({ month, postings: v.postings, hired: Math.round(v.hired) }))
    .sort((a, b) => (order[a.month] ?? 99) - (order[b.month] ?? 99))
}

export default async function MarketPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id ?? '')
    .maybeSingle()

  const admin = createAdminClient()

  const [{ data: jobsData }, { data: naukriJobsData }] = await Promise.all([
    admin
      .from('jobs')
      .select(
        `uniq_id, jobid, jobtitle, company, joblocation_address, payrate, postdate, industry, experience, education, numberofpositions, site_name, skills`,
      )
      .order('postdate', { ascending: false })
      .limit(500),
    admin
      .from('naukri_jobs')
      .select(
        `id, uniq_id, jobtitle, company, stars, experience, location, skills, posted, postdate, site_name`,
      )
      .order('postdate', { ascending: false })
      .limit(500),
  ])

  const allJobs = (jobsData ?? []) as JobRow[]
  const allNaukriJobs = (naukriJobsData ?? []) as NaukriJobRow[]
  const jobTitle = (profile?.job_title || '').trim()

  const jobs = filterByJobTitle(allJobs, jobTitle)
  const naukriJobs = filterByJobTitle(allNaukriJobs, jobTitle)

  const jobsForDisplay = jobs.length > 0 || naukriJobs.length > 0 ? jobs : allJobs
  const naukriJobsForDisplay = jobs.length > 0 || naukriJobs.length > 0 ? naukriJobs : allNaukriJobs

  const baseStats = computeMarketStats(jobsForDisplay, profile?.city || 'San Francisco')
  const topLocation = computeTopLocationFromAll(jobsForDisplay, naukriJobsForDisplay, baseStats.topLocation)

  // Job list: only naukri_jobs, filtered by logged-in user's job_title. No fallback to jobs table.
  const listNaukriJobs = jobTitle ? naukriJobs : []
  const jobPostingsFromNaukriForList: JobPosting[] = listNaukriJobs.map((job) => ({
    id: job.uniq_id || job.id,
    title: job.jobtitle,
    company: job.company,
    location: job.location || 'Not specified',
    salary: job.experience || 'Not specified',
    posted: job.posted || formatPostedRelative(job.postdate),
    match: null,
    type: null,
    url: null,
    source: job.site_name || 'Job board',
    details: [job.skills || null, job.stars ? `⭐ ${job.stars}` : null].filter(
      (v): v is string => Boolean(v),
    ),
    sortDate: job.postdate ? new Date(job.postdate).getTime() : null,
  }))
  const jobPostings = jobPostingsFromNaukriForList.sort((a, b) => (b.sortDate ?? 0) - (a.sortDate ?? 0))

  const marketStats = {
    ...baseStats,
    totalPostings: jobsForDisplay.length + naukriJobsForDisplay.length,
    demandIndex: Math.min(100, 50 + jobsForDisplay.length + naukriJobsForDisplay.length),
    topLocation,
  }

  const trendsData = buildTrendsFromAll(jobsForDisplay, naukriJobsForDisplay)

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
            <p className="text-xs text-muted-foreground mt-2">
              {jobTitle ? `for ${profile?.job_title ?? jobTitle}` : 'vs last month'}
            </p>
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

      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-foreground">Job Market Trends</CardTitle>
          <CardDescription>
            {jobTitle ? `Posting volume for ${profile?.job_title ?? jobTitle} over time` : 'Posting volume over time'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MarketTrendsChart data={trendsData} />
        </CardContent>
      </Card>

      {/* Job Postings: only naukri_jobs filtered by job_title; no fallback */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Job Postings</CardTitle>
          <CardDescription>
            {jobTitle ? `Opportunities matching your role as ${profile?.job_title ?? jobTitle}` : 'Set your job title in Profile to see postings for your role'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobPostings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {jobTitle ? 'No current job postings for that role.' : 'Set your job title in your profile to see job postings for your role.'}
            </p>
          ) : (
            <JobPostingsTable jobs={jobPostings} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}