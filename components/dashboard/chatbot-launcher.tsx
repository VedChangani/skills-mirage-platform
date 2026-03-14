'use client'
import { useEffect, useState } from 'react'
import { MessageSquare, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client' // ← adjust to your Supabase client path

// ---------------------------------------------------------------------------
// Streamlit base URL — from env var or hardcoded fallback
// ---------------------------------------------------------------------------
const CHATBOT_BASE =
  process.env.NEXT_PUBLIC_STREAMLIT_CHATBOT_URL ||
  'https://chatbot-final-2254.streamlit.app'

// ---------------------------------------------------------------------------
// Build the full iframe src given an access token.
// Always includes embed=true (required for Streamlit Community Cloud iframes).
// Appends sb_token so Streamlit can verify the user on first load.
// ---------------------------------------------------------------------------
function buildChatbotUrl(accessToken: string | null): string {
  const base = CHATBOT_BASE.replace(/\/$/, '')
  const params = new URLSearchParams({ embed: 'true' })
  // NEW VERSION (Matches your Streamlit logic)
if (accessToken) params.set('token', accessToken)
return `${base}?${params.toString()}`
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ChatbotLauncherProps {
  children: React.ReactNode
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ChatbotLauncher({ children }: ChatbotLauncherProps) {
  const [isOpen, setIsOpen] = useState(false)

  // The Supabase access token for the currently logged-in user.
  // null = not yet loaded. empty string = no active session.
  const [accessToken, setAccessToken] = useState<string | null>(null)

  // ---------------------------------------------------------------------------
  // Fetch session on mount and keep it fresh via onAuthStateChange.
  // Supabase tokens auto-refresh every hour — onAuthStateChange fires on
  // each refresh so chatbotUrl always has a valid token.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data }) => {
      // Set to token string if session exists, empty string if not logged in
      setAccessToken(data.session?.access_token ?? '')
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccessToken(session?.access_token ?? '')
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // ---------------------------------------------------------------------------
  // The iframe src is rebuilt whenever the token changes.
  // While accessToken is null (still loading) we don't render the iframe at
  // all — this prevents a flash of the "no token" warning in Streamlit.
  // ---------------------------------------------------------------------------
  const chatbotUrl = accessToken !== null ? buildChatbotUrl(accessToken) : null

  // ---------------------------------------------------------------------------
  // Render — identical markup and layout to the original component
  // ---------------------------------------------------------------------------
  return (
    <>
      {/* Main content — gets right margin when chatbot panel is open */}
      <div
        className={cn(
          'min-h-screen w-full transition-[margin-right] duration-200',
          isOpen && chatbotUrl && 'mr-[30%]'
        )}
      >
        {children}
      </div>

      {/* Chatbot split panel — 30% fixed on the right */}
      {isOpen && chatbotUrl && (
        <aside
          className="fixed right-0 top-0 z-40 flex h-screen w-[30%] min-w-[320px] max-w-[500px] flex-col border-l border-border bg-background shadow-xl"
          aria-label="Chatbot panel"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-medium text-foreground">
              AI Chatbot
            </span>
          </div>
          <div className="flex-1 min-h-0">
            {/*
              Key insight: by using chatbotUrl as the React key, we force
              the iframe to fully remount if the token ever changes (e.g. after
              a token refresh). This guarantees Streamlit always receives a
              fresh, valid token in the URL rather than stale params from a
              cached iframe.
            */}
            <iframe
              key={chatbotUrl}
              src={chatbotUrl}
              title="Streamlit Chatbot"
              className="h-full w-full border-0"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          </div>
        </aside>
      )}

      {/* Floating button with Castor greeting — bottom right */}
      {chatbotUrl && (
        <div
          className={cn(
            'fixed bottom-6 z-50 flex flex-col items-end gap-2',
            isOpen ? 'right-[calc(30%+1.5rem)]' : 'right-6'
          )}
        >
          {/* Speech bubble — only shown when panel is closed */}
          {!isOpen && (
            <div className="relative max-w-[240px] rounded-lg rounded-br-sm border border-border bg-card px-4 py-2.5 shadow-md">
              <p className="text-sm text-white leading-snug">
                Hi! I am Castor. How can I help you?
              </p>
              {/* Tail pointing toward the button */}
              <div
                className="absolute -bottom-1.5 right-4 h-2.5 w-2.5 rotate-45 border-r border-b border-border bg-card"
                aria-hidden
              />
            </div>
          )}

          <Button
            onClick={() => setIsOpen((o) => !o)}
            size="icon"
            className={cn(
              'h-[58px] w-[58px] rounded-full shadow-lg',
              'text-white',
              'transition-all hover:scale-105'
            )}
            style={{ backgroundColor: '#9F00FF' }}
            aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <MessageSquare className="h-6 w-6" />
            )}
          </Button>
        </div>
      )}
    </>
  )
}
