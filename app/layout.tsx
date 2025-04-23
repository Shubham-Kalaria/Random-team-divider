import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Team Generator',
  description: 'Random Team Generator',
  icons: {
    icon: '/public/favicon.ico',
    shortcut: '/public/favicon.ico',
    apple: '/public/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="description" content="Random Team Generator" />
        <meta name="keywords" content="team generator, random team, team division, random team divider, random team generator, random team division, team, random, generator, divider, division, team generator" />
        <meta name="author" content="Shubham Kalaria" />
        <meta property="og:title" content="Team Generator" />
        <meta property="og:description" content="Random Team Generator" />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://team-generator.vercel.app" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Team Generator" />
      </head>
      <body>{children}</body>
    </html>
  )
}
