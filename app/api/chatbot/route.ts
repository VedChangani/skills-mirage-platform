import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type UserContext = { jobTitle?: string | null; city?: string | null; yearsOfExperience?: number | null }

function isHindi(text: string) {
  return /[\u0900-\u097F]/.test(text)
}

function normalize(text: string) {
  return text.toLowerCase().trim()
}

function parseDurationMonths(duration: string | null): number | null {
  if (!duration) return null
  const t = duration.toLowerCase()
  const n = t.match(/(\d+(\.\d+)?)/)
  if (!n) return null
  const value = Number(n[1])
  if (!Number.isFinite(value)) return null
  if (t.includes('week')) return value / 4
  if (t.includes('day')) return value / 30
  // default months
  return value
}

async function getSupabaseServer() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )
}

async function answerQuestion(q: string, userContext: UserContext, supabase: Awaited<ReturnType<typeof getSupabaseServer>>) {
  const text = normalize(q)
  const hindi = isHindi(q)
  const admin = createAdminClient()

  // 1) BPO jobs in Indore (data-backed)
  if (text.includes('bpo') && (text.includes('indore') || text.includes('इंदौर'))) {
    const { count } = await admin
      .from('naukri_jobs')
      .select('*', { count: 'exact', head: true })
      .ilike('location', '%indore%')
      .or('jobtitle.ilike.%bpo%,jobtitle.ilike.%call%center%,jobtitle.ilike.%customer%support%')

    const total = count ?? 0

    if (hindi) {
      return `इंदौर में अभी (डेटा के अनुसार) लगभग **${total}** BPO/Customer Support जॉब पोस्टिंग्स दिख रही हैं।\n\nअगर आप चाहें तो मैं आपके लिए टॉप टाइटल्स/कंपनियाँ भी निकाल दूँ — बताइए: Full-time चाहिए या Fresher-friendly?`
    }
    return `Based on the jobs data, there are **${total}** BPO/Customer Support postings in **Indore** right now.\n\nIf you want, tell me your experience level and I’ll summarize the top roles and companies.`
  }

  // 2) Paths < 3 months (data-backed from courses)
  if (text.includes('less than 3') || text.includes('under 3') || text.includes('3 months') || text.includes('3 month')) {
    const { data: courses } = await admin.from('courses').select('title, discipline, duration, url').limit(200)
    const short = (courses ?? [])
      .map((c) => ({ ...c, months: parseDurationMonths(c.duration) }))
      .filter((c) => c.months != null && c.months <= 3)
      .slice(0, 8)

    if (!short.length) {
      return hindi
        ? 'अभी मेरे पास आपकी `courses` टेबल में 3 महीने से कम अवधि वाले कोर्स नहीं मिले। अगर `duration` फॉर्मैट (जैसे "2 months") है तो मैं उसी पर फ़िल्टर कर रहा हूँ।'
        : 'I couldn’t find any courses in your `courses` table with duration ≤ 3 months (based on the current `duration` strings).'
    }

    const lines = short
      .map((c, i) => `${i + 1}. **${c.title}** (${c.discipline || 'General'} • ${c.duration || 'Self-paced'})${c.url ? ` — ${c.url}` : ''}`)
      .join('\n')

    return hindi
      ? `ये कुछ **3 महीने से कम** वाले paths/courses हैं:\n\n${lines}\n\nआप बताइए आपका लक्ष्य क्या है (जॉब स्विच / प्रमोशन / फ्रीलांस), मैं इन्हें एक 2–3 month roadmap में बाँध दूँगा।`
      : `Here are some **≤ 3 months** options from your course catalog:\n\n${lines}\n\nTell me your goal (switch / promotion / freelance) and I’ll turn this into a 2–3 month roadmap.`
  }

  // 3) Risk score question (contextual, rules)
  if (text.includes('risk score') || text.includes('risk') && text.includes('high')) {
    const jobTitle = userContext.jobTitle || 'your role'
    const city = userContext.city || 'your location'
    if (hindi) {
      return `आपका risk score ज़्यादा होने के सामान्य कारण:\n\n- **काम का प्रकृति**: ${jobTitle} में अगर tasks repeatable/standardized हैं तो automation exposure बढ़ता है\n- **टूलिंग बदलाव**: AI tools productivity बढ़ा रहे हैं, इसलिए routine हिस्से जल्दी commoditize होते हैं\n- **लोकल मार्केट**: ${city} में supply/demand और competition भी score को प्रभावित कर सकता है\n\nअगर आप अपना **daily tasks** 3–5 पॉइंट्स में लिख दें, मैं बताऊँगा कौन‑से tasks सबसे ज़्यादा risky हैं और किन skills से risk कम होगा।`
    }
    return `Common reasons a “risk score” can be high:\n\n- **Task composition**: if a big part of your work is repetitive/standardized, automation exposure rises\n- **Tool disruption**: AI tools are shrinking time-to-output for routine work, commoditizing parts of ${jobTitle}\n- **Local market pressure**: competition and hiring patterns around ${city} can amplify perceived risk\n\nIf you paste 3–5 bullet points of your daily tasks, I’ll break down which tasks are most at risk and what to learn to reduce it.`
  }

  // 4) Safer jobs question (contextual, rules)
  if (text.includes('safer') || text.includes('safe jobs')) {
    const jobTitle = userContext.jobTitle || 'your profile'
    if (hindi) {
      return `“आपके जैसे” प्रोफ़ाइल के लिए आमतौर पर safer directions वे होते हैं जहाँ **human judgment + coordination + domain context** ज़रूरी हो:\n\n- **Customer Success / Account Management** (relationship-heavy)\n- **Operations / Process Improvement** (systems thinking)\n- **QA + Compliance / Audit** (policy + accountability)\n- **Tech roles with ownership** (DevOps/SRE, Security, Data Engineering)\n\nआप अपना ${jobTitle} और experience level बताएँ, मैं 5 role options + skills roadmap दे दूँगा।`
    }
    return `For a profile like ${jobTitle}, “safer” directions tend to be roles needing **human judgment + coordination + domain context**:\n\n- Customer Success / Account Management\n- Operations / Process Improvement\n- QA + Compliance / Audit\n- Ownership-heavy tech roles (DevOps/SRE, Security, Data Engineering)\n\nShare your experience level and I’ll recommend 5 role targets + a skills roadmap.`
  }

  // Default (bilingual)
  return hindi
    ? 'मैं मदद कर सकता हूँ। आप क्या जानना चाहते हैं: risk score, safer jobs, <3 महीने वाले paths, या किसी city में job counts?'
    : 'I can help. Do you want help with your risk score, safer jobs, <3 months paths, or job counts for a city?'
}

export async function POST(req: Request) {
  const body = await req.json()
  const { message, userContext }: { message: string; userContext: UserContext } = body

  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // store user message
  await supabase.from('chat_messages').insert({
    user_id: user.id,
    role: 'user',
    content: message,
  })

  const reply = await answerQuestion(message, userContext ?? {}, supabase)

  await supabase.from('chat_messages').insert({
    user_id: user.id,
    role: 'assistant',
    content: reply,
  })

  return NextResponse.json({ reply })
}

