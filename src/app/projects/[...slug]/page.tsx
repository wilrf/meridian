import { notFound } from 'next/navigation'
import { getLesson } from '@/lib/lessons'
import ProjectWorkspace from '@/components/ProjectWorkspace'
import PyodidePreloader from '@/components/PyodidePreloader'
import ErrorBoundary from '@/components/ErrorBoundary'
import manifest from '@/content/manifest.json'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

// Check if a lesson is a project based on manifest
function isProject(lessonId: string): boolean {
  for (const phase of manifest.phases) {
    const lesson = phase.lessons.find((l: { id: string; isProject?: boolean }) => l.id === lessonId)
    if (lesson && (lesson as { isProject?: boolean }).isProject) {
      return true
    }
  }
  // Fallback: check if slug contains "project"
  return lessonId.includes('project')
}

// Extract starter code from project README
function extractStarterCode(content: string): string {
  // Look for the first Python code block in the content
  const codeBlockRegex = /```python\n([\s\S]*?)```/
  const match = content.match(codeBlockRegex)

  if (match?.[1]) {
    return match[1].trim()
  }

  // Default starter code if none found
  return `# Your code here

`
}

// Extract validation code if present
function extractValidationCode(content: string): string | undefined {
  // Look for validation code block marked with validate
  const validateRegex = /```python\s+validate\n([\s\S]*?)```/
  const match = content.match(validateRegex)

  return match?.[1]?.trim()
}

export async function generateStaticParams() {
  // Get projects directly from manifest (more reliable than scanning)
  const projectSlugs: { slug: string[] }[] = []

  for (const phase of manifest.phases) {
    for (const lesson of phase.lessons) {
      const typedLesson = lesson as { id: string; isProject?: boolean }
      if (typedLesson.isProject) {
        // Split id into slug parts: "01_foundations/1.7_project_number_analyzer" -> ["01_foundations", "1.7_project_number_analyzer"]
        projectSlugs.push({ slug: typedLesson.id.split('/') })
      }
    }
  }

  return projectSlugs
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const lesson = getLesson(slug)

  if (!lesson) {
    return { title: 'Project Not Found' }
  }

  return {
    title: `${lesson.title} | Meridian`,
    description: `Project: ${lesson.title}`,
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params
  const project = getLesson(slug)

  if (!project) {
    notFound()
  }

  const projectId = slug.join('/')

  // Verify this is actually a project
  if (!isProject(projectId)) {
    // Redirect to regular lesson page
    notFound()
  }

  const starterCode = extractStarterCode(project.content)
  const validateCode = extractValidationCode(project.content)

  return (
    <>
      {/* Preload Pyodide when project page mounts */}
      <PyodidePreloader />

      <ErrorBoundary>
        <ProjectWorkspace
          projectId={projectId}
          content={project.content}
          starterCode={starterCode}
          validate={validateCode}
        />
      </ErrorBoundary>
    </>
  )
}
