import { notFound } from 'next/navigation'
import { getLesson, getAllLessonSlugs, getAdjacentLessons, LessonRenderer, LessonNav } from '@/features/lessons'
import { PyodidePreloader } from '@/features/editor'
import { ErrorBoundary } from '@/shared/ui'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export async function generateStaticParams() {
  const slugs = getAllLessonSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const lesson = getLesson(slug)

  if (!lesson) {
    return { title: 'Lesson Not Found' }
  }

  return {
    title: `${lesson.title} | Meridian`,
    description: lesson.title,
  }
}

export default async function LessonPage({ params }: PageProps) {
  const { slug } = await params
  const lesson = getLesson(slug)

  if (!lesson) {
    notFound()
  }

  const { prev, next } = getAdjacentLessons(lesson.slug)

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      {/* Preload Pyodide when lesson page mounts */}
      <PyodidePreloader />

      <ErrorBoundary>
        <LessonRenderer
          content={lesson.content}
          lessonId={lesson.slug}
          requiredPackages={lesson.frontmatter.requires}
        />
      </ErrorBoundary>
      <LessonNav prev={prev} next={next} />
    </div>
  )
}
