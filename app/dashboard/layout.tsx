import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { SidebarProvider } from '@/components/ui/sidebar'

// Mock user data for development/preview
const mockUser = {
  id: 'mock-user-id',
  email: 'demo@skillsmirage.io',
  user_metadata: {
    full_name: 'Demo Agent',
  },
}

const mockProfile = {
  id: 'mock-user-id',
  job_title: 'Data Analyst',
  city: 'San Francisco',
  years_of_experience: 5,
  daily_tasks: 'Data analysis, reporting, SQL queries, Excel modeling',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = mockUser
  const profile = mockProfile

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar user={user} profile={profile} />
        <div className="flex flex-1 flex-col">
          <DashboardHeader user={user} />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
