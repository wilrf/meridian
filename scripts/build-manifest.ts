import * as fs from 'fs'
import * as path from 'path'
import matter from 'gray-matter'

interface Exercise {
  id: string
}

// Order tuple for stable sorting: [major, minor, suffix]
// e.g., "1.4a" -> [1, 4, "a"], "1.4" -> [1, 4, ""]
type OrderTuple = [number, number, string]

interface Lesson {
  id: string
  title: string
  path: string
  order: number
  orderTuple: OrderTuple // For stable sorting
  exercises: string[]
  requires: string[]
  prev: string | null
  next: string | null
}

/**
 * Parse order from filename like "1.4a_strings" -> [1, 4, "a"]
 */
function parseOrderFromFilename(fileName: string): { order: number; orderTuple: OrderTuple } {
  // Match patterns like "1.4", "1.4a", "1.10", "10.1b"
  const match = fileName.match(/^(\d+)\.(\d+)([a-z])?/)
  if (match) {
    const major = parseInt(match[1] ?? '0', 10)
    const minor = parseInt(match[2] ?? '0', 10)
    const suffix = match[3] ?? ''
    // Create a numeric order that preserves suffix order
    // e.g., 1.4 = 1.4, 1.4a = 1.401, 1.4b = 1.402
    const suffixValue = suffix ? (suffix.charCodeAt(0) - 96) * 0.001 : 0
    const order = major + minor * 0.01 + suffixValue
    return { order, orderTuple: [major, minor, suffix] }
  }
  return { order: 0, orderTuple: [0, 0, ''] }
}

/**
 * Compare two order tuples for stable sorting
 */
function compareOrderTuples(a: OrderTuple, b: OrderTuple): number {
  // Compare major
  if (a[0] !== b[0]) return a[0] - b[0]
  // Compare minor
  if (a[1] !== b[1]) return a[1] - b[1]
  // Compare suffix (empty string sorts before letters)
  return a[2].localeCompare(b[2])
}

interface Phase {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

interface Manifest {
  generatedAt: string
  phases: Phase[]
}

const CONTENT_DIR = path.join(__dirname, '../src/content/python')
const OUTPUT_PATH = path.join(__dirname, '../src/content/manifest.json')

// Map directory names to human-readable titles
const PHASE_TITLES: Record<string, string> = {
  '01_foundations': 'How Computers Think',
  '02_data_structures': 'Organizing Data',
  '03_external_world': 'The External World',
  '04_data_analysis': 'Data Analysis',
  '05_machine_learning': 'Machine Learning',
  '06_capstones': 'Capstone Projects',
}

function extractTitleFromMarkdown(content: string): string {
  // Look for first H1 heading
  const match = content.match(/^#\s+(?:Lesson\s+\d+:\s*)?(.+)$/m)
  if (match?.[1]) {
    return match[1].trim()
  }
  return 'Untitled'
}

function extractExerciseIds(content: string): string[] {
  const exercises: string[] = []

  // Match exercise code blocks with id attribute (both quote styles)
  // Handles: ```python exercise id="1.1" or ```python exercise id='1.1'
  const patterns = [
    /```python\s+exercise\s+[^`]*?id=["']([^"']+)["']/g,
    /~~~python\s+exercise\s+[^~]*?id=["']([^"']+)["']/g,
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(content)) !== null) {
      if (match[1] && !exercises.includes(match[1])) {
        exercises.push(match[1])
      }
    }
  }

  // Also look for "## Exercise X.Y" or "## Exercises X.Y" headers as fallback
  // Handles letter suffixes like "1.4a"
  const headerPattern = /##\s+(?:The\s+)?Exercise(?:s?)?\s+(\d+\.\d+[a-z]?)/gi
  let match
  while ((match = headerPattern.exec(content)) !== null) {
    if (match[1] && !exercises.includes(match[1])) {
      exercises.push(match[1])
    }
  }

  return exercises.sort()
}

function parseLesson(filePath: string, phaseId: string): Lesson | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const { data: frontmatter, content: markdownContent } = matter(content)

    const fileName = path.basename(filePath, '.md')
    const lessonId = `${phaseId}/${fileName}`

    // Extract order from filename (e.g., "1.1_what_is_python" -> 1.1, "1.4a_strings" -> 1.401)
    const { order, orderTuple } = parseOrderFromFilename(fileName)

    // Get title from frontmatter or extract from content
    const title = (frontmatter.title as string) || extractTitleFromMarkdown(markdownContent)

    // Get requires from frontmatter
    const requires = (frontmatter.requires as string[]) || []

    // Extract exercise IDs
    const exercises = extractExerciseIds(markdownContent)

    return {
      id: lessonId,
      title,
      path: `python/${phaseId}/${path.basename(filePath)}`,
      order,
      orderTuple,
      exercises,
      requires,
      prev: (frontmatter.prev as string) || null,
      next: (frontmatter.next as string) || null,
    }
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error)
    return null
  }
}

function parsePhase(phasePath: string, phaseName: string): Phase | null {
  try {
    const orderMatch = phaseName.match(/^(\d+)_/)
    const order = orderMatch?.[1] ? parseInt(orderMatch[1], 10) : 0

    const title = PHASE_TITLES[phaseName] || phaseName.replace(/^\d+_/, '').replace(/_/g, ' ')

    const entries = fs.readdirSync(phasePath, { withFileTypes: true })
    const lessons: Lesson[] = []

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        const lesson = parseLesson(path.join(phasePath, entry.name), phaseName)
        if (lesson) {
          lessons.push(lesson)
        }
      } else if (entry.isDirectory()) {
        // Check for project README.md
        const readmePath = path.join(phasePath, entry.name, 'README.md')
        if (fs.existsSync(readmePath)) {
          const lesson = parseLesson(readmePath, phaseName)
          if (lesson) {
            // Adjust the path for project folders
            lesson.path = `python/${phaseName}/${entry.name}/README.md`
            lesson.id = `${phaseName}/${entry.name}`
            // Extract order from folder name (e.g., "1.7_project_number_analyzer" -> 1.7)
            const { order: folderOrder, orderTuple } = parseOrderFromFilename(entry.name)
            lesson.order = folderOrder
            lesson.orderTuple = orderTuple
            lessons.push(lesson)
          }
        }
      }
    }

    // Sort lessons using stable tuple comparison
    lessons.sort((a, b) => compareOrderTuples(a.orderTuple, b.orderTuple))

    // Auto-populate prev/next if not specified in frontmatter
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i]
      if (lesson) {
        if (!lesson.prev && i > 0 && lessons[i - 1]) {
          lesson.prev = lessons[i - 1]!.id
        }
        if (!lesson.next && i < lessons.length - 1 && lessons[i + 1]) {
          lesson.next = lessons[i + 1]!.id
        }
      }
    }

    return {
      id: phaseName,
      title,
      order,
      lessons,
    }
  } catch (error) {
    console.error(`Error parsing phase ${phaseName}:`, error)
    return null
  }
}

function buildManifest(): Manifest {
  // Check if content directory exists
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`ERROR: Content directory not found: ${CONTENT_DIR}`)
    console.error('Make sure the content/python directory exists and contains lesson files.')
    process.exit(1)
  }

  const entries = fs.readdirSync(CONTENT_DIR, { withFileTypes: true })
  const phases: Phase[] = []

  for (const entry of entries) {
    if (entry.isDirectory() && /^\d+_/.test(entry.name)) {
      const phase = parsePhase(path.join(CONTENT_DIR, entry.name), entry.name)
      if (phase) {
        phases.push(phase)
      }
    }
  }

  // Sort phases by order
  phases.sort((a, b) => a.order - b.order)

  return {
    generatedAt: new Date().toISOString(),
    phases,
  }
}

function main() {
  console.log('Building curriculum manifest...')
  console.log(`Content directory: ${CONTENT_DIR}`)

  const manifest = buildManifest()

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2))

  console.log(`Manifest generated at: ${OUTPUT_PATH}`)
  console.log(`Found ${manifest.phases.length} phases with ${manifest.phases.reduce((sum, p) => sum + p.lessons.length, 0)} lessons`)
}

main()
