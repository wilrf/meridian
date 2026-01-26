import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background surfaces
        canvas: "var(--bg-canvas)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        subtle: "var(--bg-subtle)",
        muted: "var(--bg-muted)",
        inset: "var(--bg-inset)",

        // Text colors
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
        "text-muted": "var(--text-muted)",
        "text-inverse": "var(--text-inverse)",

        // Border colors
        "border-subtle": "var(--border-subtle)",
        "border-default": "var(--border-default)",
        "border-strong": "var(--border-strong)",
        "border-focus": "var(--border-focus)",

        // Accent colors (quiet luxury)
        accent: {
          subtle: "var(--accent-subtle)",
          light: "var(--accent-light)",
          DEFAULT: "var(--accent-base)",
          strong: "var(--accent-strong)",
          glow: "var(--accent-glow)",
        },

        // Interactive colors
        interactive: {
          primary: "var(--interactive-primary)",
          "primary-hover": "var(--interactive-primary-hover)",
          secondary: "var(--interactive-secondary)",
          "secondary-hover": "var(--interactive-secondary-hover)",
        },

        // Semantic feedback colors
        success: {
          subtle: "var(--success-subtle)",
          light: "var(--success-light)",
          DEFAULT: "var(--success-base)",
          strong: "var(--success-strong)",
        },
        warning: {
          subtle: "var(--warning-subtle)",
          light: "var(--warning-light)",
          DEFAULT: "var(--warning-base)",
          strong: "var(--warning-strong)",
        },
        error: {
          subtle: "var(--error-subtle)",
          light: "var(--error-light)",
          DEFAULT: "var(--error-base)",
          strong: "var(--error-strong)",
        },
        info: {
          subtle: "var(--info-subtle)",
          light: "var(--info-light)",
          DEFAULT: "var(--info-base)",
          strong: "var(--info-strong)",
        },

        // Editor colors (Ink theme)
        editor: {
          bg: "var(--editor-bg)",
          "bg-highlight": "var(--editor-bg-highlight)",
          "bg-selection": "var(--editor-bg-selection)",
          text: "var(--editor-text)",
          "text-muted": "var(--editor-text-muted)",
        },

        // Output panel
        output: {
          bg: "var(--output-bg)",
          text: "var(--output-text)",
          success: "var(--output-success)",
          error: "var(--output-error)",
          warning: "var(--output-warning)",
        },

        // Syntax highlighting
        syntax: {
          keyword: "var(--syntax-keyword)",
          string: "var(--syntax-string)",
          number: "var(--syntax-number)",
          function: "var(--syntax-function)",
          comment: "var(--syntax-comment)",
          operator: "var(--syntax-operator)",
          decorator: "var(--syntax-decorator)",
        },

        // Primitive colors for direct use
        ivory: {
          25: "var(--ivory-25)",
          50: "var(--ivory-50)",
          100: "var(--ivory-100)",
          200: "var(--ivory-200)",
          300: "var(--ivory-300)",
          400: "var(--ivory-400)",
          500: "var(--ivory-500)",
          600: "var(--ivory-600)",
          700: "var(--ivory-700)",
          800: "var(--ivory-800)",
          900: "var(--ivory-900)",
          950: "var(--ivory-950)",
        },
        navy: {
          50: "var(--navy-50)",
          100: "var(--navy-100)",
          200: "var(--navy-200)",
          300: "var(--navy-300)",
          400: "var(--navy-400)",
          500: "var(--navy-500)",
          600: "var(--navy-600)",
          700: "var(--navy-700)",
          800: "var(--navy-800)",
          900: "var(--navy-900)",
        },
        gold: {
          300: "var(--gold-300)",
          400: "var(--gold-400)",
          500: "var(--gold-500)",
          600: "var(--gold-600)",
        },
      },

      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
        // Aliases for backwards compatibility
        sans: ["var(--font-body)"],
        prose: ["var(--font-body)"],
      },

      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },

      transitionDuration: {
        instant: "75ms",
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
        slower: "500ms",
      },

      transitionTimingFunction: {
        out: "var(--ease-out)",
        in: "var(--ease-in)",
        "in-out": "var(--ease-in-out)",
        spring: "var(--ease-spring)",
      },

      boxShadow: {
        glow: "0 0 16px 4px var(--accent-glow)",
        "glow-sm": "0 0 8px 2px var(--accent-glow)",
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        card: "0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.05)",
        "card-hover": "0 0 0 1px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.1)",
        elevated: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },

      spacing: {
        18: "4.5rem",
        88: "22rem",
      },

      animation: {
        "fade-in": "fade-in var(--duration-normal) var(--ease-out)",
        "slide-up": "slide-up var(--duration-normal) var(--ease-out)",
        "scale-in": "scale-in var(--duration-normal) var(--ease-out)",
        "pulse-glow": "pulse-glow 1.5s ease-in-out infinite",
        "lesson-enter": "lesson-enter var(--duration-normal) var(--ease-out)",
        spin: "spin 1s linear infinite",
      },

      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 transparent" },
          "50%": { boxShadow: "0 0 16px 4px var(--accent-glow)" },
        },
        "lesson-enter": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },

      gridTemplateColumns: {
        dashboard: "repeat(auto-fit, minmax(320px, 1fr))",
        stats: "repeat(4, 1fr)",
        "stats-mobile": "repeat(2, 1fr)",
      },
    },
  },
  plugins: [],
};

export default config;
