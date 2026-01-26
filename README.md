# Meridian

An interactive Python learning platform with in-browser code execution and cloud progress sync.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

## Features

- **In-Browser Python** - Run Python directly in the browser via Pyodide (WebAssembly)
- **Exercise Validation** - Automatic checking with expected output or assertions
- **Progress Sync** - Sign in with GitHub to sync progress across devices
- **Monaco Editor** - VS Code-like editing experience
- **Dark/Light Themes** - Ivory (light) and Velvet (dark) themes

## Tech Stack

- **Next.js 14** - React framework with App Router
- **Supabase** - Authentication and cloud storage
- **Pyodide** - Python runtime in WebAssembly
- **Monaco Editor** - Code editor
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your Supabase credentials to .env
# Get them from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |

## Project Structure

```
├── src/                    # Source code
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── lib/               # Utilities and contexts
│   │   └── supabase/      # Supabase clients
│   └── content/           # Curriculum & manifest
├── public/                # Static assets & workers
├── scripts/               # Build scripts
└── data/                  # Local progress (gitignored)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Authentication

Users can optionally sign in with GitHub to sync progress across devices. Without signing in, progress is stored locally.

To enable GitHub OAuth:
1. Create a GitHub OAuth App
2. Configure the provider in Supabase Dashboard → Auth → Providers
3. Set the callback URL to `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

## License

[MIT](LICENSE)
