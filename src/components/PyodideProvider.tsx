'use client'

import { PyodideProvider as Provider } from '@/lib/pyodide-context'
import type { ReactNode } from 'react'

interface PyodideProviderProps {
  children: ReactNode
}

export default function PyodideProvider({ children }: PyodideProviderProps) {
  return <Provider>{children}</Provider>
}
