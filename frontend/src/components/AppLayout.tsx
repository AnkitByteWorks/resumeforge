import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../auth/auth-context'
import { ThemeToggle } from './ThemeToggle'
import { HeroBubbles } from './HeroBubbles'
import { GeminiAssistantWidget } from './GeminiAssistantWidget'

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-white flex flex-col relative overflow-hidden">
      {/* Toned-down bubbles for the app interior */}
      <HeroBubbles variant="app" />

      {/* Top Navigation */}
      <header className="relative z-20 w-full px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#09090b]/50 backdrop-blur-md">
        <Link to="/dashboard" className="text-xl font-bold tracking-tighter text-white">
          Resume<span className="text-[#84cc16]">Forge</span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400 hidden sm:block">
            {user?.name || 'User'}
          </span>
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-medium text-zinc-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/5 transition-all cursor-pointer"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto p-6">
        {children}
      </main>

      {/* Interactive Gemini AI Co-Pilot Widget */}
      <GeminiAssistantWidget />
    </div>
  )
}

export default AppLayout
