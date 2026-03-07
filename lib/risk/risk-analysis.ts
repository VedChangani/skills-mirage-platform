/**
 * Risk analysis intelligence layer: fetches profile + jobs from Supabase,
 * computes AI replacement score (formula), task automation, market saturation,
 * and overall risk from job description (job_title + daily_tasks) and AI risk.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { getRoleReplacementSignal } from './wef-role-replacement'
import {
  computeHiringDeclineRate,
  computeAiToolMentionRate,
  computeAiReplacementScore,
  type JobRowForRisk,
  type AiScoreBreakdown,
} from './ai-replacement-score'

export type RiskAnalysisResult = {
  overallRisk: number
  taskAutomation: number
  aiReplacement: number
  marketSaturation: number
  aiScoreBreakdown: AiScoreBreakdown
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
}

type JobsRow = { jobtitle: string; postdate: string | null; skills: string | null }
type NaukriRow = { jobtitle: string; postdate: string | null; skills: string | null }

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

/** Normalize for matching: lowercase, trim */
function normalize(s: string | null | undefined): string {
  if (!s || typeof s !== 'string') return ''
  return s.toLowerCase().trim()
}

/** Return true if job title is considered "same role" as user job title (simple overlap) */
function isRoleMatch(userJobTitle: string | null | undefined, jobTitle: string | null | undefined): boolean {
  const u = normalize(userJobTitle)
  const j = normalize(jobTitle)
  if (!u || !j) return true // no filter if missing
  // Same or one contains the other
  if (u === j) return true
  if (j.includes(u)) return true
  if (u.includes(j)) return true
  // Shared significant word (e.g. "engineer", "analyst")
  const uWords = u.split(/\s+/).filter((w) => w.length > 2)
  const jWords = j.split(/\s+/).filter((w) => w.length > 2)
  return uWords.some((w) => jWords.includes(w))
}

function toJobRowForRisk(r: JobsRow | NaukriRow): JobRowForRisk {
  return { jobtitle: r.jobtitle, postdate: r.postdate, skills: r.skills ?? null }
}

function parseDate(s: string | null | undefined): number {
  if (!s) return Date.now()
  const t = new Date(s).getTime()
  return Number.isFinite(t) ? t : Date.now()
}

export async function fetchRiskAnalysis(
  admin: SupabaseClient,
  profile: { job_title: string | null; daily_tasks: string | null } | null,
): Promise<RiskAnalysisResult> {
  const userJobTitle = profile?.job_title ?? null

  const now = Date.now()

  const [
    { data: jobsData },
    { data: naukriData },
  ] = await Promise.all([
    admin
      .from('jobs')
      .select('jobtitle, postdate, skills')
      .not('postdate', 'is', null)
      .order('postdate', { ascending: false })
      .limit(500),
    admin
      .from('naukri_jobs')
      .select('jobtitle, postdate, skills')
      .not('postdate', 'is', null)
      .order('postdate', { ascending: false })
      .limit(500),
  ])

  const allJobs: JobRowForRisk[] = [
    ...((jobsData as JobsRow[] | null) ?? []).map(toJobRowForRisk),
    ...((naukriData as NaukriRow[] | null) ?? []).map(toJobRowForRisk),
  ]

  const roleMatch = (r: JobRowForRisk) => isRoleMatch(userJobTitle, r.jobtitle)
  const roleJobs = userJobTitle ? allJobs.filter(roleMatch) : allJobs

  const jobsLast30: JobRowForRisk[] = []
  const jobsPrior30: JobRowForRisk[] = []
  for (const job of roleJobs) {
    const t = parseDate(job.postdate)
    if (t >= now - THIRTY_DAYS_MS) jobsLast30.push(job)
    else if (t >= now - 2 * THIRTY_DAYS_MS && t < now - THIRTY_DAYS_MS) jobsPrior30.push(job)
  }

  const hiringDeclineRate = computeHiringDeclineRate(jobsLast30, jobsPrior30)
  const aiToolMentionRate = computeAiToolMentionRate(roleJobs.length ? roleJobs : jobsLast30.length ? jobsLast30 : allJobs)
  const roleReplacementSignal = getRoleReplacementSignal(userJobTitle)

  const aiScore = computeAiReplacementScore(
    hiringDeclineRate,
    aiToolMentionRate,
    roleReplacementSignal,
  )

  const aiScoreBreakdown: AiScoreBreakdown = {
    aiScore,
    hiringDeclineRate,
    aiToolMentionRate,
    roleReplacementSignal,
    jobsLast30Count: jobsLast30.length,
    jobsPrior30Count: jobsPrior30.length,
  }

  // Task automation: from WEF role replacement (job description) + optional boost from daily_tasks keywords
  const taskAutomationFromRole = roleReplacementSignal * 100
  const dailyTasks = profile?.daily_tasks ?? ''
  const automationKeywords = ['automate', 'automation', 'script', 'report', 'data entry', 'routine', 'repetitive', 'template', 'standardized']
  const taskBoost = automationKeywords.some((kw) => dailyTasks.toLowerCase().includes(kw)) ? 10 : 0
  const taskAutomation = Math.min(100, Math.round(taskAutomationFromRole + taskBoost))

  // Market saturation: inverse of job growth (more jobs = less saturation).
  const growthPct = jobsPrior30.length > 0
    ? ((jobsLast30.length - jobsPrior30.length) / jobsPrior30.length) * 100
    : 0
  const marketSaturation = Math.max(0, Math.min(100, Math.round(50 - growthPct * 0.5)))

  // Overall risk: weighted combination of job-description-derived task automation and AI replacement risk
  const overallRisk = Math.round(
    0.4 * taskAutomation + 0.5 * aiScore + 0.1 * marketSaturation,
  )
  const overallClamped = Math.max(0, Math.min(100, overallRisk))

  const riskLevel: RiskAnalysisResult['riskLevel'] =
    overallClamped >= 80 ? 'Critical' : overallClamped >= 60 ? 'High' : overallClamped >= 40 ? 'Medium' : 'Low'

  return {
    overallRisk: overallClamped,
    taskAutomation,
    aiReplacement: aiScore,
    marketSaturation,
    aiScoreBreakdown,
    riskLevel,
  }
}
