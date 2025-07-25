#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting local deployment...${NC}"

# Change to contracts directory
cd contracts || exit 1

# Check if anvil is running and wait for it to be ready
echo -e "${BLUE}Checking Anvil connection...${NC}"
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if cast block-number --rpc-url http://localhost:8545 > /dev/null 2>&1; then
        echo -e "${GREEN}Anvil is ready!${NC}"
        break
    else
        echo "Waiting for Anvil to be ready... (attempt $((RETRY_COUNT + 1))/$MAX_RETRIES)"
        sleep 1
        RETRY_COUNT=$((RETRY_COUNT + 1))
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}Failed to connect to Anvil after $MAX_RETRIES attempts${NC}"
    exit 1
fi

# Create deployments directory if it doesn't exist
mkdir -p deployments

# Run the deployment script with retries
echo -e "${BLUE}Deploying contracts...${NC}"
DEPLOY_SUCCESS=false
DEPLOY_RETRIES=3
DEPLOY_ATTEMPT=1

while [ $DEPLOY_ATTEMPT -le $DEPLOY_RETRIES ]; do
    echo -e "${BLUE}Deployment attempt $DEPLOY_ATTEMPT/$DEPLOY_RETRIES...${NC}"
    
    if forge script script/DeployLocal.s.sol:DeployLocal --rpc-url http://localhost:8545 --broadcast -vvv; then
        DEPLOY_SUCCESS=true
        break
    else
        echo -e "${RED}Deployment attempt $DEPLOY_ATTEMPT failed${NC}"
        if [ $DEPLOY_ATTEMPT -lt $DEPLOY_RETRIES ]; then
            echo "Retrying in 2 seconds..."
            sleep 2
        fi
        DEPLOY_ATTEMPT=$((DEPLOY_ATTEMPT + 1))
    fi
done

if [ "$DEPLOY_SUCCESS" = true ]; then
    echo -e "${GREEN}Deployment successful!${NC}"
    
    # Copy deployment info to frontend
    if [ -f deployments/local.json ]; then
        echo -e "${BLUE}Copying deployment info to frontend...${NC}"
        mkdir -p ../frontend/src/contracts/deployments
        cp deployments/local.json ../frontend/src/contracts/deployments/local.json
        echo -e "${GREEN}Deployment info copied to frontend${NC}"
    else
        echo -e "${RED}Deployment succeeded but deployment file was not created!${NC}"
        exit 1
    fi
else
    echo -e "${RED}Deployment failed after $DEPLOY_RETRIES attempts!${NC}"
    echo -e "${RED}Please check your Anvil connection and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}Local deployment complete!${NC}" 