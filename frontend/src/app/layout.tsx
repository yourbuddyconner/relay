import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { DevTools } from '@/components/DevTools'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Relay - Restaurant Reservation Trading',
  description: 'Trade restaurant reservations securely with ZK proofs',
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