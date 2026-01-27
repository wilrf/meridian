import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Validates that a redirect path is safe (relative, no protocol, no open redirect)
 */
function isValidRedirectPath(path: string): boolean {
  // Must start with /
  if (!path.startsWith('/')) return false
  // Prevent protocol-relative URLs (//evil.com)
  if (path.startsWith('//')) return false
  // Prevent embedded protocols
  if (path.includes('://')) return false
  // Prevent backslash tricks (some browsers normalize \ to /)
  if (path.includes('\\')) return false
  // Prevent encoded characters that could bypass checks
  if (path.includes('%')) {
    try {
      const decoded = decodeURIComponent(path)
      if (decoded.startsWith('//') || decoded.includes('://')) return false
    } catch {
      return false // Invalid encoding
    }
  }
  return true
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const nextParam = searchParams.get('next') ?? '/'

  // Validate redirect path to prevent open redirect attacks
  const next = isValidRedirectPath(nextParam) ? nextParam : '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/error`)
}
