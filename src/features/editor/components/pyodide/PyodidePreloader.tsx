'use client'

import { useEffect } from 'react'
import { usePyodide } from '@/features/editor/lib/pyodide-context'

/**
 * PyodidePreloader
 * 
 * A zero-UI component that triggers Pyodide loading when mounted.
 * Place this on pages where users will likely need to run Python code.
 * 
 * Pyodide loading happens in the background and doesn't block rendering.
 */
export default function PyodidePreloader() {
  const { initialize, state } = usePyodide()

  useEffect(() => {
    // Only initialize if idle - prevents double loading
    if (state.status === 'idle') {
      // Small delay to let the page render first
      const timeoutId = setTimeout(() => {
        initialize()
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [initialize, state.status])

  // This component renders nothing
  return null
}
