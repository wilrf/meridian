import * as fs from 'fs'
import * as path from 'path'
import lockfile from 'proper-lockfile'

const PROGRESS_FILE = path.join(process.cwd(), 'data', 'progress.json')

// Dangerous keys that could cause prototype pollution
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

export interface ExerciseProgress {
  completed: boolean
  completedAt?: string
}

export interface LessonProgress {
  status: 'not_started' | 'in_progress' | 'completed'
  startedAt?: string
  completedAt?: string
  exercises: Record<string, ExerciseProgress>
}

export interface ProjectProgress {
  status: 'not_started' | 'in_progress' | 'completed'
  code: string
  startedAt?: string
  completedAt?: string
}

export interface ProgressData {
  lastUpdated: string | null
  lessons: Record<string, LessonProgress>
  projects: Record<string, ProjectProgress>
}

const DEFAULT_PROGRESS: ProgressData = {
  lastUpdated: null,
  lessons: {},
  projects: {},
}

/**
 * Validate lesson ID format to prevent prototype pollution and path traversal
 */
function isValidLessonId(lessonId: string): boolean {
  if (!lessonId || typeof lessonId !== 'string') return false
  if (lessonId.length > 200) return false
  if (FORBIDDEN_KEYS.has(lessonId)) return false
  // Allow alphanumeric, hyphens, underscores, and forward slashes
  return /^[a-zA-Z0-9_/-]+$/.test(lessonId)
}

/**
 * Type guard to validate ProgressData structure
 */
function isValidProgressData(data: unknown): data is ProgressData {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>

  // lastUpdated must be string or null
  if (obj.lastUpdated !== null && typeof obj.lastUpdated !== 'string') return false

  // lessons must be object
  if (typeof obj.lessons !== 'object' || obj.lessons === null) return false

  // projects must be object
  if (typeof obj.projects !== 'object' || obj.projects === null) return false

  return true
}

/**
 * Ensure progress file exists for locking
 */
function ensureProgressFile(): void {
  const dataDir = path.dirname(PROGRESS_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  if (!fs.existsSync(PROGRESS_FILE)) {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(DEFAULT_PROGRESS, null, 2))
  }
}

/**
 * Read progress data from file (internal, no locking)
 */
function readProgressInternal(): ProgressData {
  try {
    if (!fs.existsSync(PROGRESS_FILE)) {
      return { ...DEFAULT_PROGRESS }
    }
    const content = fs.readFileSync(PROGRESS_FILE, 'utf-8')
    const data = JSON.parse(content) as unknown

    // Validate structure
    if (!isValidProgressData(data)) {
      console.warn('Progress file has invalid structure, using defaults')
      return { ...DEFAULT_PROGRESS }
    }

    // Return sanitized copy
    return {
      lastUpdated: data.lastUpdated,
      lessons: data.lessons ?? {},
      projects: data.projects ?? {},
    }
  } catch (error) {
    console.error('Error reading progress file:', error)
    return { ...DEFAULT_PROGRESS }
  }
}

/**
 * Read progress data from file
 */
export function readProgress(): ProgressData {
  return readProgressInternal()
}

/**
 * Write progress data to file with file locking to prevent race conditions
 */
export async function writeProgress(data: ProgressData): Promise<void> {
  ensureProgressFile()

  let release: (() => Promise<void>) | null = null
  try {
    release = await lockfile.lock(PROGRESS_FILE, {
      retries: { retries: 5, minTimeout: 50, maxTimeout: 200 },
    })

    // Re-read after acquiring lock to get latest state and merge
    const current = readProgressInternal()
    const merged: ProgressData = {
      lastUpdated: new Date().toISOString(),
      lessons: { ...current.lessons, ...data.lessons },
      projects: { ...current.projects, ...data.projects },
    }

    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(merged, null, 2))
  } catch (error) {
    console.error('Error writing progress file:', error)
    throw error
  } finally {
    if (release) {
      await release()
    }
  }
}

/**
 * Write progress data synchronously (legacy, for backwards compatibility)
 * @deprecated Use writeProgress (async) instead for race condition safety
 */
export function writeProgressSync(data: ProgressData): void {
  ensureProgressFile()
  data.lastUpdated = new Date().toISOString()
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2))
}

/**
 * Get or create lesson progress
 */
export function getLessonProgress(lessonId: string): LessonProgress {
  if (!isValidLessonId(lessonId)) {
    console.warn(`Invalid lesson ID: ${lessonId}`)
    return { status: 'not_started', exercises: {} }
  }

  const progress = readProgress()
  return (
    progress.lessons[lessonId] ?? {
      status: 'not_started',
      exercises: {},
    }
  )
}

/**
 * Update lesson progress
 */
export async function updateLessonProgress(
  lessonId: string,
  update: Partial<LessonProgress>
): Promise<LessonProgress> {
  if (!isValidLessonId(lessonId)) {
    throw new Error(`Invalid lesson ID: ${lessonId}`)
  }

  const progress = readProgress()
  const existing = progress.lessons[lessonId] ?? {
    status: 'not_started',
    exercises: {},
  }

  const updated: LessonProgress = {
    ...existing,
    ...update,
    exercises: {
      ...existing.exercises,
      ...(update.exercises ?? {}),
    },
  }

  progress.lessons[lessonId] = updated
  await writeProgress(progress)

  return updated
}

/**
 * Mark an exercise as completed
 */
export async function completeExercise(
  lessonId: string,
  exerciseId: string
): Promise<void> {
  if (!isValidLessonId(lessonId)) {
    throw new Error(`Invalid lesson ID: ${lessonId}`)
  }
  if (!exerciseId || typeof exerciseId !== 'string' || exerciseId.length > 100) {
    throw new Error(`Invalid exercise ID: ${exerciseId}`)
  }

  const progress = readProgress()
  const lesson = progress.lessons[lessonId] ?? {
    status: 'not_started',
    exercises: {},
  }

  // Only update completedAt if not already completed (preserve first completion)
  const existingExercise = lesson.exercises[exerciseId]
  lesson.exercises[exerciseId] = {
    completed: true,
    completedAt: existingExercise?.completedAt ?? new Date().toISOString(),
  }

  // Update lesson status
  if (lesson.status === 'not_started') {
    lesson.status = 'in_progress'
    lesson.startedAt = new Date().toISOString()
  }

  progress.lessons[lessonId] = lesson
  await writeProgress(progress)
}

/**
 * Mark a lesson as completed
 */
export async function completeLesson(lessonId: string): Promise<void> {
  if (!isValidLessonId(lessonId)) {
    throw new Error(`Invalid lesson ID: ${lessonId}`)
  }

  const progress = readProgress()
  const lesson = progress.lessons[lessonId] ?? {
    status: 'not_started',
    exercises: {},
  }

  lesson.status = 'completed'
  // Preserve first completion timestamp
  lesson.completedAt = lesson.completedAt ?? new Date().toISOString()

  progress.lessons[lessonId] = lesson
  await writeProgress(progress)
}

/**
 * Calculate completion percentage for a phase
 * @param lessonIds - Array of lesson IDs in this phase
 */
export function getPhaseCompletion(
  lessonIds: string[]
): { completed: number; total: number; percentage: number } {
  const progress = readProgress()

  let completed = 0
  for (const lessonId of lessonIds) {
    const lesson = progress.lessons[lessonId]
    if (lesson?.status === 'completed') {
      completed++
    }
  }

  return {
    completed,
    total: lessonIds.length,
    percentage: lessonIds.length > 0 ? Math.round((completed / lessonIds.length) * 100) : 0,
  }
}
