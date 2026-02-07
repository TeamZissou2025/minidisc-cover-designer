import type { Metadata } from 'next'
import './globals.css'
import GoogleAnalytics from './components/GoogleAnalytics'

export const metadata: Metadata = {
  title: 'MiniDisc Cover Designer v0.3.7c',
  description: 'Create professional MiniDisc labels • by Joltt',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en">
      <body>
        {gaId && <GoogleAnalytics measurementId={gaId} />}
        {children}
      </body>
    </html>
  )
}
