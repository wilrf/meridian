'use client'

import { createContext, useContext, type ReactNode } from 'react'

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
  return (
    <LessonContext.Provider value={{ lessonId }}>
      {children}
    </LessonContext.Provider>
  )
}
