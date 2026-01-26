'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useProgress } from '@/lib/use-progress'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import AuthButton from '@/components/AuthButton'
import manifest from '@/content/manifest.json'

interface Lesson {
  id: string
  title: string
  path: string
  order: number
  exercises: string[]
}

interface Phase {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

export default function ProgressSidebar() {
  const pathname = usePathname()
  const { progress, loading } = useProgress()

  const currentSlug = pathname?.startsWith('/lessons/')
    ? pathname.replace('/lessons/', '')
    : null

  return (
    <aside className="w-72 bg-[var(--bg-surface)] border-r border-[var(--border-default)] h-screen overflow-y-auto flex-shrink-0 flex flex-col">
      <div className="p-5 flex-1">
        {/* Logo/Brand with Theme Toggle */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-800 to-accent flex items-center justify-center shadow-soft group-hover:shadow-card-hover transition-shadow">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
              <path d="M12 0C5.373 0 5.5 2.727 5.5 2.727v2.727h6.5v.91H4.09S0 5.91 0 12s3.545 6.09 3.545 6.09h2.182v-2.91s-.118-3.545 3.5-3.545h6.045s3.364.055 3.364-3.273V3.09S19.09 0 12 0zm-2.727 1.818c.5 0 .91.41.91.91s-.41.909-.91.909-.909-.41-.909-.91.41-.909.91-.909z"/>
              <path d="M12 24c6.627 0 6.5-2.727 6.5-2.727v-2.727h-6.5v-.91h7.91S24 18.09 24 12s-3.545-6.09-3.545-6.09h-2.182v2.91s.118 3.545-3.5 3.545H8.727s-3.364-.055-3.364 3.273v5.273S4.91 24 12 24zm2.727-1.818c-.5 0-.91-.41-.91-.91s.41-.909.91-.909.909.41.909.91-.41.909-.91.909z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Meridian</h1>
            <p className="text-xs text-[var(--text-tertiary)]">Python Learning</p>
          </div>
        </Link>
          <ThemeToggle />
        </div>

        {/* Navigation */}
        <nav className="space-y-6">
          {(manifest.phases as Phase[]).map((phase, index) => (
            <PhaseSection
              key={phase.id}
              phase={phase}
              phaseNumber={index + 1}
              currentSlug={currentSlug}
              progress={progress}
              loading={loading}
            />
          ))}
        </nav>
      </div>

      {/* Auth Section - pinned to bottom */}
      <div className="p-5 border-t border-[var(--border-subtle)]">
        <AuthButton />
      </div>
    </aside>
  )
}

function PhaseSection({
  phase,
  phaseNumber,
  currentSlug,
  progress,
  loading,
}: {
  phase: Phase
  phaseNumber: number
  currentSlug: string | null
  progress: { lessons: Record<string, { status: string }> } | null
  loading: boolean
}) {
  const isPhaseActive = phase.lessons.some(
    (lesson) => lesson.id === currentSlug
  )

  const completedCount = phase.lessons.filter(
    (lesson) => progress?.lessons[lesson.id]?.status === 'completed'
  ).length

  const isPhaseComplete = completedCount === phase.lessons.length && phase.lessons.length > 0

  return (
    <div>
      {/* Phase Header */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
            isPhaseComplete
              ? 'bg-success-subtle text-success-strong'
              : isPhaseActive
              ? 'bg-accent-subtle text-accent'
              : 'bg-[var(--bg-subtle)] text-[var(--text-tertiary)]'
          }`}
        >
          {isPhaseComplete ? '✓' : phaseNumber}
        </span>
        <h2
          className={`text-xs font-semibold uppercase tracking-wider flex-1 ${
            isPhaseComplete
              ? 'text-success'
              : isPhaseActive
              ? 'text-accent'
              : 'text-[var(--text-muted)]'
          }`}
        >
          {phase.title}
        </h2>
        {!loading && completedCount > 0 && (
          <span
            className={`text-[10px] font-medium ${
              isPhaseComplete ? 'text-success' : 'text-[var(--text-muted)]'
            }`}
          >
            {completedCount}/{phase.lessons.length}
          </span>
        )}
      </div>

      {/* Lessons List */}
      <ul className="space-y-0.5 ml-1 border-l-2 border-[var(--border-subtle)] pl-4">
        {phase.lessons.map((lesson) => {
          const isActive = lesson.id === currentSlug
          const lessonStatus = progress?.lessons[lesson.id]?.status
          const isCompleted = lessonStatus === 'completed'
          const isInProgress = lessonStatus === 'in_progress'
          const href = `/lessons/${lesson.id}`

          return (
            <li key={lesson.id}>
              <Link
                href={href}
                className={`
                  flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all
                  ${isActive
                    ? 'bg-accent-subtle text-accent font-medium'
                    : isCompleted
                    ? 'text-[var(--text-tertiary)] hover:bg-[var(--bg-subtle)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                  }
                `}
              >
                {/* Status Dot */}
                <span
                  className={`
                    w-2 h-2 rounded-full flex-shrink-0 transition-colors
                    ${isActive
                      ? 'bg-accent'
                      : isCompleted
                      ? 'bg-success'
                      : isInProgress
                      ? 'bg-accent-light'
                      : 'bg-[var(--border-strong)]'
                    }
                  `}
                />
                <span className="truncate">{lesson.title}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
