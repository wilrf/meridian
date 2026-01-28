import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'interactive' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'none', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'relative rounded-xl border',
          'bg-[var(--bg-surface)]',
          'border-[var(--border-default)]',
          'transition-all duration-200',

          // Variants
          variant === 'default' && 'shadow-sm',

          variant === 'hover' && [
            'shadow-sm',
            'hover:shadow-lg',
            'hover:border-[var(--border-strong)]',
            'hover:-translate-y-0.5',
          ],

          variant === 'elevated' && [
            'shadow-lg shadow-black/5',
            'bg-[var(--bg-elevated)]',
          ],

          variant === 'interactive' && [
            'shadow-sm cursor-pointer',
            'hover:-translate-y-0.5',
            'hover:shadow-lg hover:shadow-black/5',
            // Gradient border effect handled via ::before pseudo-element in CSS
            'before:absolute before:inset-0 before:rounded-xl before:p-px',
            'before:bg-gradient-to-br before:from-[var(--accent-glow)] before:via-transparent before:to-[var(--accent-glow)]',
            'before:opacity-0 before:transition-opacity before:duration-200',
            'before:-z-10',
            'hover:before:opacity-100',
          ],

          // Padding
          padding === 'sm' && 'p-4',
          padding === 'md' && 'p-6',
          padding === 'lg' && 'p-8',

          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6 pb-4', className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'font-display text-xl font-semibold text-[var(--text-primary)]',
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        'text-sm text-[var(--text-tertiary)] mt-1',
        className
      )}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 pb-4', className)}
      {...props}
    />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'p-6 pt-4 border-t mt-auto',
        'border-[var(--border-subtle)]',
        className
      )}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
