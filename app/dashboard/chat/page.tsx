import { createClient } from '@/lib/supabase/server'
import { ChatInterface } from '@/components/dashboard/chat-interface'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <div className="h-[calc(100vh-7rem)]">
      <ChatInterface 
        userContext={{
          jobTitle: profile?.job_title,
          city: profile?.city,
          yearsOfExperience: profile?.years_of_experience,
        }}
        chatId={user?.id ?? 'guest'}
      />
    </div>
  )
}
