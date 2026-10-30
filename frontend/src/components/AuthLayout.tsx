import type { ReactNode } from 'react'
import { HeroBubbles } from './HeroBubbles'

const CURRENT_YEAR = new Date().getFullYear()

export interface AuthLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full flex bg-[#09090b] overflow-hidden selection:bg-[#84cc16] selection:text-black">
      {/* The vibrant bubbles clustered on the right */}
      <HeroBubbles variant="auth" />

      {/* Left Side: Branding & Text (Hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 relative z-10 flex-col justify-between p-12">
        <div className="text-2xl font-bold tracking-tighter text-white">
          Resume<span className="text-[#84cc16]">Forge</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-5xl font-medium tracking-tight text-white leading-tight mb-6">
            UI/UX &amp; AI <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#84cc16] to-[#06b6d4]">
              resume design
            </span>{' '}
            <br />
            for modern professionals.
          </h1>
          <p className="text-zinc-400 text-lg">
            We build stunning, ATS-optimized resumes so you can land your next role faster.
          </p>
        </div>

        <div className="text-zinc-500 text-sm">
          &copy; {CURRENT_YEAR} ResumeForge. All rights reserved.
        </div>
      </div>

      {/* Right Side: The Glass Login/Signup Card */}
      <div className="w-full lg:w-1/2 relative z-10 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_50px_-12px_rgba(132,204,22,0.3)] p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
