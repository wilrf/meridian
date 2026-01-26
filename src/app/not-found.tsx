import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-canvas)]">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
          Page Not Found
        </h2>
        <p className="text-[var(--text-secondary)] mb-6">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-[var(--interactive-primary)] text-white rounded-lg hover:bg-[var(--interactive-primary-hover)] transition-colors inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
