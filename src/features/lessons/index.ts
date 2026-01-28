// Components
export { default as LessonRenderer } from './components/LessonRenderer'
export { default as LessonNav } from './components/LessonNav'

// Context
export { LessonProvider, useLessonContext } from './lib/lesson-context'

// Server utilities
export { getLesson, getAllLessonSlugs, getAdjacentLessons } from './lib/lessons'
export type { Lesson, LessonFrontmatter } from './lib/lessons'

// Markdown plugins (for advanced usage)
export { default as remarkCodeMeta } from './lib/remark-code-meta'
export { default as rehypeCodeBlocks } from './lib/rehype-code-blocks'
export type { CodeBlockMeta } from './lib/rehype-code-blocks'
