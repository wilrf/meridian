'use client'

interface MeridianLogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'mark' | 'wordmark'
  className?: string
}

const sizes = {
  sm: { mark: 24, wordmark: { width: 120, height: 24 } },
  md: { mark: 40, wordmark: { width: 200, height: 40 } },
  lg: { mark: 64, wordmark: { width: 280, height: 56 } },
}

export default function MeridianLogo({
  size = 'md',
  variant = 'mark',
  className = '',
}: MeridianLogoProps) {
  if (variant === 'wordmark') {
    const { width, height } = sizes[size].wordmark
    return (
      <svg
        viewBox="0 0 200 40"
        width={width}
        height={height}
        className={className}
        aria-label="Meridian"
      >
        {/* Logomark */}
        <circle
          cx="20"
          cy="20"
          r="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d="M20 5 Q30 20 20 35"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Wordmark */}
        <text
          x="48"
          y="26"
          fontFamily="var(--font-inter), system-ui, sans-serif"
          fontSize="20"
          fontWeight="500"
          letterSpacing="0.02em"
          fill="currentColor"
        >
          Meridian
        </text>
      </svg>
    )
  }

  // Logomark only
  const markSize = sizes[size].mark
  return (
    <svg
      viewBox="0 0 40 40"
      width={markSize}
      height={markSize}
      className={className}
      aria-label="Meridian"
    >
      {/* Globe circle */}
      <circle
        cx="20"
        cy="20"
        r="15"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      {/* Meridian arc */}
      <path
        d="M20 5 Q30 20 20 35"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
