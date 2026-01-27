'use client'

import { PyodideProvider as Provider } from '@/lib/pyodide-context'
import type { ReactNode } from 'react'

interface PyodideProviderProps {
  children: ReactNode
}

/**
 * PyodideProvider wrapper component
 * 
 * Pyodide loads LAZILY by default - it only initializes when:
 * 1. User navigates to a lesson page
 * 2. User clicks "Run" on a code block
 * 
 * This significantly improves initial page load time since Pyodide is ~10MB.
 */
export default function PyodideProvider({ children }: PyodideProviderProps) {
  // eager={false} means Pyodide won't load until actually needed
  return <Provider eager={false}>{children}</Provider>
}
