# Relay Frontend

Next.js application for the Relay Protocol - a decentralized restaurant reservation trading platform.

## Local Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Visit http://localhost:3000

## Environment Variables

Create a `.env.local` file based on the following required variables:

```env
# WalletConnect Project ID (required)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here

# Email Relayer URL (required)
NEXT_PUBLIC_MOCK_RELAYER_URL=https://your-relayer-url.com

# Chain Configuration (required)
# 1 = Mainnet, 11155111 = Sepolia, 137 = Polygon
NEXT_PUBLIC_CHAIN_ID=11155111

# RPC URL (required)
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key

# Contract Addresses (required for production)
NEXT_PUBLIC_RESERVATION_MARKETPLACE_ADDRESS=0x...
NEXT_PUBLIC_RESERVATION_ESCROW_ADDRESS=0x...
NEXT_PUBLIC_RESERVATION_VERIFIER_ADDRESS=0x...

# Optional: Email Verifier Addresses
NEXT_PUBLIC_EMAIL_VERIFIER_OPENTABLE_ADDRESS=0x...
NEXT_PUBLIC_EMAIL_VERIFIER_RESY_ADDRESS=0x...
NEXT_PUBLIC_EMAIL_VERIFIER_CANCELLATION_ADDRESS=0x...
NEXT_PUBLIC_EMAIL_VERIFIER_BOOKING_ADDRESS=0x...
```

## Deployment on Vercel

### Prerequisites

1. Deploy your smart contracts to your target network (Sepolia, Mainnet, etc.)
2. Deploy or have access to an email relayer service
3. Obtain a WalletConnect Project ID from https://cloud.walletconnect.com/

### Steps

1. **Fork/Clone this repository**

2. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

3. **Deploy via Vercel Dashboard**
   - Connect your GitHub repository to Vercel
   - Set the root directory to `frontend`
   - Framework preset will be auto-detected as Next.js
   - Add all required environment variables in the Vercel dashboard

4. **Or deploy via CLI**
   ```bash
   cd frontend
   vercel
   ```

### Environment Variables in Vercel

Add these in your Vercel project settings:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | Your WalletConnect project ID |
| `NEXT_PUBLIC_MOCK_RELAYER_URL` | Your deployed relayer service URL |
| `NEXT_PUBLIC_CHAIN_ID` | Target chain ID (e.g., 11155111 for Sepolia) |
| `NEXT_PUBLIC_RPC_URL` | Your RPC endpoint URL |
| `NEXT_PUBLIC_RESERVATION_MARKETPLACE_ADDRESS` | Deployed marketplace contract |
| `NEXT_PUBLIC_RESERVATION_ESCROW_ADDRESS` | Deployed escrow contract |
| `NEXT_PUBLIC_RESERVATION_VERIFIER_ADDRESS` | Deployed verifier contract |

### Production Considerations

1. **RPC Endpoints**: Use a reliable RPC provider (Alchemy, Infura, etc.) with appropriate rate limits
2. **Email Relayer**: The mock relayer is for development only. Deploy a production relayer service
3. **Contract Deployment**: Ensure contracts are properly audited before mainnet deployment
4. **CORS**: Configure your relayer service to accept requests from your Vercel domain

## Build & Export

```bash
# Build for production
pnpm build

# Start production server (local)
pnpm start
```

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- wagmi/viem for Web3
- RainbowKit for wallet connection
- Framer Motion for animations 