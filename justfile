# Relay Protocol Development Commands

# Default command - show available commands
default:
    @just --list



# Start development with Docker Compose
dev:
    @echo "Starting development stack with Docker Compose..."
    docker-compose up

# Deploy contracts (run after docker-compose is up)
deploy:
    @echo "Deploying contracts..."
    cd contracts && forge script script/DeployLocal.s.sol:DeployLocal --rpc-url http://localhost:8545 --broadcast -vvv

# Deploy contracts to local Anvil
deploy-local:
    @echo "Deploying contracts to local Anvil..."
    ./scripts/deploy-local.sh

# Deploy contracts using Docker (better network connectivity)
deploy-docker:
    @echo "Deploying contracts via Docker..."
    @mkdir -p contracts/deployments
    @mkdir -p frontend/src/contracts/deployments
    docker run --rm \
        --network relay-network \
        -v $(pwd)/contracts:/contracts \
        -w /contracts \
        ghcr.io/foundry-rs/foundry:latest \
        sh -c "mkdir -p deployments && forge script script/DeployLocal.s.sol:DeployLocal --rpc-url http://anvil:8545 --broadcast -vvv"
    @if [ -f contracts/deployments/local.json ]; then \
        echo "Copying deployment info to frontend..."; \
        cp contracts/deployments/local.json frontend/src/contracts/deployments/local.json; \
        echo "Deployment successful!"; \
    else \
        echo "ERROR: Deployment file not created. Check the deployment logs above."; \
        exit 1; \
    fi

# Alternative deployment that captures output
deploy-docker-alt:
    @echo "Deploying contracts via Docker (alternative method)..."
    @mkdir -p contracts/deployments
    @mkdir -p frontend/src/contracts/deployments
    @echo "Running deployment and capturing output..."
    @docker run --rm \
        --network relay-network \
        -v $(pwd)/contracts:/contracts \
        -w /contracts \
        ghcr.io/foundry-rs/foundry:latest \
        sh -c "forge script script/DeployLocal.s.sol:DeployLocal --rpc-url http://anvil:8545 --broadcast -vv --json" 2>&1 | \
        tee contracts/deployments/deploy.log
    @echo "Deployment complete. Check contracts/deployments/deploy.log for details."

# Full development flow
dev-full:
    @echo "Starting full development stack..."
    # Start services
    docker-compose up -d anvil
    @echo "Waiting for Anvil to be ready..."
    @while ! docker-compose exec -T anvil cast block-number --rpc-url http://localhost:8545 > /dev/null 2>&1; do \
        echo "Waiting for Anvil..."; \
        sleep 1; \
    done
    @echo "Anvil is ready!"
    just deploy-docker
    # Start remaining services
    docker-compose up

# Stop all running services
stop:
    @echo "Stopping all services..."
    docker-compose down
    @echo "All services stopped"

# View logs
logs:
    docker-compose logs -f

# View logs for specific service
logs-service service:
    docker-compose logs -f {{service}}

# Reset everything and start fresh
reset:
    @echo "Resetting development environment..."
    docker-compose down -v
    @rm -rf contracts/cache contracts/out
    @rm -rf contracts/deployments/local.json
    @rm -rf frontend/src/contracts/deployments/local.json
    @echo "Environment reset complete"

# Rebuild services
rebuild:
    docker-compose build --no-cache

# Run contract tests
test-contracts:
    @echo "Running contract tests..."
    cd contracts && forge test -vvv

# Run relayer tests
test-relayer:
    @echo "Running relayer tests..."
    cargo test --workspace

# Run all tests
test-all: test-contracts test-relayer
    @echo "All tests completed"

# Build contracts
build-contracts:
    @echo "Building contracts..."
    cd contracts && forge clean && forge build

# Build relayer
build-relayer:
    @echo "Building mock relayer..."
    cd crates/mock-relayer && cargo build --release

# Build all
build-all: build-contracts build-relayer
    @echo "Building frontend..."
    cd frontend && npm run build

# Install dependencies
install:
    @echo "Installing dependencies..."
    cd frontend && pnpm install
    cd contracts && forge install
    @echo "Checking Rust dependencies..."
    cargo check --workspace

# Generate contract ABIs
generate-abis:
    @echo "Generating contract ABIs..."
    cd contracts && forge build
    @mkdir -p frontend/src/contracts/abis
    @cp contracts/out/ReservationMarketplace.sol/ReservationMarketplace.json frontend/src/contracts/abis/
    @cp contracts/out/ReservationEscrow.sol/ReservationEscrow.json frontend/src/contracts/abis/
    @cp contracts/out/ReservationVerifier.sol/ReservationVerifier.json frontend/src/contracts/abis/
    @echo "ABIs copied to frontend"

# Check contract sizes
size:
    cd contracts && forge build --sizes

# Format contracts
fmt:
    cd contracts && forge fmt

# Run local E2E tests (when implemented)
test-e2e:
    @echo "E2E tests not yet implemented"

# Start mock relayer locally (without Docker)  
mock-relayer-local:
    @echo "Starting mock relayer service locally..."
    cd crates/mock-relayer && cargo run

# View deployment addresses
deployments:
    @echo "Current deployment addresses:"
    @cat contracts/deployments/local.json 2>/dev/null || echo "No local deployment found"

# Clean all build artifacts
clean:
    @echo "Cleaning build artifacts..."
    @rm -rf contracts/cache contracts/out
    @rm -rf frontend/.next
    @echo "Clean complete" 