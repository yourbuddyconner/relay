import { defineChain } from 'viem'

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

// Contract addresses - will be loaded from deployment file
export const getContractAddresses = () => {
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
  
  // Production addresses would go here
  return null
} 