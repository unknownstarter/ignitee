import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ignite - PRD to GTM Strategy',
  description: 'Transform your PRD into actionable go-to-market strategies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
