# Deployment Guide for Relay Frontend

## Vercel Deployment Configuration

### Environment Variables

The application uses environment variables that can be configured in two ways:

#### Option 1: Using Vercel Secrets (Recommended for Production)

1. **Create secrets in Vercel Dashboard:**
   - Go to your project settings → Environment Variables
   - Add these variables:
     - `wallet_connect_project_id`: Your WalletConnect project ID
     - `mock_relayer_url`: Your relayer service URL
     - `chain_id`: The blockchain network ID (e.g., 1 for mainnet)
     - `rpc_url`: Your RPC endpoint URL

2. **Update vercel.json to use secrets:**
   ```json
   "env": {
     "NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID": "@wallet_connect_project_id",
     "NEXT_PUBLIC_MOCK_RELAYER_URL": "@mock_relayer_url",
     "NEXT_PUBLIC_CHAIN_ID": "@chain_id",
     "NEXT_PUBLIC_RPC_URL": "@rpc_url"
   }
   ```

#### Option 2: Direct Values (For Testing/Development)

Use direct values in `vercel.json`:
```json
"env": {
  "NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID": "your-actual-project-id",
  "NEXT_PUBLIC_MOCK_RELAYER_URL": "https://your-relayer.com",
  "NEXT_PUBLIC_CHAIN_ID": "1",
  "NEXT_PUBLIC_RPC_URL": "https://eth-mainnet.g.alchemy.com/v2/your-key"
}
```

**⚠️ Warning:** Never commit real API keys or sensitive data when using direct values!

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | WalletConnect Cloud project ID | Get from https://cloud.walletconnect.com |
| `NEXT_PUBLIC_MOCK_RELAYER_URL` | Email relayer service URL | `https://relay-relayer.vercel.app` |
| `NEXT_PUBLIC_CHAIN_ID` | Blockchain network ID | `1` (mainnet), `11155111` (sepolia) |
| `NEXT_PUBLIC_RPC_URL` | Ethereum RPC endpoint | `https://eth-mainnet.g.alchemy.com/v2/...` |
| `NEXT_PUBLIC_BASE_URL` | Your app's base URL (optional) | `https://relay.xyz` |

### Deployment Steps

1. **Get a WalletConnect Project ID:**
   - Sign up at https://cloud.walletconnect.com
   - Create a new project
   - Copy the Project ID

2. **Set up RPC Provider:**
   - Sign up for Alchemy, Infura, or similar
   - Create an app for your target network
   - Copy the RPC URL

3. **Configure Vercel:**
   - Import your GitHub repository
   - Set root directory to `frontend`
   - Add environment variables (either as secrets or in vercel.json)
   - Deploy

### Local Development

For local development, create a `.env.local` file:
```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_dev_project_id
NEXT_PUBLIC_MOCK_RELAYER_URL=http://localhost:8080
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Troubleshooting

**"Environment Variable references Secret which does not exist"**
- This means you're using `@secret_name` syntax but haven't created the secret in Vercel
- Either create the secret in Vercel dashboard or use direct values

**"Invalid WalletConnect Project ID"**
- Make sure you've copied the correct project ID from WalletConnect Cloud
- The ID should be a 32-character string

**CORS Errors with Relayer**
- Ensure your relayer service allows requests from your Vercel domain
- Add appropriate CORS headers to your relayer service 