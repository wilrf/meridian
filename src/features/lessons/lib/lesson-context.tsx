'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'

interface LessonContextValue {
  lessonId: string | null
}

const LessonContext = createContext<LessonContextValue>({ lessonId: null })

export function useLessonContext() {
  return useContext(LessonContext)
}

interface LessonProviderProps {
  lessonId: string
  children: ReactNode
}

export function LessonProvider({ lessonId, children }: LessonProviderProps) {
  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ lessonId }), [lessonId])

  return (
    <LessonContext.Provider value={value}>
      {children}
    </LessonContext.Provider>
  )
}
