import { useState, useRef, useEffect } from 'react'
import { chatWithAssistant, type AssistantMessage } from '../api/resumes'

interface GeminiAssistantWidgetProps {
  currentRole?: string
  contextSnippet?: string
}

const DEFAULT_SUGGESTIONS = [
  '⚡ Polish a bullet point with metrics',
  '🎯 Top ATS keywords for my role',
  '✍️ Write a punchy 50-word summary',
  '🔍 Review my experience section',
]

export function GeminiAssistantWidget({ currentRole, contextSnippet }: GeminiAssistantWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: 'assistant',
      text: "Hi! I'm your **Gemini AI Co-Pilot**. I can help you draft punchy bullets, optimize keywords for ATS, or refine any part of your resume. What are you working on?",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim()
    if (!textToSend || isLoading) return

    const newHistory: AssistantMessage[] = [...messages, { role: 'user', text: textToSend }]
    setMessages(newHistory)
    setInput('')
    setIsLoading(true)

    try {
      const response = await chatWithAssistant({
        message: textToSend,
        history: newHistory.slice(-8), // Send last 8 turns for context
        currentRole: currentRole || 'Software Engineer',
        contextSnippet,
      })

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: response.reply,
        },
      ])

      if (response.suggestedFollowUps && response.suggestedFollowUps.length > 0) {
        setSuggestions(response.suggestedFollowUps)
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "I couldn't reach the AI service right now. Please verify your connection or try again in a moment.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (text: string, index: number) => {
    // Strip markdown formatting for easy pasting into the resume fields
    const plainText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^#+\s+/gm, '')
      .replace(/^[-*]\s+/gm, '• ')

    void navigator.clipboard.writeText(plainText)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 bg-[#18181b]/90 hover:bg-[#27272a] text-white rounded-full border border-white/15 shadow-2xl backdrop-blur-lg hover:border-[#84cc16]/50 transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#84cc16] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#84cc16]" />
            </span>
            <span className="text-sm font-semibold tracking-wide flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-[#84cc16] group-hover:rotate-12 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Gemini Co-Pilot
            </span>
          </button>
        )}
      </div>

      {/* Floating Assistant Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[95vw] sm:w-[420px] h-[580px] max-h-[85vh] flex flex-col bg-[#09090b]/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          {/* Header */}
          <div className="px-5 py-4 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#84cc16]/30 to-purple-500/20 border border-white/15 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#84cc16]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  Gemini AI Co-Pilot
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#84cc16]/20 text-[#84cc16] border border-[#84cc16]/30">
                    Fast
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-400">Powered by Google Gemini</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Quick suggestions pills */}
          <div className="px-4 py-2.5 bg-black/30 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void handleSend(s)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/5 hover:bg-[#84cc16]/15 text-zinc-300 hover:text-[#84cc16] border border-white/10 hover:border-[#84cc16]/40 transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`relative group max-w-[88%] text-xs leading-relaxed rounded-2xl px-3.5 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-[#84cc16] text-black font-medium rounded-tr-none'
                      : 'bg-white/[0.06] text-zinc-200 border border-white/10 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  {msg.text}

                  {msg.role === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.text, idx)}
                      className="mt-2 text-[10px] flex items-center gap-1 text-zinc-400 hover:text-[#84cc16] transition-colors cursor-pointer"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                      {copiedIndex === idx ? 'Copied to clipboard!' : 'Copy snippet'}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs py-1">
                <div className="w-2 h-2 rounded-full bg-[#84cc16] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#84cc16] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#84cc16] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-zinc-500 ml-1">Gemini is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white/[0.02] border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void handleSend()
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Gemini to improve a bullet, review, or suggest skills..."
                className="flex-1 bg-black/50 border border-white/10 focus:border-[#84cc16] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-[#84cc16] hover:bg-[#65a30d] disabled:opacity-40 text-black rounded-xl transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
