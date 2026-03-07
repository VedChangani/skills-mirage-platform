'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Send, 
  Radar,
  Bot,
  User,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ChatInterfaceProps {
  userContext?: {
    jobTitle?: string | null
    city?: string | null
    yearsOfExperience?: number | null
  }
  chatId?: string
}

const suggestedPrompts = [
  "Why is my risk score so high?",
  "What jobs are safer for someone like me?",
  "Show me paths that take less than 3 months.",
  "How many BPO jobs are in Indore right now?",
  "मुझे क्या करना चाहए?",
  "What's my biggest career risk right now?",
  "What skills should I learn next?",
  "Analyze the job market for my role",
]

type Msg = { id: string; role: 'user' | 'assistant'; content: string }

export function ChatInterface({ userContext, chatId }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Msg[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load persistent memory from Supabase for this user (chatId == user id)
    if (!chatId || chatId === 'guest') {
      setMessages([])
      return
    }

    let cancelled = false
    const supabase = createClient()

    ;(async () => {
      const { data, error: loadError } = await supabase
        .from('chat_messages')
        .select('id, role, content, created_at')
        .order('created_at', { ascending: true })
        .limit(100)

      if (cancelled) return
      if (loadError) {
        setError(loadError.message)
        return
      }

      setMessages(
        (data ?? []).map((m) => ({
          id: `db-${m.id}`,
          role: m.role,
          content: m.content,
        })),
      )
    })()

    return () => {
      cancelled = true
    }
  }, [chatId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const text = input.trim()
    setInput('')

    const userMsg: Msg = { id: `${Date.now()}-u`, role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: text, userContext }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || `Request failed (${res.status})`)
      }
      const data = (await res.json()) as { reply: string }
      const assistantMsg: Msg = { id: `${Date.now()}-a`, role: 'assistant', content: data.reply }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/30">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Intel Agent</h1>
            <p className="text-sm text-muted-foreground">Your AI career intelligence assistant</p>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/30 text-primary">
          <Sparkles className="w-3 h-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      {/* Chat Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 py-4">
        <div className="space-y-4 pr-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 mb-4">
                <Radar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Welcome to Intel Agent
              </h3>
              <p className="text-muted-foreground max-w-md mb-6">
                I&apos;m here to help you navigate your career with intelligence. Ask me about job market trends, 
                reskilling opportunities, or your automation risk assessment.
              </p>
              
              {/* Suggested Prompts */}
              <div className="grid grid-cols-2 gap-2 max-w-md">
                {suggestedPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-auto py-2 px-3 text-left justify-start text-xs text-muted-foreground hover:text-foreground border-border/50"
                    onClick={() => handleSuggestedPrompt(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/30">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                
                <Card className={`max-w-[80%] p-4 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-muted/30 border-border/50'
                }`}>
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                </Card>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 border border-border">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))
          )}
          
          {/* Loading indicator */}
          {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/30">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <Card className="bg-muted/30 border-border/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse delay-100" />
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse delay-200" />
                  <span className="ml-2">Analyzing...</span>
                </div>
              </Card>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 border border-destructive/30">
                <AlertCircle className="w-4 h-4 text-destructive" />
              </div>
              <Card className="bg-destructive/10 border-destructive/30 p-4">
                <p className="text-sm text-destructive">
                  {error}
                </p>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="pt-4 border-t border-border/50">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your career, skills, or market trends..."
            className="min-h-[60px] max-h-[120px] resize-none bg-input border-border focus:border-primary"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon"
            className="h-[60px] w-[60px] bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Intel Agent uses AI to provide career guidance. Verify important decisions with other sources.
        </p>
      </div>
    </div>
  )
}
