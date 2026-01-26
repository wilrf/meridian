import Link from 'next/link'

interface LessonLink {
  slug: string
  title: string
}

interface LessonNavProps {
  prev: LessonLink | null
  next: LessonLink | null
}

export default function LessonNav({ prev, next }: LessonNavProps) {
  return (
    <nav className="mt-12 pt-8 border-t border-[var(--border-default)]">
      <div className="flex justify-between items-center gap-4">
        {prev ? (
          <Link
            href={`/lessons/${prev.slug}`}
            className="group flex flex-col items-start p-4 -m-4 rounded-xl hover:bg-[var(--bg-subtle)] transition-colors"
          >
            <span className="text-sm text-[var(--text-tertiary)] group-hover:text-accent flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </span>
            <span className="text-accent group-hover:text-accent-strong font-medium mt-1">
              {prev.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={`/lessons/${next.slug}`}
            className="group flex flex-col items-end text-right p-4 -m-4 rounded-xl hover:bg-[var(--bg-subtle)] transition-colors"
          >
            <span className="text-sm text-[var(--text-tertiary)] group-hover:text-accent flex items-center gap-1">
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
            <span className="text-accent group-hover:text-accent-strong font-medium mt-1">
              {next.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </nav>
  )
}
