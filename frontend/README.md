# Relay Frontend

This is the frontend application for the Relay protocol, built with Next.js 14, TypeScript, wagmi, and RainbowKit.

## Features

- 🌐 Web3 wallet integration with RainbowKit
- 🔒 Smart contract interactions for reservation trading
- 🎨 Modern UI with Tailwind CSS and Framer Motion
- 📱 Fully responsive design
- 🚀 Optimized for performance

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn
- A Web3 wallet (MetaMask, Rainbow, etc.)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Copy the environment variables:
```bash
cp .env.example .env.local
```

3. Update the `.env.local` file with your configuration:
```
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_MOCK_RELAYER_URL=http://localhost:8080
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_BASE_URL=https://your-domain.com  # For production
```

### Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Metadata & Social Preview

The application includes comprehensive metadata for social media sharing:

- **Preview Image**: Located at `/public/preview.png` (1200x630px recommended)
- **Open Graph & Twitter Cards**: Configured in `src/app/layout.tsx`
- **Favicon**: Add your icons to the `/public` directory:
  - `/public/favicon.ico`
  - `/public/favicon-16x16.png` 
  - `/public/apple-touch-icon.png`
  - `/public/site.webmanifest`

To update the preview image, simply replace `/public/preview.png` with your new image. The metadata will automatically use this image for link previews on social media platforms.

## Project Structure

```
frontend/
├── public/              # Static assets
│   └── preview.png      # Social media preview image
├── src/
│   ├── app/            # Next.js app directory
│   ├── components/     # React components
│   ├── config/         # Configuration files
│   ├── contracts/      # Contract ABIs and deployments
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Utility functions
├── next.config.js      # Next.js configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

## Smart Contract Integration

The frontend interacts with three main smart contracts:

1. **ReservationMarketplace**: Main marketplace contract for listing and trading reservations
2. **ReservationEscrow**: Handles secure fund transfers between buyers and sellers  
3. **ReservationVerifier**: Verifies reservation authenticity using ZK proofs

Contract ABIs are located in `src/contracts/abis/` and deployment addresses in `src/contracts/deployments/`.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Set the environment variables in Vercel dashboard
4. Deploy

The `vercel.json` file includes optimized settings for the deployment.

### Docker

Build and run with Docker:

```bash
docker build -f Dockerfile.dev -t relay-frontend .
docker run -p 3000:3000 relay-frontend
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 