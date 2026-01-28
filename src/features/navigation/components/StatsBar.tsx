'use client'

interface StatsBarProps {
  lessonsCompleted: number
  totalLessons: number
}

export default function StatsBar({
  lessonsCompleted,
  totalLessons,
}: StatsBarProps) {
  const progressPercentage = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0

  return (
    <div className="card p-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 rounded-xl bg-accent-subtle text-accent flex items-center justify-center flex-shrink-0">
            <BookIcon />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[var(--text-secondary)] font-medium">Progress</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              {lessonsCompleted} of {totalLessons} lessons
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex-1 max-w-md">
          <div className="flex justify-between text-sm text-[var(--text-tertiary)] mb-2">
            <span>{progressPercentage}% complete</span>
          </div>
          <div className="h-2 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function BookIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
    </svg>
  )
}
