import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
          Authentication Error
        </h1>
        <p className="text-[var(--text-secondary)] mb-6">
          There was an error signing you in. This could happen if:
        </p>
        <ul className="text-left text-[var(--text-secondary)] mb-6 space-y-2 list-disc list-inside">
          <li>The sign-in link expired</li>
          <li>You denied access to your GitHub account</li>
          <li>There was a temporary connection issue</li>
        </ul>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}
