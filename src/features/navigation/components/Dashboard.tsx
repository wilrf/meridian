'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useProgress } from '@/features/progress/hooks/use-progress'
import manifest from '@/content/manifest.json'
import StatsBar from '@/features/navigation/components/StatsBar'
import { MeridianLogo } from '@/shared/ui'

interface Lesson {
  id: string
  title: string
  exercises: string[]
}

interface Phase {
  id: string
  title: string
  lessons: Lesson[]
}

export default function Dashboard() {
  const { progress, loading: progressLoading } = useProgress()
  const phases = manifest.phases as Phase[]

  const totalLessons = useMemo(
    () => phases.reduce((sum, p) => sum + p.lessons.length, 0),
    [phases]
  )
  const completedLessons = useMemo(
    () => progress
      ? Object.values(progress.lessons).filter((l) => l.status === 'completed').length
      : 0,
    [progress]
  )

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      {/* Header */}
      <header className="bg-[var(--bg-surface)] border-b border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                Welcome to Meridian
              </h1>
              <p className="mt-2 text-[var(--text-secondary)] max-w-2xl">
                Navigate your Python journey from fundamentals to machine learning.
              </p>
            </div>
            <div className="hidden lg:block">
              <MeridianBrandLogo />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Section */}
        {!progressLoading && (
          <section className="mb-8">
            <StatsBar
              lessonsCompleted={completedLessons}
              totalLessons={totalLessons}
            />
          </section>
        )}

        {/* Course Grid */}
        <section>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
            Curriculum
          </h2>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {phases.map((phase, index) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                phaseNumber={index + 1}
                progress={progress}
                loading={progressLoading}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function MeridianBrandLogo() {
  return (
    <div className="w-16 h-16 rounded-2xl bg-[#1E3A5F] flex items-center justify-center shadow-soft">
      <MeridianLogo size="md" className="text-white" />
    </div>
  )
}

function PhaseCard({
  phase,
  phaseNumber,
  progress,
  loading,
}: {
  phase: Phase
  phaseNumber: number
  progress: { lessons: Record<string, { status: string; exercises: Record<string, { completed: boolean }> }> } | null
  loading: boolean
}) {
  const totalExercises = phase.lessons.reduce(
    (sum, lesson) => sum + lesson.exercises.length,
    0
  )
  // Safe access with undefined check
  const firstLesson = phase.lessons.length > 0 ? phase.lessons[0] : undefined

  const completedLessons = phase.lessons.filter(
    (lesson) => progress?.lessons[lesson.id]?.status === 'completed'
  ).length

  const percentage =
    phase.lessons.length > 0
      ? Math.round((completedLessons / phase.lessons.length) * 100)
      : 0

  const isStarted = completedLessons > 0 || phase.lessons.some(
    (lesson) => progress?.lessons[lesson.id]?.status === 'in_progress'
  )

  const nextLesson = phase.lessons.find(
    (lesson) => progress?.lessons[lesson.id]?.status !== 'completed'
  ) ?? firstLesson ?? null

  const getStatusColor = () => {
    if (percentage === 100) return 'success'
    if (isStarted) return 'brand'
    return 'surface'
  }

  const statusColor = getStatusColor()

  return (
    <div className="card-hover flex flex-col">
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold
            ${statusColor === 'success' ? 'bg-success-subtle text-success-strong' : ''}
            ${statusColor === 'brand' ? 'bg-accent-subtle text-accent' : ''}
            ${statusColor === 'surface' ? 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]' : ''}
          `}>
            {phaseNumber}
          </div>
          {percentage === 100 && (
            <span className="badge-success">Complete</span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
          {phase.title}
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          {phase.lessons.length} lessons &middot; {totalExercises} exercises
        </p>
      </div>

      {/* Progress Bar */}
      {!loading && isStarted && (
        <div className="px-6 pb-4">
          <div className="flex justify-between text-xs text-[var(--text-tertiary)] mb-2">
            <span>{completedLessons} of {phase.lessons.length}</span>
            <span>{percentage}%</span>
          </div>
          <div className="h-2 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentage === 100 ? 'bg-success' : 'bg-accent'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Lessons List */}
      <div className="px-6 pb-4 flex-1">
        <ul className="space-y-1">
          {phase.lessons.slice(0, 3).map((lesson) => {
            const lessonProgress = progress?.lessons[lesson.id]
            const isCompleted = lessonProgress?.status === 'completed'
            const isInProgress = lessonProgress?.status === 'in_progress'

            return (
              <li key={lesson.id}>
                <Link
                  href={`/lessons/${lesson.id}`}
                  className="flex items-center gap-3 py-2 px-3 -mx-3 rounded-lg text-sm hover:bg-[var(--bg-subtle)] transition-colors group"
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 transition-colors ${
                      isCompleted
                        ? 'bg-success text-white'
                        : isInProgress
                        ? 'bg-accent text-white'
                        : 'bg-[var(--bg-muted)] text-[var(--text-tertiary)] group-hover:bg-[var(--border-strong)]'
                    }`}
                  >
                    {isCompleted ? '✓' : ''}
                  </span>
                  <span className={`truncate ${isCompleted ? 'text-[var(--text-tertiary)]' : 'text-[var(--text-secondary)]'}`}>
                    {lesson.title}
                  </span>
                </Link>
              </li>
            )
          })}
          {phase.lessons.length > 3 && (
            <li className="py-2 px-3 -mx-3 text-sm text-[var(--text-muted)]">
              +{phase.lessons.length - 3} more
            </li>
          )}
        </ul>
      </div>

      {/* Card Footer */}
      <div className="p-6 pt-4 border-t border-[var(--border-subtle)] mt-auto">
        {nextLesson && (
          <Link
            href={`/lessons/${nextLesson.id}`}
            prefetch={false}
            className={`w-full ${
              percentage === 100
                ? 'btn-secondary'
                : isStarted
                ? 'btn-primary'
                : 'btn bg-[var(--text-primary)] text-[var(--text-inverse)] hover:opacity-90'
            }`}
          >
            {percentage === 100 ? 'Review' : isStarted ? 'Continue' : 'Start Learning'}
          </Link>
        )}
      </div>
    </div>
  )
}
