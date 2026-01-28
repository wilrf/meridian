'use client'

import { memo, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useProgress } from '@/lib/use-progress'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import AuthButton from '@/components/AuthButton'
import MeridianLogo from '@/components/MeridianLogo'
import manifest from '@/content/manifest.json'

interface Lesson {
  id: string
  title: string
  path: string
  order: number
  exercises: string[]
  isProject?: boolean
}

interface Phase {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

function ProgressSidebarComponent() {
  const pathname = usePathname()
  const { progress, loading } = useProgress()

  const currentSlug = useMemo(() => {
    if (pathname?.startsWith('/lessons/')) {
      return pathname.replace('/lessons/', '')
    }
    if (pathname?.startsWith('/projects/')) {
      return pathname.replace('/projects/', '')
    }
    return null
  }, [pathname])

  return (
    <aside className="w-72 bg-[var(--bg-surface)] border-r border-[var(--border-default)] h-screen overflow-y-auto flex-shrink-0 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-5">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-11 h-11 rounded-xl bg-[var(--interactive-primary)] flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
            <MeridianLogo size="sm" className="text-[var(--text-inverse)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[17px] font-semibold text-[var(--text-primary)] tracking-[-0.01em]">
              Meridian
            </h1>
            <p className="text-[13px] text-[var(--text-tertiary)] font-medium">
              Python Learning
            </p>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-[var(--border-subtle)]" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-6">
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
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-[var(--border-subtle)]">
        <div className="px-5 py-4 flex items-center justify-between">
          <AuthButton />
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}

// Memoize to prevent unnecessary re-renders on navigation
const ProgressSidebar = memo(ProgressSidebarComponent)
ProgressSidebar.displayName = 'ProgressSidebar'
export default ProgressSidebar

const PhaseSection = memo(function PhaseSection({
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
      <div className="flex items-center gap-2.5 mb-2 px-2">
        <span
          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold transition-colors ${
            isPhaseComplete
              ? 'bg-[var(--accent-subtle)] text-[var(--accent-base)]'
              : isPhaseActive
              ? 'bg-[var(--accent-subtle)] text-[var(--accent-base)]'
              : 'bg-[var(--bg-subtle)] text-[var(--text-tertiary)]'
          }`}
        >
          {isPhaseComplete ? '✓' : phaseNumber}
        </span>
        <h2
          className={`text-[11px] font-semibold uppercase tracking-[0.06em] flex-1 transition-colors ${
            isPhaseComplete
              ? 'text-[var(--accent-base)]'
              : isPhaseActive
              ? 'text-[var(--accent-base)]'
              : 'text-[var(--text-muted)]'
          }`}
        >
          {phase.title}
        </h2>
        {!loading && completedCount > 0 && (
          <span
            className={`text-[10px] font-medium tabular-nums ${
              isPhaseComplete ? 'text-[var(--accent-base)]' : 'text-[var(--text-muted)]'
            }`}
          >
            {completedCount}/{phase.lessons.length}
          </span>
        )}
      </div>

      {/* Lessons List */}
      <ul className="space-y-0.5">
        {phase.lessons.map((lesson) => {
          const isActive = lesson.id === currentSlug
          const lessonStatus = progress?.lessons[lesson.id]?.status
          const isCompleted = lessonStatus === 'completed'
          const isInProgress = lessonStatus === 'in_progress'
          // Route projects to /projects/, lessons to /lessons/
          const href = lesson.isProject
            ? `/projects/${lesson.id}`
            : `/lessons/${lesson.id}`

          return (
            <li key={lesson.id}>
              <Link
                href={href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-150
                  ${isActive
                    ? 'bg-[var(--accent-subtle)] text-[var(--accent-base)] font-medium'
                    : isCompleted
                    ? 'text-[var(--text-tertiary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-secondary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                  }
                `}
              >
                {/* Status Indicator */}
                <span
                  className={`
                    w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors
                    ${isActive
                      ? 'bg-[var(--accent-base)]'
                      : isCompleted
                      ? 'bg-[var(--accent-base)] opacity-40'
                      : isInProgress
                      ? 'bg-[var(--accent-glow)]'
                      : 'bg-[var(--border-strong)]'
                    }
                  `}
                />
                <span className="truncate">
                  {lesson.isProject && (
                    <span className="mr-1.5 text-[10px] text-[var(--accent-glow)]">●</span>
                  )}
                  {lesson.title}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
})
