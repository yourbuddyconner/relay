# Local Development Setup

This guide will help you set up a complete local development environment for the Relay Protocol.

## Prerequisites

- Docker and Docker Compose
- Foundry (for smart contract compilation and deployment)
- Just command runner (`cargo install just`)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/relay-protocol/relay
cd relay

# Start the full development stack
just dev-full
```

This will:
1. Start Anvil (local Ethereum node) in Docker
2. Deploy all smart contracts locally
3. Start the mock email relayer service in Docker
4. Launch the frontend development server in Docker

**To stop all services:** Press `Ctrl+C` or run `just stop`

### Docker Compose Commands

```bash
# Start all services
just dev

# Start in background
just dev-detached

# View logs
just logs

# View specific service logs
just logs-service anvil
just logs-service mock-relayer
just logs-service frontend

# Stop all services
just stop

# Rebuild containers
just rebuild
```

## Architecture Overview

```
relay/
├── contracts/          # Smart contracts (Solidity)
├── crates/            # Rust services
│   └── mock-relayer/  # Mock email relayer for testing
├── frontend/          # Next.js application
└── docs/             # Documentation
```

## Development Workflow

### 1. Smart Contracts

```bash
# Deploy contracts to local Anvil
just deploy-local

# Run contract tests
just test-contracts

# View deployment addresses
just deployments
```

### 2. Mock Email Relayer

The mock relayer simulates ZK email proof generation for local testing.

```bash
# Start the relayer service
just mock-relayer

# API available at http://localhost:3001
# Health check: GET /health
```

### 3. Frontend Development

```bash
# Start frontend only (assumes contracts deployed)
cd frontend && pnpm dev

# Access at http://localhost:3000
```

## Testing Email Flows

### 1. Using the Mock Relayer API

```bash
# Submit a test email
curl -X POST http://localhost:3001/api/v1/email/submit \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@opentable.com",
    "to": "user@example.com",
    "subject": "LIST 150",
    "body": "Reservation confirmed at The French Laundry"
  }'

# Generate test proof directly
curl -X POST http://localhost:3001/api/v1/test/generate-proof \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "opentable",
    "restaurant_name": "The French Laundry",
    "party_size": 2,
    "reservation_type": "confirmation"
  }'
```

### 2. Using the Frontend Dev Tools

1. Connect wallet (use Anvil test accounts)
2. Open Dev Tools panel (bottom right)
3. Use "Generate Test Reservation" button
4. Access test accounts and private keys

## Common Tasks

### Stop All Services

```bash
# Stop all running services
just stop
```

### Reset Everything

```bash
# Kill all processes and clean state
just reset

# Start fresh
just dev-full
```

### View Logs

```bash
# Contract deployment logs
cat contracts/broadcast/*/run-latest.json

# Relayer logs (when running)
# Logs appear in terminal where `just mock-relayer` is running
```

### Connect MetaMask

1. Add Custom Network:
   - Network Name: Anvil Local
   - RPC URL: http://localhost:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

2. Import Test Account:
   - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - This is Anvil's default account #0 with 10000 ETH

## Environment Variables

Frontend uses `.env.local` for configuration:

```env
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_MOCK_RELAYER_URL=http://localhost:3001
```

## Troubleshooting

### Anvil won't start
- Check if port 8545 is already in use: `lsof -i :8545`
- Kill existing process: `pkill anvil`

### Contract deployment fails
- Ensure Anvil is running: `nc -z localhost 8545`
- Check you're in the correct directory
- Try cleaning cache: `cd contracts && forge clean`

### Frontend can't connect to contracts
- Ensure contracts are deployed: `just deployments`
- Check that `frontend/src/contracts/deployments/local.json` exists
- Restart the frontend server

### Mock relayer errors
- Check if port 3001 is available: `lsof -i :3001`
- View relayer logs for detailed errors
- Ensure Rust toolchain is up to date: `rustup update`

## Advanced Usage

### Custom Test Data

Create specific test scenarios in the mock relayer:

```rust
// In crates/mock-relayer/src/handlers.rs
// Modify the extract_restaurant_name or other functions
// to parse your specific email formats
```

### Modify Gas Settings

Edit `contracts/foundry.toml`:

```toml
[profile.default]
gas_limit = 30_000_000
gas_price = 1_000_000_000
```

### Speed Up Block Times

Modify Anvil startup in `scripts/deploy-local.sh`:

```bash
anvil --block-time 1  # 1 second blocks (fast)
# or
anvil --block-time 0  # Instant mining (fastest)
``` 