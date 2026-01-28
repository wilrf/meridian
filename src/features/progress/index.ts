// Client-safe exports only
// Hooks
export { useProgress } from './hooks/use-progress'

// Types (safe to export - no runtime code)
export type { ProgressData, LessonProgress, ExerciseProgress } from './lib/progress'

// Cloud utilities (client-safe)
export { fetchCloudProgress, saveCloudProgress, mergeProgress } from './lib/cloud-progress'

// NOTE: Server utilities (readProgress, writeProgress, etc.) should be imported directly:
// import { readProgress } from '@/features/progress/lib/progress'
