/**
 * Static lookup for role replacement signal (0–1) inspired by WEF Future of Jobs report.
 * Used in AI_Score formula as: role_replacement_signal component.
 * Normalized role keys are matched case-insensitively; unknown roles get a default.
 */

const WEF_REPLACEMENT_BY_ROLE: Record<string, number> = {
  // High automation exposure (0.7–0.95)
  'data entry clerk': 0.92,
  'data entry': 0.90,
  'data entry operator': 0.88,
  'accounts clerk': 0.85,
  'cashier': 0.82,
  'receptionist': 0.78,
  'customer support': 0.75,
  'customer service': 0.75,
  'call center': 0.78,
  'bpo': 0.76,
  'bpo voice': 0.78,
  'bpo non-voice': 0.74,
  'telemarketing': 0.80,
  'bookkeeping': 0.82,
  'payroll clerk': 0.80,
  'administrative assistant': 0.72,
  'secretary': 0.75,
  'bank teller': 0.85,
  'assembly line': 0.88,
  'machine operator': 0.82,
  // Medium-high (0.5–0.69)
  'software engineer': 0.55,
  'software developer': 0.55,
  'developer': 0.55,
  'programmer': 0.58,
  'web developer': 0.52,
  'frontend developer': 0.50,
  'backend developer': 0.52,
  'data analyst': 0.60,
  'business analyst': 0.55,
  'financial analyst': 0.58,
  'content writer': 0.65,
  'technical writer': 0.60,
  'copywriter': 0.58,
  'graphic designer': 0.55,
  'ui designer': 0.52,
  'ux designer': 0.48,
  'hr coordinator': 0.62,
  'recruiter': 0.58,
  'sales representative': 0.52,
  'account manager': 0.45,
  // Medium (0.35–0.49)
  'project manager': 0.42,
  'product manager': 0.40,
  'devops engineer': 0.45,
  'data engineer': 0.48,
  'qa engineer': 0.50,
  'quality assurance': 0.50,
  'system administrator': 0.52,
  'network engineer': 0.48,
  'security analyst': 0.42,
  'marketing manager': 0.45,
  'operations manager': 0.42,
  // Lower automation exposure (0.15–0.34)
  'nurse': 0.30,
  'teacher': 0.28,
  'trainer': 0.32,
  'consultant': 0.35,
  'lawyer': 0.25,
  'doctor': 0.22,
  'psychologist': 0.20,
  'social worker': 0.25,
  'sales manager': 0.38,
  'ceo': 0.15,
  'cto': 0.28,
  'founder': 0.18,
}

const DEFAULT_REPLACEMENT_SIGNAL = 0.5

/** Normalize job title for lookup: lowercase, trim, collapse spaces */
function normalizeRole(title: string | null | undefined): string {
  if (!title || typeof title !== 'string') return ''
  return title.toLowerCase().trim().replace(/\s+/g, ' ')
}

/**
 * Get WEF-style role replacement signal (0–1) for a job title.
 * Tries exact match first, then prefix match (e.g. "Software Engineer" -> "software engineer").
 */
export function getRoleReplacementSignal(jobTitle: string | null | undefined): number {
  const key = normalizeRole(jobTitle)
  if (!key) return DEFAULT_REPLACEMENT_SIGNAL

  if (key in WEF_REPLACEMENT_BY_ROLE) {
    return WEF_REPLACEMENT_BY_ROLE[key]
  }

  // Prefix match: "software engineer - frontend" -> try "software engineer"
  for (const [role, score] of Object.entries(WEF_REPLACEMENT_BY_ROLE)) {
    if (key.startsWith(role) || key.includes(role)) {
      return score
    }
  }

  return DEFAULT_REPLACEMENT_SIGNAL
}
