import type { ResumeDraft } from '../types'

const trim = (s: string | null | undefined) => (s ?? '').trim()
const cleanList = (items: string[] | null | undefined) =>
  (items ?? []).map(trim).filter(s => s !== '')

export function cleanDraft(d: ResumeDraft): ResumeDraft {
  const p = d.personalInfo
  return {
    ...d,
    title: trim(d.title) || `${trim(p.fullName) || 'My'} Resume`,
    summary: trim(d.summary),
    personalInfo: {
      fullName: trim(p.fullName),
      email: trim(p.email),
      phone: trim(p.phone),
      location: trim(p.location),
      linkedin: trim(p.linkedin),
      github: trim(p.github),
      portfolio: trim(p.portfolio),
    },
    experience: (d.experience ?? [])
      .filter(e => trim(e.company) && trim(e.role))
      .map(e => ({
        ...e,
        company: trim(e.company),
        role: trim(e.role),
        startDate: trim(e.startDate),
        endDate: trim(e.endDate),
        bullets: cleanList(e.bullets),
      })),
    projects: (d.projects ?? [])
      .filter(x => trim(x.name))
      .map(x => ({
        ...x,
        name: trim(x.name),
        techStack: trim(x.techStack),
        link: trim(x.link),
        bullets: cleanList(x.bullets),
      })),
    education: (d.education ?? [])
      .filter(e => trim(e.institution) && trim(e.degree))
      .map(e => ({
        institution: trim(e.institution),
        degree: trim(e.degree),
        field: trim(e.field),
        startDate: trim(e.startDate),
        endDate: trim(e.endDate),
        score: trim(e.score),
      })),
    skills: cleanList(d.skills),
    certifications: cleanList(d.certifications),
  }
}
