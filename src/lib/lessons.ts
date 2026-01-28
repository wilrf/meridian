import * as fs from 'fs'
import * as path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'python')

export interface LessonFrontmatter {
  title?: string
  phase?: number
  order?: number
  requires?: string[]
  prev?: string | null
  next?: string | null
}

export interface Lesson {
  slug: string
  title: string
  content: string
  frontmatter: LessonFrontmatter
}

// Manifest type definitions
interface ManifestLesson {
  id: string
  title: string
  isProject?: boolean
}

interface ManifestPhase {
  lessons: ManifestLesson[]
}

interface Manifest {
  phases: ManifestPhase[]
}

/**
 * Type guard to validate manifest structure
 */
function isValidManifest(data: unknown): data is Manifest {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>

  if (!Array.isArray(obj.phases)) return false

  for (const phase of obj.phases) {
    if (!phase || typeof phase !== 'object') return false
    const phaseObj = phase as Record<string, unknown>
    if (!Array.isArray(phaseObj.lessons)) return false

    for (const lesson of phaseObj.lessons as unknown[]) {
      if (!lesson || typeof lesson !== 'object') return false
      const lessonObj = lesson as Record<string, unknown>
      if (typeof lessonObj.id !== 'string' || typeof lessonObj.title !== 'string') {
        return false
      }
    }
  }

  return true
}

/**
 * Extract title from markdown content using improved H1 regex
 */
function extractTitleFromContent(content: string): string {
  // Match H1 with optional "Lesson N:" prefix
  // Handles tabs and multiple spaces, non-greedy capture
  const h1Match = content.match(/^#[\t ]+(?:Lesson\s+\d+[a-z]?:\s*)?(.+?)(?:\s*#.*)?$/m)
  return h1Match?.[1]?.trim() ?? 'Untitled'
}

/**
 * Get all lesson slugs for static generation
 */
export function getAllLessonSlugs(): string[][] {
  // Check if content directory exists
  if (!fs.existsSync(CONTENT_DIR)) {
    console.warn(`Content directory not found: ${CONTENT_DIR}`)
    return []
  }

  const slugs: string[][] = []

  function scanDirectory(dir: string, pathParts: string[] = []) {
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch (error) {
      console.error(`Failed to read directory ${dir}:`, error)
      return
    }

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        // Regular markdown file
        const fileName = entry.name.replace('.md', '')
        slugs.push([...pathParts, fileName])
      } else if (entry.isDirectory()) {
        // Check for README.md in project folders
        const readmePath = path.join(dir, entry.name, 'README.md')
        if (fs.existsSync(readmePath)) {
          slugs.push([...pathParts, entry.name])
        }
        // Also scan subdirectory for other .md files
        scanDirectory(path.join(dir, entry.name), [...pathParts, entry.name])
      }
    }
  }

  scanDirectory(CONTENT_DIR)
  return slugs
}

/**
 * Load a lesson by its slug parts
 */
export function getLesson(slugParts: string[]): Lesson | null {
  // Validate input
  if (!Array.isArray(slugParts) || slugParts.length === 0) {
    console.warn('getLesson called with empty or invalid slug parts')
    return null
  }

  // Validate each part is a non-empty string and doesn't contain path traversal
  for (const part of slugParts) {
    if (typeof part !== 'string' || part.length === 0) {
      console.warn(`Invalid slug part: ${part}`)
      return null
    }
    // Prevent path traversal attacks
    if (part === '..' || part === '.' || part.includes('/') || part.includes('\\')) {
      console.warn(`Path traversal attempt detected: ${part}`)
      return null
    }
  }

  // Try different file path patterns
  const possiblePaths = [
    // Direct file: phase/lesson.md
    path.join(CONTENT_DIR, ...slugParts) + '.md',
    // Project folder: phase/project/README.md
    path.join(CONTENT_DIR, ...slugParts, 'README.md'),
  ]

  for (const filePath of possiblePaths) {
    // Extra security: verify resolved path is within CONTENT_DIR
    const resolvedPath = path.resolve(filePath)
    if (!resolvedPath.startsWith(CONTENT_DIR)) {
      console.warn(`Path traversal attempt: ${filePath} resolves outside content directory`)
      continue
    }

    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        const { data, content } = matter(fileContent)

        // Extract title from frontmatter or first H1
        let title = data.title as string | undefined
        if (!title) {
          title = extractTitleFromContent(content)
        }

        return {
          slug: slugParts.join('/'),
          title,
          content,
          frontmatter: {
            title: data.title as string | undefined,
            phase: data.phase as number | undefined,
            order: data.order as number | undefined,
            requires: (data.requires as string[]) ?? [],
            prev: (data.prev as string | null) ?? null,
            next: (data.next as string | null) ?? null,
          },
        }
      } catch (error) {
        // Log specific error with file path for debugging
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error(`Failed to read lesson file ${filePath}: ${errorMessage}`)
        // Continue to try next path pattern instead of returning null immediately
        continue
      }
    }
  }

  return null
}

interface AdjacentLesson {
  slug: string
  title: string
  isProject?: boolean
}

/**
 * Get adjacent lessons for navigation
 */
export function getAdjacentLessons(
  currentSlug: string
): { prev: AdjacentLesson | null; next: AdjacentLesson | null } {
  // Import manifest dynamically to avoid circular dependencies
  let manifest: unknown
  try {
    manifest = require('@/content/manifest.json')
  } catch (error) {
    console.error('Failed to load manifest.json:', error)
    return { prev: null, next: null }
  }

  // Validate manifest structure
  if (!isValidManifest(manifest)) {
    console.error('Invalid manifest.json structure')
    return { prev: null, next: null }
  }

  let prev: AdjacentLesson | null = null
  let next: AdjacentLesson | null = null

  // Flatten all lessons across phases
  const allLessons: ManifestLesson[] = []
  for (const phase of manifest.phases) {
    allLessons.push(...phase.lessons)
  }

  // Find current lesson index
  const currentIndex = allLessons.findIndex((l) => l.id === currentSlug)

  if (currentIndex > 0) {
    const prevLesson = allLessons[currentIndex - 1]
    if (prevLesson) {
      prev = {
        slug: prevLesson.id,
        title: prevLesson.title,
        isProject: prevLesson.isProject,
      }
    }
  }

  if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
    const nextLesson = allLessons[currentIndex + 1]
    if (nextLesson) {
      next = {
        slug: nextLesson.id,
        title: nextLesson.title,
        isProject: nextLesson.isProject,
      }
    }
  }

  return { prev, next }
}
