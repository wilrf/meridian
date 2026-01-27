import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ProgressSidebar from "@/components/ProgressSidebar";
import PyodideProvider from "@/components/PyodideProvider";
import PyodideStatus from "@/components/PyodideStatus";
import { ThemeProvider } from "@/lib/theme-context";
import { AuthProvider } from "@/lib/auth-context";
import ErrorBoundary from "@/components/ErrorBoundary";

// =============================================================================
// Font Configuration - Optimized for performance
// =============================================================================

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: true,
});

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: "Meridian",
  description: "Navigate your Python learning journey",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/logos/meridian-logomark-navy.svg', type: 'image/svg+xml' },
    ],
    apple: '/logos/meridian-logomark-navy.svg',
  },
  // Performance hints
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F9F8F6' },
    { media: '(prefers-color-scheme: dark)', color: '#0C0A10' },
  ],
};

import SidebarErrorFallback from "@/components/SidebarErrorFallback";

// =============================================================================
// Layout Component
// =============================================================================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            {/* Pyodide loads lazily - only when user interacts with code */}
            <PyodideProvider>
              <div className="flex min-h-screen bg-[var(--bg-canvas)]">
                <ErrorBoundary fallback={<SidebarErrorFallback />}>
                  <ProgressSidebar />
                </ErrorBoundary>
                <main className="flex-1 overflow-auto bg-[var(--bg-surface)]">
                  {children}
                </main>
              </div>
              <PyodideStatus />
            </PyodideProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
