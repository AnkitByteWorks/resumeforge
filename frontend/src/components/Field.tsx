import type { InputHTMLAttributes } from 'react'
import { ui } from '../ui'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export default function Field({ label, id, ...rest }: FieldProps) {
  const inputId = id ?? `field-${label.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <div>
      <label htmlFor={inputId} className={ui.label}>{label}</label>
      <input id={inputId} {...rest} className={ui.input} />
    </div>
  )
}
