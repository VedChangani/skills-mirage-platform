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
  TrendingUp,
  CheckCircle
} from 'lucide-react'

export default async function ReskillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

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

  const courses = (coursesData ?? []) as CourseRow[]

  const byDiscipline = new Map<string, CourseRow[]>()
  for (const c of courses) {
    const key = (c.discipline || 'General').trim() || 'General'
    const list = byDiscipline.get(key) ?? []
    list.push(c)
    byDiscipline.set(key, list)
  }

  const jobTitle = (profile?.job_title || '').toLowerCase()
  const sortedDisciplines = Array.from(byDiscipline.entries()).sort((a, b) => {
    const aKey = a[0].toLowerCase()
    const bKey = b[0].toLowerCase()
    const aBoost = jobTitle && aKey.includes(jobTitle) ? 1 : 0
    const bBoost = jobTitle && bKey.includes(jobTitle) ? 1 : 0
    if (aBoost !== bBoost) return bBoost - aBoost
    return (b[1].length ?? 0) - (a[1].length ?? 0)
  })

  const paths = sortedDisciplines.slice(0, 3).map(([discipline, list], idx) => {
    const pick = list.slice(0, 5)
    const shortCourses = pick.filter((c) => (c.duration || '').toLowerCase().includes('month') && (c.duration || '').includes('1') || (c.duration || '').includes('2') || (c.duration || '').includes('3'))
    const matchScore = Math.min(95, 70 + Math.round((pick.length / 5) * 20))

    return {
      id: discipline || idx + 1,
      title: discipline,
      description: `Courses curated from your Supabase catalog for ${discipline}.`,
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
      skills: [],
    }
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Reskilling Paths</h1>
        <p className="text-muted-foreground">
          Personalized career transition roadmaps based on your profile
        </p>
      </div>

      {/* Skills Gap Summary */}
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
                  Based on your current role as {profile?.job_title || 'Software Engineer'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">3</div>
              <div className="text-xs text-muted-foreground">Critical skills to acquire</div>
            </div>
          </div>
          
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">Current Alignment</div>
              <div className="flex items-center gap-2">
                <Progress value={72} className="h-2 flex-1" />
                <span className="text-sm font-medium text-foreground">72%</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">Target Alignment</div>
              <div className="flex items-center gap-2">
                <Progress value={95} className="h-2 flex-1" />
                <span className="text-sm font-medium text-primary">95%</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">Estimated Time</div>
              <div className="text-sm font-medium text-foreground">6-9 months</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reskilling Paths */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Recommended Paths
        </h2>

        {paths.map((path) => (
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
              {/* Path Stats */}
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

              {/* Skills to Learn */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Skills You&apos;ll Learn</h4>
                <div className="flex flex-wrap gap-2">
                  {path.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-muted/50">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Course Roadmap */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Course Roadmap</h4>
                <div className="space-y-3">
                  {path.courses.map((course, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        course.completed 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground border border-border'
                      }`}>
                        {course.completed ? <CheckCircle className="w-4 h-4" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground text-sm">{course.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {course.provider} • {course.duration}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-border">
                        {course.url ? (
                          <a href={course.url} target="_blank" rel="noreferrer" className="inline-flex items-center">
                            Start
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </a>
                        ) : (
                          <>
                            Start
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Zap className="w-4 h-4 mr-2" />
                Start This Path
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
