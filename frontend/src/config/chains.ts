import { defineChain } from 'viem'
import { mainnet, sepolia } from 'viem/chains'

export const localhost = defineChain({
  id: 31337,
  name: 'Localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  blockExplorers: {
    default: { name: 'Local Explorer', url: 'http://localhost:8545' },
  },
  testnet: true,
})

// Export supported chains based on environment
export const supportedChains = (() => {
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID ? parseInt(process.env.NEXT_PUBLIC_CHAIN_ID) : 31337
  
  switch (chainId) {
    case 1:
      return [mainnet]
    case 11155111:
      return [sepolia]
    case 31337:
      return [localhost]
    default:
      console.warn(`Unsupported chain ID: ${chainId}, defaulting to localhost`)
      return [localhost]
  }
})()

// Get the active chain based on environment
export const activeChain = supportedChains[0]

// Contract addresses - will be loaded from deployment file or environment variables
export const getContractAddresses = () => {
  // Production/staging addresses from environment variables
  if (process.env.NEXT_PUBLIC_RESERVATION_MARKETPLACE_ADDRESS) {
    return {
      reservationMarketplace: process.env.NEXT_PUBLIC_RESERVATION_MARKETPLACE_ADDRESS as `0x${string}`,
      reservationEscrow: process.env.NEXT_PUBLIC_RESERVATION_ESCROW_ADDRESS as `0x${string}`,
      reservationVerifier: process.env.NEXT_PUBLIC_RESERVATION_VERIFIER_ADDRESS as `0x${string}`,
      mockEmailVerifierOpenTable: process.env.NEXT_PUBLIC_EMAIL_VERIFIER_OPENTABLE_ADDRESS as `0x${string}` || '0x0000000000000000000000000000000000000000',
      mockEmailVerifierResy: process.env.NEXT_PUBLIC_EMAIL_VERIFIER_RESY_ADDRESS as `0x${string}` || '0x0000000000000000000000000000000000000000',
      mockEmailVerifierCancellation: process.env.NEXT_PUBLIC_EMAIL_VERIFIER_CANCELLATION_ADDRESS as `0x${string}` || '0x0000000000000000000000000000000000000000',
      mockEmailVerifierBooking: process.env.NEXT_PUBLIC_EMAIL_VERIFIER_BOOKING_ADDRESS as `0x${string}` || '0x0000000000000000000000000000000000000000',
    }
  }
  
  // Development addresses from deployment file
  if (process.env.NODE_ENV === 'development') {
    try {
      // Dynamically load deployment file in development
      const deployment = require('../contracts/deployments/local.json')
      return {
        reservationMarketplace: deployment.ReservationMarketplace as `0x${string}`,
        reservationEscrow: deployment.ReservationEscrow as `0x${string}`,
        reservationVerifier: deployment.ReservationVerifier as `0x${string}`,
        mockEmailVerifierOpenTable: deployment.MockEmailVerifierOpenTable as `0x${string}`,
        mockEmailVerifierResy: deployment.MockEmailVerifierResy as `0x${string}`,
        mockEmailVerifierCancellation: deployment.MockEmailVerifierCancellation as `0x${string}`,
        mockEmailVerifierBooking: deployment.MockEmailVerifierBooking as `0x${string}`,
      }
    } catch (e) {
      console.warn('Local deployment file not found. Run `npm run deploy:local` first.')
      return null
    }
  }
  
  // No addresses found
  console.warn('No contract addresses found. Please set environment variables or deploy contracts.')
  return null
} 