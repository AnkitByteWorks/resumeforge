import type { ReactNode } from 'react'
import { ui } from '../ui'
import ThemeToggle from './ThemeToggle'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className={`relative flex items-center justify-center px-4 ${ui.page}`}>
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className={`w-full max-w-md p-8 shadow-lg ${ui.card} rounded-2xl`}>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400">
          ResumeForge
        </p>
        <h1 className={`mt-2 text-2xl font-bold ${ui.heading}`}>{title}</h1>
        <p className={`mt-1 text-sm ${ui.muted}`}>{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
