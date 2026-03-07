import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Brain,
  GraduationCap,
  Target,
  ArrowRight,
  Clock,
  Star,
  BookOpen,
  Zap,
  CheckCircle,
} from 'lucide-react'

export default async function ReskillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id ?? '')
    .maybeSingle()

  const admin = createAdminClient()

  type CourseRow = {
    title: string
    discipline: string | null
    duration: string | null
    url: string | null
  }

  const { data: coursesData } = await admin
    .from('courses')
    .select('title, discipline, duration, url')
    .limit(300)

  const allCourses = (coursesData ?? []) as CourseRow[]
  const jobTitleRaw = (profile?.job_title || '').trim()
  const jobTitle = jobTitleRaw.toLowerCase()

  const extractKeywords = (text: string, minLen = 2): string[] => {
    const stopwords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'as', 'is', 'was', 'are', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
      'i', 'me', 'my', 'we', 'our', 'you', 'your', 'they', 'them', 'their', 'this', 'that',
    ])
    return text
      .split(/[\s,;.!?()\-–—]+/)
      .map((w) => w.replace(/[^\w]/g, '').toLowerCase())
      .filter((w) => w.length >= minLen && !stopwords.has(w))
  }

  const jobKeywords = extractKeywords(jobTitle)

  // Only show courses that match the current user's job_title
  const courses =
    jobKeywords.length === 0
      ? []
      : allCourses.filter((c) => {
          const title = (c.title || '').toLowerCase()
          const discipline = (c.discipline || '').toLowerCase()
          return jobKeywords.some((k) => title.includes(k) || discipline.includes(k))
        })

  // Current alignment: % of role keywords (from job_title) covered by at least one course in the full catalog
  const totalRoleKeywords = jobKeywords.length || 1
  const matchedKeywords = new Set<string>()
  for (const c of allCourses) {
    const title = (c.title || '').toLowerCase()
    const discipline = (c.discipline || '').toLowerCase()
    for (const k of jobKeywords) {
      if (title.includes(k) || discipline.includes(k)) matchedKeywords.add(k)
    }
  }
  const currentAlignment = Math.round((matchedKeywords.size / totalRoleKeywords) * 100)
  const targetAlignment = 95

  const scoreRelevance = (c: CourseRow): number => {
    if (jobKeywords.length === 0) return 0
    const title = (c.title || '').toLowerCase()
    const discipline = (c.discipline || '').toLowerCase()
    return jobKeywords.filter((k) => discipline.includes(k) || title.includes(k)).length
  }

  const byDiscipline = new Map<string, CourseRow[]>()
  for (const c of courses) {
    const key = (c.discipline || 'General').trim() || 'General'
    const list = byDiscipline.get(key) ?? []
    list.push(c)
    byDiscipline.set(key, list)
  }

  const sortedDisciplines = Array.from(byDiscipline.entries())
    .map(([discipline, list]) => ({ discipline, list }))
    .sort((a, b) => {
      const aScore = a.list.reduce((s, c) => s + scoreRelevance(c), 0)
      const bScore = b.list.reduce((s, c) => s + scoreRelevance(c), 0)
      return bScore - aScore
    })

  const paths = sortedDisciplines.slice(0, 3).map(({ discipline, list }, idx) => {
    const sortedList = [...list].sort((a, b) => scoreRelevance(b) - scoreRelevance(a))
    const pick = sortedList.slice(0, 5)
    const matchScore = Math.min(95, 60 + Math.round((pick.length / 5) * 35))

    return {
      id: discipline || idx + 1,
      title: discipline,
      description: `Courses for ${discipline} aligned to your role (${profile?.job_title || 'profile'}).`,
      matchScore,
      duration: 'Under 3 months',
      difficulty: 'Beginner to Intermediate',
      salaryIncrease: '+10% to +30%',
      courses: pick.map((c) => ({
        name: c.title,
        provider: c.discipline || 'Course',
        duration: c.duration || 'Self-paced',
        completed: false,
        url: c.url,
      })),
      skills: [] as string[],
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Reskilling Paths</h1>
        <p className="text-muted-foreground">
          Personalized career transition roadmaps based on your profile
        </p>
      </div>

      <Card className="border-border/50 bg-card/80 backdrop-blur border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Skills Gap Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Based on your current role as {profile?.job_title || 'your profile'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {Math.max(0, jobKeywords.length - matchedKeywords.size)}
              </div>
              <div className="text-xs text-muted-foreground">Critical skills to acquire</div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">Current Alignment</div>
              <div className="flex items-center gap-2">
                <Progress value={currentAlignment} className="h-2 flex-1" />
                <span className="text-sm font-medium text-foreground">{currentAlignment}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {matchedKeywords.size} of {jobKeywords.length || 0} role keywords covered by catalog
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">Target Alignment</div>
              <div className="flex items-center gap-2">
                <Progress value={targetAlignment} className="h-2 flex-1" />
                <span className="text-sm font-medium text-primary">{targetAlignment}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Goal for role–course fit</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">Estimated Time</div>
              <div className="text-sm font-medium text-foreground">6–9 months</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Recommended Paths
          {jobTitleRaw && (
            <span className="text-sm font-normal text-muted-foreground">
              for {profile?.job_title ?? jobTitleRaw}
            </span>
          )}
        </h2>

        {paths.length === 0 ? (
          <Card className="border-border/50 bg-card/80 backdrop-blur">
            <CardContent className="py-12 text-center">
              <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground font-medium">No courses are available</p>
              <p className="text-sm text-muted-foreground mt-1">
                {!jobTitleRaw
                  ? 'Set your job title in your profile to see courses aligned to your role.'
                  : `No courses in the catalog match your current role (${profile?.job_title ?? jobTitleRaw}). Check back later or update your profile.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          paths.map((path) => (
            <Card key={path.id} className="border-border/50 bg-card/80 backdrop-blur overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      {path.title}
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        {path.matchScore}% match
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">{path.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{path.salaryIncrease}</div>
                    <div className="text-xs text-muted-foreground">potential salary increase</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {path.duration}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Star className="w-4 h-4" />
                    {path.difficulty}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <BookOpen className="w-4 h-4" />
                    {path.courses.length} courses
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Course Roadmap</h4>
                  <div className="space-y-3">
                    {path.courses.map((course, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          course.completed ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border border-border'
                        }`}>
                          {course.completed ? <CheckCircle className="w-4 h-4" /> : index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-foreground text-sm">{course.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {course.provider} • {course.duration}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="border-border" asChild>
                          {course.url ? (
                            <a href={course.url} target="_blank" rel="noreferrer" className="inline-flex items-center">
                              Start
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </a>
                          ) : (
                            <span className="inline-flex items-center">
                              Start
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </span>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Zap className="w-4 h-4 mr-2" />
                  Start This Path
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
