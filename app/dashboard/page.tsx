import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  TrendingUp,
  Target,
  Brain,
  MessageSquare,
  User as UserIcon,
  ArrowRight,
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id ?? '')
    .maybeSingle()

  const overviewSections = [
    {
      title: 'Market Signals',
      href: '/dashboard/market',
      icon: TrendingUp,
      description: 'Real-time job market intelligence for your role. See active postings, hiring trends over time, average salary, and top locations.',
      cta: 'View market',
    },
    {
      title: 'Risk Analysis',
      href: '/dashboard/risk',
      icon: Target,
      description: 'Understand your automation exposure. Get a risk assessment based on your role and location.',
      cta: 'Check risk',
    },
    {
      title: 'Reskilling Paths',
      href: '/dashboard/reskilling',
      icon: Brain,
      description: 'Personalized learning paths aligned to your job title. See course recommendations and current vs target alignment.',
      cta: 'Explore paths',
    },
    {
      title: 'Intel Agent',
      href: '/dashboard/chat',
      icon: MessageSquare,
      description: 'Chat with an AI assistant that uses your profile to answer questions about jobs, courses, risk, and career next steps.',
      cta: 'Open chat',
    },
    {
      title: 'Profile',
      href: '/dashboard/profile',
      icon: UserIcon,
      description: 'Manage your job title, city, experience, and daily tasks. Your profile drives personalized insights across the platform.',
      cta: 'Edit profile',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Command Center</h1>
        <p className="text-muted-foreground max-w-2xl">
          Welcome back, {profile?.full_name || profile?.job_title || 'there'}. This is your overview of what the platform does and how each section helps you.
        </p>
      </div>

      <Card className="border-border/50 bg-card/80 backdrop-blur border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            What this platform does
          </CardTitle>
          <CardDescription className="max-w-2xl">
            A workforce intelligence platform that helps you see job market signals for your role,
            assess automation risk, discover reskilling paths, and get answers from an AI agent—all tailored to your profile.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">What you can do here</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {overviewSections.map((section) => {
            const Icon = section.icon
            return (
              <Card key={section.href} className="border-border/50 bg-card/80 backdrop-blur hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-foreground text-lg">{section.title}</CardTitle>
                  </div>
                  <CardDescription className="mt-1">{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="border-primary/30 text-primary" asChild>
                    <Link href={section.href}>
                      {section.cta}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <Card className="border-border/50 bg-muted/20">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> Set your job title and location in{' '}
            <Link href="/dashboard/profile" className="text-primary underline underline-offset-2">Profile</Link>
            {' '}to get personalized market data, trends, and course recommendations everywhere else.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
