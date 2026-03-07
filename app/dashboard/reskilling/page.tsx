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

type CourseRow = {
  title: string
  discipline: string | null
  duration: string | null
  url: string | null
}

export default async function ReskillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id ?? '')
    .maybeSingle()

  const admin = createAdminClient()

  // We fetch a larger batch to allow the "Intelligent Mapping" to find hidden gems
  const { data: coursesData } = await admin
    .from('courses')
    .select('title, discipline, duration, url')
    .limit(1000)

  const allCourses = (coursesData ?? []) as CourseRow[]
  const jobTitleRaw = (profile?.job_title || '').trim()
  const jobTitleClean = jobTitleRaw.toLowerCase()

  // 1. THE INTELLIGENCE ENGINE (Taxonomy Mapping)
  // This maps primary roles to "related" subjects even if the words don't appear in the title
  // 1. THE INTELLIGENCE ENGINE (Taxonomy Mapping)
  const ROLE_TAXONOMY: Record<string, string[]> = {
    // Engineering & Tech
    "software engineer": ["computer engineering", "system design", "software architecture", "data structures", "algorithms", "backend", "full stack", "cloud computing", "solid principles"],
    "software developer": ["computer engineering", "system design", "software architecture", "data structures", "algorithms", "backend", "full stack"],
    "computer engineer": ["software engineering", "embedded systems", "operating systems", "microprocessors", "hardware", "c++", "robotics", "computer architecture"],
    "frontend developer": ["ui/ux", "web design", "javascript", "react", "css", "frontend architecture", "tailwind", "typescript", "responsive design"],
    "backend developer": ["node.js", "databases", "api design", "golang", "java", "python", "distributed systems", "sql", "microservices"],
    "devops engineer": ["docker", "kubernetes", "aws", "ci/cd", "terraform", "linux administration", "automation", "azure", "jenkins"],
    "cyber security": ["ethical hacking", "network security", "cryptography", "infosec", "penetration testing", "cloud security", "firewall"],
    "mobile developer": ["ios", "android", "react native", "flutter", "swift", "kotlin", "mobile app architecture"],

    // Data & AI
    "data scientist": ["machine learning", "artificial intelligence", "python", "statistics", "data engineering", "big data", "r programming", "neural networks", "deep learning"],
    "data analyst": ["sql", "excel", "tableau", "power bi", "statistics", "data visualization", "business intelligence", "pandas"],
    "ai engineer": ["neural networks", "nlp", "computer vision", "tensorflow", "pytorch", "large language models", "machine learning"],

    // Product & Design
    "product manager": ["agile", "scrum", "product strategy", "business analysis", "user research", "market analysis", "roadmap planning", "product lifecycle"],
    "ui/ux designer": ["figma", "prototyping", "user experience", "interface design", "wireframing", "interaction design", "accessibility"],
    "product designer": ["design systems", "ui design", "ux research", "product strategy", "prototyping"],

    // Business, Marketing & Finance
    "digital marketer": ["seo", "sem", "content marketing", "social media strategy", "google analytics", "email marketing", "copywriting"],
    "financial analyst": ["corporate finance", "accounting", "financial modeling", "valuation", "excel", "investment banking", "fintech"],
    "hr manager": ["talent acquisition", "organizational behavior", "employee relations", "performance management", "hr tech", "leadership"],
    "sales manager": ["crm", "negotiation", "lead generation", "sales strategy", "account management", "business development"],
    "project manager": ["pmp", "agile", "risk management", "stakeholder management", "project scheduling", "lean"],

    // Creative & Other
    "content writer": ["copywriting", "seo", "content strategy", "creative writing", "blogging", "editing"],
    "graphic designer": ["photoshop", "illustrator", "branding", "typography", "visual communication", "indesign"]
  }
  // 2. EXTRACTION & EXPANSION
  const extractKeywords = (text: string): string[] => {
    const generic = new Set(['developer', 'engineer', 'senior', 'junior', 'lead', 'staff', 'specialist'])
    return text
      .split(/[\s/]+/)
      .filter(w => w.length >= 2 && !generic.has(w))
  }

  // Get keywords from the actual title (e.g., "Software")
  const directKeywords = extractKeywords(jobTitleClean)

  // Get keywords from the taxonomy (e.g., "Computer Engineering", "Algorithms")
  const expandedKeywords = Object.entries(ROLE_TAXONOMY)
    .filter(([role]) => jobTitleClean.includes(role))
    .flatMap(([_, related]) => related)

  // The final search profile is a unique mix of direct and intelligent matches
  const searchProfile = [...new Set([...directKeywords, ...expandedKeywords])]

  // 3. INTELLIGENT MATCHING LOGIC
  const filteredCourses = allCourses.filter((c) => {
    if (searchProfile.length === 0) return false
    const content = `${c.title} ${c.discipline}`.toLowerCase()
    
    return searchProfile.some((k) => {
      // Boundaries ensure "Java" doesn't match "JavaScript"
      const regex = new RegExp(`\\b${k}\\b`, 'i')
      return regex.test(content)
    })
  })

  // 4. RELEVANCE SCORING (For ranking results)
  const scoreRelevance = (c: CourseRow): number => {
    let score = 0
    const title = (c.title || '').toLowerCase()
    const disc = (c.discipline || '').toLowerCase()
    
    searchProfile.forEach(k => {
      const regex = new RegExp(`\\b${k}\\b`, 'i')
      if (regex.test(title)) score += 10 // Title matches are highest value
      if (regex.test(disc)) score += 5   // Category matches are secondary
    })
    return score
  }

  // 5. GROUPING INTO PATHS
  const byDiscipline = new Map<string, CourseRow[]>()
  filteredCourses.forEach(c => {
    const key = (c.discipline || 'Technical Core').trim()
    const list = byDiscipline.get(key) ?? []
    list.push(c)
    byDiscipline.set(key, list)
  })

  const paths = Array.from(byDiscipline.entries())
    .map(([discipline, list]) => {
      const sortedList = [...list].sort((a, b) => scoreRelevance(b) - scoreRelevance(a))
      const pick = sortedList.slice(0, 5)
      
      // Intelligence Score: How much of the search profile is covered here?
      const coverage = searchProfile.filter(k => 
        pick.some(c => new RegExp(`\\b${k}\\b`, 'i').test(`${c.title} ${c.discipline}`))
      ).length
      const matchScore = Math.min(98, 65 + Math.round((coverage / searchProfile.length) * 33))

      return {
        id: discipline,
        title: discipline,
        description: `High-impact roadmap covering ${discipline} essentials for ${jobTitleRaw}.`,
        matchScore,
        duration: '3–6 Months',
        difficulty: 'Professional',
        salaryIncrease: '+20%',
        courses: pick.map(c => ({
          name: c.title,
          provider: c.discipline || 'Professional Training',
          duration: c.duration || 'Self-paced',
          url: c.url
        }))
      }
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3)

  // Gap Analysis Stats
  const matchedKeywordsCount = searchProfile.filter(k => 
    allCourses.some(c => new RegExp(`\\b${k}\\b`, 'i').test(`${c.title} ${c.discipline}`))
  ).length
  const currentAlignment = searchProfile.length > 0 
    ? Math.round((matchedKeywordsCount / searchProfile.length) * 100) 
    : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Reskilling Paths</h1>
        <p className="text-muted-foreground">
          AI-driven skill mapping based on your professional trajectory.
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
                <h3 className="font-semibold text-foreground">Intelligence Gap Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Role: <span className="text-primary font-medium">{jobTitleRaw || 'User Profile'}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {Math.max(0, searchProfile.length - matchedKeywordsCount)}
              </div>
              <div className="text-xs text-muted-foreground">Skill Clusters to Bridge</div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">Career Alignment</div>
              <div className="flex items-center gap-2">
                <Progress value={currentAlignment} className="h-2 flex-1" />
                <span className="text-sm font-medium text-foreground">{currentAlignment}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Matched {matchedKeywordsCount} of {searchProfile.length} intelligence points
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">Target Proficiency</div>
              <div className="text-sm font-medium text-foreground">Industry Ready</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">Relevance Model</div>
              <div className="text-sm font-medium text-foreground text-primary">Taxonomy v2.0</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Intelligent Recommendations
        </h2>

        {paths.length === 0 ? (
          <Card className="border-border/50 bg-card/80 backdrop-blur">
            <CardContent className="py-12 text-center">
              <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground font-medium">No courses available for this role</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                {!jobTitleRaw
                  ? 'Complete your profile to unlock reskilling roadmaps.'
                  : `Our taxonomy found 0 matches for "${jobTitleRaw}". Try using a standard industry title like "Software Engineer" or "Data Scientist".`}
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
                        {path.matchScore}% Match
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">{path.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{path.salaryIncrease}</div>
                    <div className="text-xs text-muted-foreground">Market value increase</div>
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
                    <BookOpen className="w-4 h-4" />
                    {path.courses.length} Targeted Courses
                  </div>
                </div>

                <div className="space-y-3">
                  {path.courses.map((course, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/50 hover:border-primary/40 transition-all">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground text-sm">{course.name}</div>
                        <div className="text-xs text-muted-foreground">{course.provider}</div>
                      </div>
                      <Button variant="ghost" size="sm" className="hover:bg-primary hover:text-white" asChild>
                        <a href={course.url || '#'} target="_blank" rel="noreferrer">
                          Enrol <ArrowRight className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>

                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Zap className="w-4 h-4 mr-2" />
                  Begin Reskilling Roadmap
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}