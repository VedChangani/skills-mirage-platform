/**
 * AI Replacement Risk score formula:
 *   AI_Score = (0.40 × hiring_decline_rate)
 *            + (0.35 × ai_tool_mention_rate_in_JDs)
 *            + (0.25 × role_replacement_signal)
 *
 * All inputs are normalized to 0–100 for the first two; role_replacement_signal is 0–1 (converted to 0–100 internally).
 */

export const AI_SCORE_WEIGHTS = {
  hiring_decline_rate: 0.4,
  ai_tool_mention_rate: 0.35,
  role_replacement_signal: 0.25,
} as const

export type JobRowForRisk = {
  jobtitle: string
  postdate: string | null
  skills: string | null
}

/** Keywords that indicate automation/AI tools in JDs (job title + skills) */
const AI_AUTOMATION_KEYWORDS = [
  'ai', 'artificial intelligence', 'machine learning', 'ml ', ' ml', 'automation',
  'chatgpt', 'gpt', 'llm', 'automated', 'rpa', 'bot', 'nlp', 'computer vision',
  'deep learning', 'neural', 'python', 'tensorflow', 'pytorch', 'copilot',
  'automate', 'scripting', 'api integration', 'workflow automation', 'low-code',
  'no-code', 'power automate', 'zapier', 'ai/ml', 'ai tools', 'generative ai',
]

function textContainsAiMention(text: string | null | undefined): boolean {
  if (!text || typeof text !== 'string') return false
  const lower = text.toLowerCase()
  return AI_AUTOMATION_KEYWORDS.some((kw) => lower.includes(kw))
}

/**
 * Compute hiring decline rate: % change in job volume, last 30 days vs prior 30 days.
 * Returns 0–100 (100 = max decline). Positive growth is capped as 0 decline.
 */
export function computeHiringDeclineRate(
  jobsLast30: JobRowForRisk[],
  jobsPrior30: JobRowForRisk[],
): number {
  const currentCount = jobsLast30.length
  const priorCount = jobsPrior30.length
  if (priorCount === 0) return 0
  const changePct = ((priorCount - currentCount) / priorCount) * 100
  return Math.max(0, Math.min(100, changePct))
}

/**
 * Compute AI tool mention rate: % of JDs in this role mentioning automation/AI tools.
 * Uses jobtitle + skills per row.
 */
export function computeAiToolMentionRate(jobs: JobRowForRisk[]): number {
  if (!jobs.length) return 0
  let withMention = 0
  for (const job of jobs) {
    const text = [job.jobtitle, job.skills].filter(Boolean).join(' ')
    if (textContainsAiMention(text)) withMention += 1
  }
  return (withMention / jobs.length) * 100
}

/**
 * Compute AI_Score (0–100) from the three components.
 * roleReplacementSignal is 0–1 (WEF-style); it is multiplied by 100 for the formula.
 */
export function computeAiReplacementScore(
  hiringDeclineRate: number,
  aiToolMentionRate: number,
  roleReplacementSignal: number,
): number {
  const w = AI_SCORE_WEIGHTS
  const raw =
    w.hiring_decline_rate * Math.min(100, hiringDeclineRate) +
    w.ai_tool_mention_rate * Math.min(100, aiToolMentionRate) +
    w.role_replacement_signal * (roleReplacementSignal * 100)
  return Math.round(Math.max(0, Math.min(100, raw)))
}

export type AiScoreBreakdown = {
  aiScore: number
  hiringDeclineRate: number
  aiToolMentionRate: number
  roleReplacementSignal: number
  jobsLast30Count: number
  jobsPrior30Count: number
}
