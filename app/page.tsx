import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Radar, 
  TrendingUp, 
  Target, 
  Brain, 
  MessageSquare, 
  ArrowRight,
  Shield,
  Activity,
  Zap
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(74,222,128,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(74,222,128,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] bg-chart-2/5 rounded-full blur-3xl" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/30">
              <Radar className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-foreground">Skills Mirage</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm text-primary font-medium">Real-time Workforce Intelligence</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Navigate the Future of Work with{' '}
            <span className="text-primary">Intelligence</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
            Skills Mirage connects workers with real-time market signals, automation risk analysis, 
            and AI-powered reskilling paths to stay ahead in the evolving job market.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Start Your Analysis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-muted">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-6 border-t border-border/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Intelligence at Your Fingertips
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Two layers of workforce intelligence to help you understand the market and your position in it.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Cards */}
            <div className="p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 border border-primary/30">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Live Market Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Real-time job posting trends, salary data, and skill demand signals aggregated from the market.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4 border border-destructive/30">
                <Target className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Automation Risk Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Understand which of your daily tasks are at risk of automation and get proactive alerts.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4 border border-chart-3/30">
                <TrendingUp className="w-6 h-6 text-chart-3" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Skills Gap Detection</h3>
              <p className="text-sm text-muted-foreground">
                Compare your skills against market demands and identify critical gaps to close.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-chart-2/10 flex items-center justify-center mb-4 border border-chart-2/30">
                <Brain className="w-6 h-6 text-chart-2" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Reskilling Pathways</h3>
              <p className="text-sm text-muted-foreground">
                Personalized learning paths with course recommendations and transition roadmaps.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 border border-primary/30">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">AI Intel Agent</h3>
              <p className="text-sm text-muted-foreground">
                Chat with your personal career intelligence agent for insights and recommendations.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-chart-5/10 flex items-center justify-center mb-4 border border-chart-5/30">
                <Shield className="w-6 h-6 text-chart-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Career Shield Score</h3>
              <p className="text-sm text-muted-foreground">
                A comprehensive resilience score that measures your career security over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 border-t border-border/50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Get started in three simple steps
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">1</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Create Your Profile</h3>
                <p className="text-muted-foreground">
                  Sign up and tell us about your current role, skills, and daily tasks. 
                  This helps us analyze your specific automation exposure.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">2</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Get Your Intelligence Briefing</h3>
                <p className="text-muted-foreground">
                  Access your personalized dashboard with real-time market data, 
                  risk assessments, and skill gap analysis tailored to your profile.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">3</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Take Action</h3>
                <p className="text-muted-foreground">
                  Follow personalized reskilling paths, chat with the AI agent for guidance, 
                  and track your career resilience score as you grow.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Zap className="w-4 h-4 mr-2" />
                Start Your Free Analysis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/30">
                <Radar className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold text-foreground">Skills Mirage</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Workforce Intelligence Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
