import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { supportedChains, activeChain } from './chains'
import { http } from 'viem'

// Build transports configuration dynamically
const transports = supportedChains.reduce((acc, chain) => {
  // Use custom RPC URL if provided, otherwise use default
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || chain.rpcUrls.default.http[0]
  return {
    ...acc,
    [chain.id]: http(rpcUrl)
  }
}, {})

export const config = getDefaultConfig({
  appName: 'Relay Protocol',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'a66c7e3b4f4c48e9bce8b7b0e3e5b932', // Fallback for local dev
  chains: supportedChains as any,
  transports,
  ssr: true, // Next.js SSR
}) 