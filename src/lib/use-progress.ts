'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { ProgressData, LessonProgress } from './progress'
import { useAuth } from './auth-context'
import { fetchCloudProgress, saveCloudProgress, mergeProgress } from './cloud-progress'

interface UseProgressResult {
  progress: ProgressData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  completeExercise: (lessonId: string, exerciseId: string) => Promise<void>
  completeLesson: (lessonId: string) => Promise<void>
  getLessonProgress: (lessonId: string) => LessonProgress
  isExerciseCompleted: (lessonId: string, exerciseId: string) => boolean
  isLessonCompleted: (lessonId: string) => boolean
}

const DEFAULT_LESSON_PROGRESS: LessonProgress = {
  status: 'not_started',
  exercises: {},
}

const DEFAULT_PROGRESS: ProgressData = {
  lastUpdated: null,
  lessons: {},
  projects: {},
}

export function useProgress(): UseProgressResult {
  const { user, loading: authLoading } = useAuth()
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasMergedRef = useRef(false)
  // Track in-flight operations to prevent duplicate submissions
  const pendingOpsRef = useRef<Set<string>>(new Set())

  // Fetch progress from local API (file-based)
  const fetchLocalProgress = useCallback(async (): Promise<ProgressData> => {
    const response = await fetch('/api/progress')
    if (!response.ok) {
      throw new Error(`Failed to fetch local progress: ${response.status} ${response.statusText}`)
    }

    // Parse JSON with explicit error handling
    let data: unknown
    try {
      data = await response.json()
    } catch {
      throw new Error('Invalid JSON response from progress API')
    }

    // Basic validation
    if (!data || typeof data !== 'object') {
      throw new Error('Progress API returned invalid data')
    }

    return data as ProgressData
  }, [])

  // Main fetch logic - routes to cloud or local based on auth state
  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (user) {
        // Authenticated: fetch from cloud
        const cloudProgress = await fetchCloudProgress()

        // On first sign-in, merge local progress with cloud
        if (!hasMergedRef.current) {
          hasMergedRef.current = true
          const localProgress = await fetchLocalProgress()

          // If local has any data, merge it
          const hasLocalData = Object.keys(localProgress.lessons).length > 0 ||
                              Object.keys(localProgress.projects).length > 0

          if (hasLocalData && cloudProgress) {
            const merged = mergeProgress(localProgress, cloudProgress)
            await saveCloudProgress(merged)
            setProgress(merged)
            return
          }
        }

        setProgress(cloudProgress ?? DEFAULT_PROGRESS)
      } else {
        // Not authenticated: use local file storage
        const localProgress = await fetchLocalProgress()
        setProgress(localProgress)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setProgress(DEFAULT_PROGRESS)
    } finally {
      setLoading(false)
    }
  }, [user, fetchLocalProgress])

  // Reset merge flag when user changes
  useEffect(() => {
    if (!user) {
      hasMergedRef.current = false
    }
  }, [user])

  // Fetch progress when auth state is ready
  useEffect(() => {
    if (!authLoading) {
      fetchProgress()
    }
  }, [authLoading, fetchProgress])

  const completeExercise = useCallback(
    async (lessonId: string, exerciseId: string) => {
      if (!progress) return

      // Prevent duplicate submissions
      const opKey = `exercise:${lessonId}:${exerciseId}`
      if (pendingOpsRef.current.has(opKey)) {
        return // Already in progress
      }
      pendingOpsRef.current.add(opKey)

      try {
        // Optimistic update
        const updatedProgress = { ...progress }
        const lesson = updatedProgress.lessons[lessonId] ?? {
          status: 'not_started' as const,
          exercises: {},
        }

        lesson.exercises[exerciseId] = {
          completed: true,
          completedAt: new Date().toISOString(),
        }

        if (lesson.status === 'not_started') {
          lesson.status = 'in_progress'
          lesson.startedAt = new Date().toISOString()
        }

        updatedProgress.lessons[lessonId] = lesson
        updatedProgress.lastUpdated = new Date().toISOString()
        setProgress(updatedProgress)

        if (user) {
          // Save to cloud
          const success = await saveCloudProgress(updatedProgress)
          if (!success) {
            throw new Error('Failed to save to cloud')
          }
        } else {
          // Save to local file
          const response = await fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'completeExercise',
              lessonId,
              exerciseId,
            }),
          })
          if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error')
            throw new Error(`Failed to complete exercise: ${errorText}`)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        // Refetch to get correct state
        await fetchProgress()
      } finally {
        pendingOpsRef.current.delete(opKey)
      }
    },
    [progress, user, fetchProgress]
  )

  const completeLesson = useCallback(
    async (lessonId: string) => {
      if (!progress) return

      // Prevent duplicate submissions
      const opKey = `lesson:${lessonId}`
      if (pendingOpsRef.current.has(opKey)) {
        return // Already in progress
      }
      pendingOpsRef.current.add(opKey)

      try {
        // Optimistic update
        const updatedProgress = { ...progress }
        const lesson = updatedProgress.lessons[lessonId] ?? {
          status: 'not_started' as const,
          exercises: {},
        }

        lesson.status = 'completed'
        lesson.completedAt = new Date().toISOString()

        updatedProgress.lessons[lessonId] = lesson
        updatedProgress.lastUpdated = new Date().toISOString()
        setProgress(updatedProgress)

        if (user) {
          // Save to cloud
          const success = await saveCloudProgress(updatedProgress)
          if (!success) {
            throw new Error('Failed to save to cloud')
          }
        } else {
          // Save to local file
          const response = await fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'completeLesson',
              lessonId,
            }),
          })
          if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error')
            throw new Error(`Failed to complete lesson: ${errorText}`)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        await fetchProgress()
      } finally {
        pendingOpsRef.current.delete(opKey)
      }
    },
    [progress, user, fetchProgress]
  )

  const getLessonProgress = useCallback(
    (lessonId: string): LessonProgress => {
      return progress?.lessons[lessonId] ?? DEFAULT_LESSON_PROGRESS
    },
    [progress]
  )

  const isExerciseCompleted = useCallback(
    (lessonId: string, exerciseId: string): boolean => {
      const lesson = progress?.lessons[lessonId]
      return lesson?.exercises[exerciseId]?.completed ?? false
    },
    [progress]
  )

  const isLessonCompleted = useCallback(
    (lessonId: string): boolean => {
      return progress?.lessons[lessonId]?.status === 'completed'
    },
    [progress]
  )

  return {
    progress,
    loading: loading || authLoading,
    error,
    refetch: fetchProgress,
    completeExercise,
    completeLesson,
    getLessonProgress,
    isExerciseCompleted,
    isLessonCompleted,
  }
}
