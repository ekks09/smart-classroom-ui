import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Scholar's AI - Cyberpunk Classroom Intelligence",
  description: 'Advanced AI-powered learning assistant with cyberpunk aesthetics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans">
        {children}
      </body>
    </html>
  )
}
