'use client'

export default function SidebarErrorFallback() {
  return (
    <aside className="w-72 bg-[var(--bg-surface)] border-r border-[var(--border-default)] h-screen flex-shrink-0 flex flex-col items-center justify-center p-6">
      <p className="text-[var(--text-secondary)] text-sm text-center">
        Unable to load sidebar.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-3 px-3 py-1.5 text-sm rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors"
      >
        Reload page
      </button>
    </aside>
  )
}
