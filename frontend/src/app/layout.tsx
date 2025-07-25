import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { DevTools } from '@/components/DevTools'

const inter = Inter({ subsets: ['latin'] })

const defaultUrl = process.env.NEXT_PUBLIC_BASE_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export const metadata: Metadata = {
  title: 'Relay - Restaurant Reservation Trading',
  description: 'The first decentralized marketplace where people can safely buy and sell restaurant reservations. Powered by zero-knowledge proofs for complete privacy and security.',
  keywords: ['restaurant reservations', 'marketplace', 'blockchain', 'zero-knowledge proofs', 'Carbone', 'NYC restaurants'],
  authors: [{ name: 'Relay Protocol' }],
  metadataBase: new URL(defaultUrl),
  openGraph: {
    title: 'Relay - Never Miss Out on That Perfect Table',
    description: 'The first decentralized marketplace where people can safely buy and sell restaurant reservations. Powered by zero-knowledge proofs for complete privacy and security.',
    url: '/',
    siteName: 'Relay',
    images: [
      {
        url: '/preview.png',
        width: 1200,
        height: 630,
        alt: 'Relay - Restaurant Reservation Trading Platform',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Relay - Never Miss Out on That Perfect Table',
    description: 'The first decentralized marketplace where people can safely buy and sell restaurant reservations.',
    images: ['/preview.png'],
    creator: '@relayprotocol',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <DevTools />
        </Providers>
      </body>
    </html>
  )
} 