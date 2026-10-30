import { useEffect, useState } from 'react'
import { errorMessage } from '../api/client'
import { fetchTemplates, saveResume } from '../api/resumes'
import { cleanDraft } from '../lib/draft'
import type { DraftPersonalInfo, ResumeDraft, TemplateInfo } from '../types'
import { ui } from '../ui'
import Field from './Field'
import ResumePreview from './ResumePreview'

interface ReviewStepProps {
  draft: ResumeDraft
  onChange: (draft: ResumeDraft) => void
  onStartOver: () => void
  onSaved: () => void
}

const CONTACT_FIELDS: [keyof DraftPersonalInfo, string][] = [
  ['fullName', 'Full name'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['location', 'Location'],
  ['linkedin', 'LinkedIn URL'],
  ['github', 'GitHub URL'],
]

export default function ReviewStep({ draft, onChange, onStartOver, onSaved }: ReviewStepProps) {
  const [templates, setTemplates] = useState<TemplateInfo[]>([])
  const [skillsText, setSkillsText] = useState(() => draft.skills.join(', '))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTemplates()
      .then(setTemplates)
      .catch((err: unknown) => setError(errorMessage(err)))
  }, [])

  const canSave =
    draft.personalInfo.fullName.trim() !== '' && draft.personalInfo.email.trim() !== ''

  function setPersonal(key: keyof DraftPersonalInfo, value: string) {
    onChange({ ...draft, personalInfo: { ...draft.personalInfo, [key]: value } })
  }

  async function onSave() {
    setError('')
    setSaving(true)
    try {
      await saveResume(cleanDraft(draft))
      onSaved()
    } catch (err) {
      setError(errorMessage(err, 'Could not save the resume'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
      <div className="space-y-6">
        <p className={ui.notice}>
          Read every line of the preview. Keep only what is true, because you will be asked about
          it in interviews.
        </p>

        <section>
          <h2 className={`mb-2 text-sm font-semibold ${ui.heading}`}>Template</h2>
          <div className="grid grid-cols-2 gap-3">
            {templates.map(t => (
              <button key={t.id} type="button" onClick={() => onChange({ ...draft, templateId: t.id })}
                className={`rounded-lg border p-3 text-left text-sm ${
                  draft.templateId === t.id ? ui.selected : ui.unselected
                }`}>
                <span className={`block font-medium ${ui.heading}`}>{t.name}</span>
                <span className={`block text-xs ${ui.muted}`}>{t.description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className={`text-sm font-semibold ${ui.heading}`}>Contact details</h2>
          {CONTACT_FIELDS.map(([key, label]) => (
            <Field key={key} label={label} value={draft.personalInfo[key]}
              onChange={e => setPersonal(key, e.target.value)} />
          ))}
        </section>

        <section>
          <label htmlFor="summary" className={`mb-1 block text-sm font-semibold ${ui.heading}`}>Summary</label>
          <textarea id="summary" rows={5} className={ui.input} value={draft.summary}
            onChange={e => onChange({ ...draft, summary: e.target.value })} />
        </section>

        <section>
          <label htmlFor="skills" className={`mb-1 block text-sm font-semibold ${ui.heading}`}>
            Skills (separate with commas)
          </label>
          <textarea id="skills" rows={3} className={ui.input} value={skillsText}
            onChange={e => {
              setSkillsText(e.target.value)
              onChange({ ...draft, skills: e.target.value.split(',') })
            }} />
        </section>

        <p className={`text-xs ${ui.muted}`}>
          Editing experience, projects and education arrives in the next step. You can save now
          and refine later.
        </p>

        {error && <p role="alert" className={ui.error}>{error}</p>}
        {!canSave && <p className={`text-xs ${ui.muted}`}>Add your full name and email to save.</p>}

        <div className="flex gap-3">
          <button type="button" onClick={onSave} disabled={!canSave || saving} className={ui.primary}>
            {saving ? 'Saving...' : 'Save resume'}
          </button>
          <button type="button" onClick={onStartOver} disabled={saving} className={ui.secondary}>
            Start over
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-slate-200 p-4 dark:bg-slate-900">
        <ResumePreview draft={draft} />
      </div>
    </div>
  )
}
