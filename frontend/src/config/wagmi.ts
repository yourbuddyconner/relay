import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { localhost } from './chains'
import { http } from 'viem'

export const config = getDefaultConfig({
  appName: 'Relay Protocol',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'a66c7e3b4f4c48e9bce8b7b0e3e5b932', // Fallback for local dev
  chains: [localhost],
  transports: {
    [localhost.id]: http(),
  },
  ssr: true, // Next.js SSR
}) 