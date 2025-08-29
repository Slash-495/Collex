import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/lib/providers'
import { AuthProvider } from '@/lib/auth'
import { ErrorBoundary } from '@/components/ui/error-boundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Collex',
  description: 'A modern collection management platform',
  icons: {
    icon: [
      {
        url: '/collex-favicon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/favicon.ico',
        type: 'image/x-icon',
      }
    ],
    shortcut: '/collex-favicon.svg',
    apple: '/collex-favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/collex-favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/collex-favicon.svg" />
      </head>
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <ErrorBoundary>
          <Providers>
            <AuthProvider>
              {children}
            </AuthProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
