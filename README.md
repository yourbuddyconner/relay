# Relay - Restaurant Reservation Trading Platform

Relay enables secure trading of restaurant reservations using ZK Email proofs for verification and ZKP2P V2's escrow infrastructure for trustless settlement.

## Quick Start

```bash
# Prerequisites: Docker, Docker Compose, Foundry, Just
cargo install just

# Start full development environment
just dev-full
```

This starts:
- Local Anvil blockchain (Docker)
- Smart contracts deployment (local) 
- Mock email relayer (Docker)
- Frontend (Docker with hot reload)

Access the app at http://localhost:3000

**To stop all services:** Press `Ctrl+C` or run `just stop`

### Alternative Commands

```bash
just dev          # Start all services with docker-compose
just dev-detached # Start in background
just logs         # View logs
just stop         # Stop all services
just reset        # Clean everything and start fresh
```

## Architecture

The platform combines:
- **ZK Email SDK**: For email verification and proof generation
- **Custom Smart Contracts**: Built with Foundry for escrow and marketplace logic
- **Next.js Frontend**: Modern UI for trading reservations

## Project Structure

```
relay/
├── contracts/          # Foundry smart contracts
│   ├── src/           # Contract source files
│   ├── test/          # Contract tests
│   └── script/        # Deployment scripts
├── crates/            # Rust workspace
│   └── mock-relayer/  # Mock email relayer service
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/       # Next.js app router pages
│   │   ├── components/# React components
│   │   ├── hooks/     # Custom React hooks
│   │   └── lib/       # Utility functions
│   └── public/        # Static assets
├── docs/              # Documentation
├── Cargo.toml         # Rust workspace configuration
└── justfile           # Development commands
```

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Foundry (for contract deployment)
- Just (`cargo install just`)
- Rust (optional, only for local development without Docker)

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd relay
```

2. Install frontend dependencies:
```bash
pnpm install
```

3. Install contract dependencies:
```bash
cd contracts
forge install
```

### Development

#### Frontend
```bash
cd frontend
pnpm dev
```

The frontend will be available at http://localhost:3000

#### Contracts
```bash
cd contracts
forge build
forge test
```

## Deployment

### Vercel Deployment (Frontend)

1. **Prerequisites**
   - Deploy smart contracts to your target network
   - Deploy or have access to an email relayer service
   - Obtain a WalletConnect Project ID

2. **Deploy to Vercel**
   ```bash
   cd frontend
   vercel
   ```

3. **Environment Variables**
   Set these in your Vercel project settings:
   - `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`
   - `NEXT_PUBLIC_MOCK_RELAYER_URL`
   - `NEXT_PUBLIC_CHAIN_ID`
   - `NEXT_PUBLIC_RPC_URL`
   - `NEXT_PUBLIC_RESERVATION_MARKETPLACE_ADDRESS`
   - `NEXT_PUBLIC_RESERVATION_ESCROW_ADDRESS`
   - `NEXT_PUBLIC_RESERVATION_VERIFIER_ADDRESS`

See `frontend/README.md` for detailed deployment instructions.

## Smart Contracts

### Core Contracts

1. **ReservationEscrow**: Handles escrow logic and state management
2. **ReservationVerifier**: Verifies ZK proofs for reservations, cancellations, and bookings
3. **ReservationMarketplace**: Main trading logic and fee management

### Key Features

- ZK Email proof verification for reservation ownership
- Timed coordination mechanism for atomic transfers
- Escrow system with buyer deposits and seller guarantees
- Fee structure: 2% listing fee, 3% success fee

## Frontend Features

- ZK Email SDK integration for proof generation
- Web3 wallet connection with wagmi
- Real-time coordination interface
- Mobile-responsive design

## Security

- Zero-knowledge proofs ensure privacy
- DKIM signature verification prevents fake emails
- Economic incentives discourage malicious behavior
- Smart contract escrow protects both parties

## License

Currently unlicensed. All rights reserved. 