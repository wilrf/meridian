import { NextRequest, NextResponse } from 'next/server'
import {
  readProgress,
  updateLessonProgress,
  completeExercise,
  completeLesson,
  type LessonProgress,
} from '@/features/progress/lib/progress'

// GET /api/progress - Read all progress or specific lesson
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')

    const progress = readProgress()

    if (lessonId) {
      const lessonProgress = progress.lessons[lessonId] ?? {
        status: 'not_started',
        exercises: {},
      }
      return NextResponse.json({ lessonId, progress: lessonProgress })
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error reading progress:', error)
    return NextResponse.json(
      { error: 'Failed to read progress' },
      { status: 500 }
    )
  }
}

// Valid actions for type safety
const VALID_ACTIONS = ['completeExercise', 'completeLesson', 'updateLesson'] as const
type ValidAction = typeof VALID_ACTIONS[number]

// Maximum request body size (10KB)
const MAX_BODY_SIZE = 10000

// POST /api/progress - Update progress
export async function POST(request: NextRequest) {
  // Check Content-Type header
  const contentType = request.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    return NextResponse.json(
      { error: 'Content-Type must be application/json' },
      { status: 415 }
    )
  }

  // Check Content-Length to prevent oversized payloads
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    return NextResponse.json(
      { error: 'Request body too large' },
      { status: 413 }
    )
  }

  // Parse JSON with explicit error handling
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    )
  }

  // Validate body is an object
  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { error: 'Request body must be an object' },
      { status: 400 }
    )
  }

  try {
    const bodyObj = body as Record<string, unknown>
    const action = bodyObj.action as string | undefined
    const lessonId = bodyObj.lessonId as string | undefined
    const exerciseId = bodyObj.exerciseId as string | undefined
    const lessonProgressUpdate = bodyObj.progress as Partial<LessonProgress> | undefined

    // Validate action is one of the allowed values
    if (!action || !VALID_ACTIONS.includes(action as ValidAction)) {
      return NextResponse.json(
        { error: 'Invalid or missing action' },
        { status: 400 }
      )
    }

    if (!lessonId) {
      return NextResponse.json(
        { error: 'lessonId is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'completeExercise':
        if (!exerciseId) {
          return NextResponse.json(
            { error: 'exerciseId is required for completeExercise' },
            { status: 400 }
          )
        }
        await completeExercise(lessonId, exerciseId)
        return NextResponse.json({ success: true, action: 'exerciseCompleted' })

      case 'completeLesson':
        await completeLesson(lessonId)
        return NextResponse.json({ success: true, action: 'lessonCompleted' })

      case 'updateLesson':
        if (!lessonProgressUpdate) {
          return NextResponse.json(
            { error: 'progress is required for updateLesson' },
            { status: 400 }
          )
        }
        const updated = await updateLessonProgress(lessonId, lessonProgressUpdate)
        return NextResponse.json({ success: true, progress: updated })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    // Distinguish validation errors from server errors
    if (error instanceof Error && error.message.startsWith('Invalid')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    console.error('Error updating progress:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}
