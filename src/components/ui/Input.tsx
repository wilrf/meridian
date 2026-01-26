import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          `w-full h-10 px-3 rounded-lg
           bg-[var(--bg-surface)] text-[var(--text-primary)]
           border transition-all duration-150 ease-out
           placeholder:text-[var(--text-muted)]
           focus:outline-none`,
          error
            ? 'border-[var(--error-base)] focus:border-[var(--error-base)] focus:shadow-[0_0_0_3px_var(--error-subtle)]'
            : 'border-[var(--border-default)] focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_var(--accent-subtle)]',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
