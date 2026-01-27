import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compress output
  compress: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Optimize production builds
  swcMinify: true,
  reactStrictMode: true,

  // Experimental optimizations
  experimental: {
    // Optimize package imports - tree-shake heavy packages
    optimizePackageImports: [
      'react-markdown',
      '@supabase/supabase-js',
      '@supabase/ssr',
      'zustand',
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // CSP for Pyodide WASM execution - allows eval for Python code execution
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://cdn.jsdelivr.net; frame-ancestors 'none';"
          },
        ],
      },
      {
        // Required for Pyodide WebAssembly workers
        source: '/workers/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache fonts aggressively
        source: '/fonts/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache static assets
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache images
        source: '/logos/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 100000, // Split large chunks
          cacheGroups: {
            // Framework chunk (React, Next.js core)
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
              chunks: 'all',
              priority: 50,
              enforce: true,
            },
            // Supabase - only loaded when auth is needed
            supabase: {
              name: 'supabase',
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              chunks: 'all',
              priority: 40,
            },
            // Markdown processing - only on lesson pages
            markdown: {
              name: 'markdown',
              test: /[\\/]node_modules[\\/](react-markdown|remark-.*|rehype-.*|unified|unist-.*|mdast-.*|hast-.*|micromark.*|decode-named-character-reference|character-entities)[\\/]/,
              chunks: 'all',
              priority: 35,
            },
            // UI utilities
            ui: {
              name: 'ui',
              test: /[\\/]node_modules[\\/](clsx|class-variance-authority|tailwind-merge)[\\/]/,
              chunks: 'all',
              priority: 30,
            },
            // Remaining vendor code
            vendor: {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              chunks: 'all',
              priority: 10,
            },
          },
        },
      }
    }

    return config
  },
}

export default withBundleAnalyzer(nextConfig)
