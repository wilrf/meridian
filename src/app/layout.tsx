import type { Metadata } from "next";
import "./globals.css";
import ProgressSidebar from "@/components/ProgressSidebar";
import PyodideProvider from "@/components/PyodideProvider";
import PyodideStatus from "@/components/PyodideStatus";
import { ThemeProvider } from "@/lib/theme-context";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Meridian",
  description: "Navigate your Python learning journey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            <PyodideProvider>
              <div className="flex min-h-screen bg-[var(--bg-canvas)]">
                <ProgressSidebar />
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
