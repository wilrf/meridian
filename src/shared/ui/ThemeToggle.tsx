'use client'

import { useTheme, type Theme } from '@/shared/lib/theme-context'
import { cn } from '@/shared/lib/utils'

interface ThemeToggleProps {
  className?: string
}

const THEME_CONFIG: Record<Theme, { icon: JSX.Element; label: string }> = {
  light: {
    icon: <SunIcon />,
    label: 'Light mode (Ivory)',
  },
  dark: {
    icon: <MoonIcon />,
    label: 'Dark mode (Velvet)',
  },
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const config = THEME_CONFIG[theme]
  const nextTheme = theme === 'light' ? 'dark' : 'light'

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'p-2 rounded-lg transition-all duration-200',
        'text-[var(--text-tertiary)]',
        'hover:bg-[var(--bg-subtle)]',
        'hover:text-[var(--text-secondary)]',
        'focus:outline-none focus-visible:ring-2',
        'focus-visible:ring-[var(--border-focus)]',
        className
      )}
      title={`${config.label} (click to switch)`}
      aria-label={`Current theme: ${config.label}. Click to switch to ${THEME_CONFIG[nextTheme].label}`}
    >
      <div className="transition-transform duration-200">
        {config.icon}
      </div>
    </button>
  )
}

function SunIcon() {
  return (
    <svg
      className="w-[18px] h-[18px]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
    >
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      className="w-[18px] h-[18px]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  )
}
