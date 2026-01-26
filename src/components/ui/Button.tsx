import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  `inline-flex items-center justify-center gap-2 rounded-lg font-medium
   transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
   disabled:pointer-events-none disabled:opacity-50`,
  {
    variants: {
      variant: {
        primary: `
          bg-[var(--interactive-primary)] text-[var(--text-inverse)]
          hover:bg-[var(--interactive-primary-hover)]
          hover:-translate-y-0.5
          hover:shadow-lg hover:shadow-[var(--accent-glow)]/20
          active:translate-y-0 active:scale-[0.98]
          focus-visible:ring-[var(--border-focus)]
        `,
        secondary: `
          bg-[var(--bg-subtle)] text-[var(--text-secondary)]
          border border-[var(--border-default)]
          hover:bg-[var(--interactive-secondary-hover)]
          hover:border-[var(--border-strong)]
          hover:-translate-y-0.5
          active:translate-y-0 active:scale-[0.98]
          focus-visible:ring-[var(--border-focus)]
        `,
        ghost: `
          text-[var(--text-secondary)]
          hover:bg-[var(--bg-subtle)]
          hover:text-[var(--text-primary)]
          active:scale-[0.98]
          focus-visible:ring-[var(--border-focus)]
        `,
        success: `
          bg-[var(--success-base)] text-white
          hover:bg-[var(--success-strong)]
          hover:-translate-y-0.5
          active:translate-y-0 active:scale-[0.98]
          focus-visible:ring-[var(--success-base)]
        `,
        danger: `
          bg-[var(--error-base)] text-white
          hover:bg-[var(--error-strong)]
          hover:-translate-y-0.5
          active:translate-y-0 active:scale-[0.98]
          focus-visible:ring-[var(--error-base)]
        `,
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
