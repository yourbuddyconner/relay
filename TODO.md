# Sprint: Local Development Environment Setup

## Goal
Set up a fully functional local development environment with Anvil that allows end-to-end testing of the Relay protocol without external dependencies.

## Phase 1: Foundation (Day 1-2)

### 1.1 Local Blockchain Setup
- [x] Configure Anvil with deterministic accounts
- [x] Create deployment script for all contracts (ReservationVerifier, ReservationMarketplace, ReservationEscrow)
- [x] Set up contract verification mocks for local testing
- [x] Create seed script for initial contract state

### 1.2 Mock Email Verifier
- [x] Create MockEmailVerifier contract that bypasses ZK proofs for local testing
- [x] Implement pattern verifiers for OpenTable, Resy platforms
- [x] Add test reservation data fixtures
- [x] Deploy mock verifiers and register with ReservationVerifier

### 1.3 Local Deployment Scripts
- [x] Create `scripts/deploy-local.sh` that:
  - Starts Anvil with consistent settings
  - Deploys all contracts
  - Registers mock verifiers
  - Outputs contract addresses
- [x] Add npm scripts in root package.json for easy access

## Phase 2: Frontend Integration (Day 2-3)

### 2.1 Frontend Configuration
- [x] Create `.env.local` example with local contract addresses
- [x] Set up wagmi config for localhost chain
- [x] Configure RainbowKit for local development
- [x] Add local chain to wallet connector options

### 2.2 Contract ABIs and Hooks
- [x] Generate TypeScript ABIs from contracts
- [x] Create typed contract hooks using wagmi
- [ ] Set up multicall for efficient data fetching
- [x] Add error handling for local chain quirks

### 2.3 Development UI Helpers
- [x] Add "Dev Tools" panel showing:
  - Current block number/timestamp
  - Active accounts and balances
  - Quick actions (mine block, advance time)
- [x] Create test data generator for reservations

## Phase 3: Email Relayer Mock (Day 3-4)

### 3.1 Local Email Relayer Service
- [x] Create `crates/mock-relayer` with:
  - REST API mimicking production relayer
  - Instant "proof" generation for testing
  - WebSocket endpoint (simplified)
- [x] Configure Rust workspace at root
- [ ] Add UI for simulating email submissions

### 3.2 Test Email Templates
- [ ] Create sample emails for:
  - OpenTable confirmations
  - Resy confirmations
  - Cancellation emails
  - New booking confirmations
- [ ] Add email template viewer in dev tools

### 3.3 Relayer Integration
- [ ] Connect frontend to mock relayer
- [ ] Add status tracking for email processing
- [ ] Implement error simulation capabilities

## Phase 4: Test Scenarios (Day 4-5)

### 4.1 Happy Path Tests
- [ ] Complete listing flow test
- [ ] Purchase and coordination test
- [ ] Successful cancellation and claim test
- [ ] Settlement verification

### 4.2 Edge Cases
- [ ] Expired listing handling
- [ ] Failed coordination scenarios
- [ ] Timeout behaviors
- [ ] Gas estimation edge cases

### 4.3 Integration Test Suite
- [ ] Create Playwright/Cypress tests for full flows
- [ ] Add contract interaction tests
- [ ] Mock relayer behavior tests
- [ ] Multi-user scenario tests

## Phase 5: Developer Experience (Day 5)

### 5.1 Documentation
- [ ] Create `docs/local-development.md` with:
  - Setup instructions
  - Common commands
  - Troubleshooting guide
  - Test scenarios walkthrough

### 5.2 Tooling
- [x] Add `just` commands for common tasks
- [x] Create reset script to clean state
- [x] Add proper process management for dev-full
- [x] Add stop command to kill all services
- [x] Implement Docker Compose for service orchestration
- [ ] Add monitoring dashboard for local chain
- [ ] Set up hot reload for contract changes

### 5.3 Demo Scenarios
- [ ] Create scripted demos showing:
  - Full reservation sale flow
  - Multiple concurrent orders
  - Fee calculations
  - Error recovery

## Success Criteria
- [x] Can run entire protocol locally without external dependencies
- [x] Frontend connects to local contracts seamlessly  
- [x] Can simulate all email verification flows
- [ ] Test suite passes for all major user journeys
- [x] Another developer can set up environment in < 10 minutes

## Quick Start Commands
```bash
# Start everything
just dev-full

# Reset and restart
just reset

# Run test scenarios (when implemented)
just test-e2e

# Deploy fresh contracts
just deploy-local

# Start mock relayer
just mock-relayer
```

## Notes
- Prioritize getting a basic flow working end-to-end before adding all features
- Mock relayer should be simple but realistic enough for testing
- Focus on developer ergonomics - fast iteration cycles
- Keep local env config separate from production config

## Completed Implementation Details
- Docker Compose orchestrates all services (Anvil, mock-relayer, frontend)
- Contracts deployed locally with Foundry (not containerized for flexibility)
- Rust workspace configured at root with mock-relayer in `crates/`
- Hot reload enabled for frontend development
- Simple `just dev-full` command starts everything 