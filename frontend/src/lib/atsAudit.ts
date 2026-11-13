import type { ResumeDraft } from '../types'

export interface BulletAuditItem {
  companyOrProject: string
  bulletIndex: number
  text: string
  hasMetric: boolean
  firstWord: string
  isWeakVerb: boolean
  suggestedPowerVerbs: string[]
}

export interface AtsAuditResult {
  score: number
  grade: 'A+' | 'A' | 'B' | 'C' | 'Needs Work'
  color: string
  metricCount: number
  totalBullets: number
  metricPercentage: number
  weakVerbCount: number
  repeatedVerbs: { verb: string; count: number }[]
  bullets: BulletAuditItem[]
  contactIssues: string[]
  suggestions: string[]
}

const WEAK_VERBS = new Set([
  'worked',
  'helped',
  'assisted',
  'handled',
  'did',
  'made',
  'responsible',
  'participated',
  'involved',
  'supported',
  'tried',
  'looked',
  'took',
  'got',
])

const POWER_VERBS = [
  'Architected',
  'Spearheaded',
  'Engineered',
  'Orchestrated',
  'Overhauled',
  'Streamlined',
  'Automated',
  'Delivered',
  'Optimized',
  'Constructed',
  'Championed',
  'Scaled',
  'Standardized',
  'Accelerated',
  'Pioneered',
]

const METRIC_REGEX = /\b(\d+(?:\.\d+)?%|\$\d+(?:,\d+)?|\d+\s*(?:ms|hours|days|weeks|months|years|x|k|M|users|clients|requests|engineers|microservices|components))\b/i

export function auditDraftAts(draft: ResumeDraft | null | undefined): AtsAuditResult {
  if (!draft) {
    return {
      score: 0,
      grade: 'Needs Work',
      color: '#ef4444',
      metricCount: 0,
      totalBullets: 0,
      metricPercentage: 0,
      weakVerbCount: 0,
      repeatedVerbs: [],
      bullets: [],
      contactIssues: ['Add contact info'],
      suggestions: ['Start by adding your contact info and experience.'],
    }
  }

  const pInfo = draft.personalInfo || { fullName: '', email: '', phone: '', location: '', linkedin: '' }
  const contactIssues: string[] = []
  let contactScore = 0

  if (pInfo.fullName?.trim()) contactScore += 5
  else contactIssues.push('Full name is missing')

  if (pInfo.email?.trim()) contactScore += 5
  else contactIssues.push('Email address is missing')

  if (pInfo.phone?.trim()) contactScore += 3
  else contactIssues.push('Phone number is missing')

  if (pInfo.location?.trim()) contactScore += 3
  else contactIssues.push('Location is missing')

  if (pInfo.linkedin?.trim()) contactScore += 4
  else contactIssues.push('LinkedIn profile link is recommended')

  // Collect all bullets from experience and projects
  const bulletItems: BulletAuditItem[] = []
  const verbFrequency: Record<string, number> = {}

  const processBullets = (list: string[], context: string) => {
    list.forEach((b, idx) => {
      const trimmed = b.trim()
      if (!trimmed) return
      const words = trimmed.split(/\s+/)
      const rawFirstWord = words[0]?.replace(/[^a-zA-Z]/g, '') || ''
      const lowerFirst = rawFirstWord.toLowerCase()

      if (rawFirstWord.length > 2) {
        verbFrequency[lowerFirst] = (verbFrequency[lowerFirst] || 0) + 1
      }

      const hasMetric = METRIC_REGEX.test(trimmed)
      const isWeak = WEAK_VERBS.has(lowerFirst) || lowerFirst === 'was' || lowerFirst === 'been'

      // Pick 3 random power verbs not equal to current
      const suggestions = POWER_VERBS.filter((pv) => pv.toLowerCase() !== lowerFirst).slice(0, 3)

      bulletItems.push({
        companyOrProject: context,
        bulletIndex: idx,
        text: trimmed,
        hasMetric,
        firstWord: rawFirstWord,
        isWeakVerb: isWeak,
        suggestedPowerVerbs: suggestions,
      })
    })
  }

  ;(draft.experience || []).forEach((e) => {
    processBullets(e.bullets || [], e.company || 'Experience')
  })
  ;(draft.projects || []).forEach((p) => {
    processBullets(p.bullets || [], p.name || 'Project')
  })

  const totalBullets = bulletItems.length
  const metricCount = bulletItems.filter((b) => b.hasMetric).length
  const metricPercentage = totalBullets > 0 ? Math.round((metricCount / totalBullets) * 100) : 0
  const weakVerbCount = bulletItems.filter((b) => b.isWeakVerb).length

  const repeatedVerbs = Object.entries(verbFrequency)
    .filter(([_, count]) => count >= 3)
    .map(([verb, count]) => ({ verb, count }))

  // Metric Score (max 30 pts)
  let metricScore = 0
  if (totalBullets > 0) {
    metricScore = Math.round((metricCount / totalBullets) * 30)
  }

  // Verb Score (max 20 pts)
  let verbScore = 20
  if (weakVerbCount > 0) {
    verbScore = Math.max(5, verbScore - weakVerbCount * 3)
  }
  if (repeatedVerbs.length > 0) {
    verbScore = Math.max(5, verbScore - repeatedVerbs.length * 2)
  }

  // Skills Score (max 15 pts)
  let skillsScore = 0
  const skillCount = (draft.skills || []).length
  if (skillCount >= 8 && skillCount <= 16) {
    skillsScore = 15
  } else if (skillCount >= 4) {
    skillsScore = 10
  } else if (skillCount > 0) {
    skillsScore = 5
  }

  // Sections Completeness (max 15 pts)
  let sectionScore = 0
  if (draft.summary && draft.summary.trim().split(/\s+/).length >= 20) sectionScore += 5
  if ((draft.experience || []).length >= 1) sectionScore += 5
  if ((draft.education || []).length >= 1) sectionScore += 5

  const totalScore = Math.min(100, contactScore + metricScore + verbScore + skillsScore + sectionScore)

  let grade: 'A+' | 'A' | 'B' | 'C' | 'Needs Work' = 'Needs Work'
  let color = '#ef4444' // red
  if (totalScore >= 90) {
    grade = 'A+'
    color = '#84cc16' // lime green
  } else if (totalScore >= 80) {
    grade = 'A'
    color = '#10b981' // emerald
  } else if (totalScore >= 70) {
    grade = 'B'
    color = '#f59e0b' // amber
  } else if (totalScore >= 55) {
    grade = 'C'
    color = '#f97316' // orange
  }

  const suggestions: string[] = []
  if (metricPercentage < 60) {
    suggestions.push(`Quantifiable metrics: only ${metricCount}/${totalBullets} bullets have numbers or %. Add percentages, dollar amounts, or latency gains to double recruiter callbacks.`)
  }
  if (weakVerbCount > 0) {
    suggestions.push(`Detected ${weakVerbCount} ordinary or passive verbs (e.g. 'worked', 'responsible'). Replace them with authoritative action verbs like 'Architected' or 'Spearheaded'.`)
  }
  if (repeatedVerbs.length > 0) {
    suggestions.push(`Repetitive verbs detected: ${repeatedVerbs.map((r) => `'${r.verb}' (${r.count}x)`).join(', ')}. Vary your vocabulary to keep the resume engaging.`)
  }
  if (skillCount < 6) {
    suggestions.push(`Add at least 8-12 core technical skills to pass keyword-based ATS search filters.`)
  }
  if (!draft.summary || draft.summary.trim().split(/\s+/).length < 25) {
    suggestions.push(`Expand your Professional Summary to 40-60 words to hook hiring managers right at the top.`)
  }
  if (contactIssues.length > 0) {
    suggestions.push(`Complete contact details: ${contactIssues.join(', ')}.`)
  }

  return {
    score: totalScore,
    grade,
    color,
    metricCount,
    totalBullets,
    metricPercentage,
    weakVerbCount,
    repeatedVerbs,
    bullets: bulletItems,
    contactIssues,
    suggestions,
  }
}
