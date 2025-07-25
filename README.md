# Relay - Restaurant Reservation Trading Platform

Relay enables secure trading of restaurant reservations using ZK Email proofs for verification and ZKP2P V2's escrow infrastructure for trustless settlement.

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
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/       # Next.js app router pages
│   │   ├── components/# React components
│   │   ├── hooks/     # Custom React hooks
│   │   └── lib/       # Utility functions
│   └── public/        # Static assets
└── docs/              # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Foundry

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

MIT 