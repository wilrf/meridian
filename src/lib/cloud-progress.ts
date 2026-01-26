import { createClient } from '@/lib/supabase/client'
import type { ProgressData } from './progress'

const DEFAULT_PROGRESS: ProgressData = {
  lastUpdated: null,
  lessons: {},
  projects: {},
}

/**
 * Fetch progress from Supabase for the current user
 */
export async function fetchCloudProgress(): Promise<ProgressData | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_progress')
    .select('progress_data')
    .eq('user_id', user.id)
    .single()

  if (error) {
    // PGRST116 = no rows returned, which is fine for new users
    if (error.code === 'PGRST116') {
      return DEFAULT_PROGRESS
    }
    console.error('Error fetching cloud progress:', error)
    return null
  }

  return data.progress_data as ProgressData
}

/**
 * Save progress to Supabase for the current user
 */
export async function saveCloudProgress(progress: ProgressData): Promise<boolean> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const progressWithTimestamp = {
    ...progress,
    lastUpdated: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: user.id,
      progress_data: progressWithTimestamp,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    })

  if (error) {
    console.error('Error saving cloud progress:', error)
    return false
  }

  return true
}

/**
 * Merge local and cloud progress, preferring newer completions
 */
export function mergeProgress(
  local: ProgressData,
  cloud: ProgressData
): ProgressData {
  const merged: ProgressData = {
    lastUpdated: new Date().toISOString(),
    lessons: { ...cloud.lessons },
    projects: { ...cloud.projects },
  }

  // Merge lessons
  for (const [lessonId, localLesson] of Object.entries(local.lessons)) {
    const cloudLesson = merged.lessons[lessonId]

    if (!cloudLesson) {
      // Lesson only exists locally, add it
      merged.lessons[lessonId] = localLesson
    } else {
      // Merge exercises, keeping completed ones from both
      const mergedExercises = { ...cloudLesson.exercises }
      for (const [exerciseId, localExercise] of Object.entries(localLesson.exercises)) {
        const cloudExercise = mergedExercises[exerciseId]
        if (!cloudExercise || !cloudExercise.completed) {
          // Local has completion that cloud doesn't
          if (localExercise.completed) {
            mergedExercises[exerciseId] = localExercise
          }
        }
      }

      // Determine lesson status - completed > in_progress > not_started
      let status = cloudLesson.status
      if (localLesson.status === 'completed' || cloudLesson.status === 'completed') {
        status = 'completed'
      } else if (localLesson.status === 'in_progress' || cloudLesson.status === 'in_progress') {
        status = 'in_progress'
      }

      merged.lessons[lessonId] = {
        ...cloudLesson,
        exercises: mergedExercises,
        status,
        // Keep earliest startedAt
        startedAt: getEarlierDate(localLesson.startedAt, cloudLesson.startedAt),
        // Keep latest completedAt
        completedAt: getLaterDate(localLesson.completedAt, cloudLesson.completedAt),
      }
    }
  }

  // Merge projects (similar logic)
  for (const [projectId, localProject] of Object.entries(local.projects)) {
    const cloudProject = merged.projects[projectId]

    if (!cloudProject) {
      merged.projects[projectId] = localProject
    } else {
      // Prefer completed status
      let status = cloudProject.status
      if (localProject.status === 'completed' || cloudProject.status === 'completed') {
        status = 'completed'
      } else if (localProject.status === 'in_progress' || cloudProject.status === 'in_progress') {
        status = 'in_progress'
      }

      merged.projects[projectId] = {
        ...cloudProject,
        status,
        // Keep the most recent code (by lastUpdated comparison)
        code: localProject.code || cloudProject.code,
        startedAt: getEarlierDate(localProject.startedAt, cloudProject.startedAt),
        completedAt: getLaterDate(localProject.completedAt, cloudProject.completedAt),
      }
    }
  }

  return merged
}

function getEarlierDate(a?: string, b?: string): string | undefined {
  if (!a) return b
  if (!b) return a
  return new Date(a) < new Date(b) ? a : b
}

function getLaterDate(a?: string, b?: string): string | undefined {
  if (!a) return b
  if (!b) return a
  return new Date(a) > new Date(b) ? a : b
}
