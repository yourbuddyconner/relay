# Relay Protocol Overview

## Introduction

Relay is a decentralized marketplace for trading restaurant reservations using zero-knowledge proofs to verify ownership while maintaining privacy. The protocol combines ZK Email verification with a sophisticated escrow system to enable trustless transfers.

## Core Components

### 1. ZK Email Verification
- Proves ownership of reservation confirmation emails
- Verifies cancellation and rebooking without revealing personal data
- Uses DKIM signatures to prevent forgery

### 2. Escrow System
- Sellers lock funds as guarantee
- Buyers deposit 150% of price as collateral
- Timed coordination ensures atomic transfers

### 3. Smart Contract Architecture

```mermaid
graph TB
    subgraph "ZK Email Layer"
        A[Email Patterns Registry]
        B[Proof Generation SDK]
        C[On-chain Verifiers]
    end
    
    subgraph "Smart Contracts"
        D[ReservationVerifier]
        E[ReservationEscrow]
        F[ReservationMarketplace]
    end
    
    subgraph "Frontend"
        G[Next.js App]
        H[ZK Email SDK]
        I[Wagmi/Viem]
    end
    
    A --> B
    B --> H
    H --> G
    G --> I
    I --> F
    F --> E
    F --> D
    D --> C
    C --> A
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style D fill:#bbf,stroke:#333,stroke-width:2px
    style E fill:#bbf,stroke:#333,stroke-width:2px
    style F fill:#bbf,stroke:#333,stroke-width:2px
    style G fill:#bfb,stroke:#333,stroke-width:2px
``` 

## How It Works

### Step 1: Listing a Reservation

```mermaid
sequenceDiagram
    participant Seller
    participant Email as Seller's Email
    participant Relayer as Relay Relayer
    participant Contract as Smart Contracts
    participant Frontend
    
    Seller->>Email: Forward reservation email
    Note over Email: Subject: "LIST $200"
    Email->>Relayer: Send to verify@relay.xyz
    Relayer->>Relayer: Verify DKIM signature
    Relayer->>Relayer: Generate ZK proof
    Relayer->>Contract: Submit proof + listing details
    Contract-->>Relayer: Listing created
    Relayer-->>Seller: Confirmation email
    Seller->>Frontend: View listing on website
```

### Step 2: Creating an Order

```mermaid
sequenceDiagram
    participant Buyer
    participant Frontend
    participant Marketplace as ReservationMarketplace
    participant Escrow as ReservationEscrow
    
    Buyer->>Frontend: Browse listings
    Frontend->>Marketplace: View listing details
    Buyer->>Frontend: Select reservation + coordination time
    Frontend->>Marketplace: createOrder(listingId, coordinationTime)
    Note over Marketplace: Buyer deposits 150% of price
    Marketplace->>Escrow: createOrder()
    Marketplace->>Escrow: updateListingStatus(Matched)
    Marketplace-->>Buyer: Order created
```

### Step 3: Coordinated Transfer

```mermaid
sequenceDiagram
    participant Seller
    participant Buyer
    participant Platform as Reservation Platform
    participant Email as Email Providers
    participant Relayer as Relay Relayer
    participant Contract as Smart Contracts
    
    Note over Seller,Buyer: At coordination time
    Seller->>Platform: Cancel reservation
    Platform-->>Seller: Cancellation email
    Buyer->>Platform: Book same reservation
    Platform-->>Buyer: Confirmation email
    
    Seller->>Email: Forward cancellation
    Note over Email: Subject: "CANCEL ORDER_123"
    Email->>Relayer: Send to verify@relay.xyz
    Relayer->>Contract: executeCancellation(proof)
    
    Buyer->>Email: Forward booking confirmation
    Note over Email: Subject: "CLAIM ORDER_123"
    Email->>Relayer: Send to verify@relay.xyz
    Relayer->>Contract: claimReservation(proof)
    
    Contract->>Contract: Verify coordinated transfer
    Contract->>Contract: Settle funds
    Note over Contract: Seller gets 95% of price<br/>Buyer gets deposit back
```

## Security Model

### Economic Incentives

```mermaid
graph LR
    subgraph "Seller Incentives"
        A[Listing Fee: 2%] --> B[Commits seller]
        C[Escrow: 100%] --> D[Ensures delivery]
    end
    
    subgraph "Buyer Incentives"
        E[Deposit: 150%] --> F[Prevents griefing]
        G[Claim Window: 5min] --> H[Timely execution]
    end
    
    subgraph "Platform Revenue"
        I[Success Fee: 3%] --> J[Sustainable model]
        K[Failed transfers] --> L[Platform keeps fees]
    end
```

### Trust Assumptions

1. **Email Authenticity**: DKIM signatures cannot be forged
2. **Timing Precision**: 30-second window for coordinated cancellation
3. **Platform Behavior**: Reservation platforms process requests in order
4. **ZK Proof Validity**: Circom circuits correctly verify email contents

## Fee Structure

| Fee Type | Amount | Recipient | When Charged |
|----------|---------|-----------|--------------|
| Listing Fee | 2% of price | Platform | On listing creation |
| Success Fee | 3% of price | Platform | On successful transfer |
| Seller Escrow | 100% of price | Locked | During listing |
| Buyer Deposit | 150% of price | Locked | On order creation |

## Failure Scenarios

### 1. Seller Doesn't Cancel
- Buyer's deposit is returned
- Seller keeps reservation
- Platform keeps listing fee

### 2. Buyer Doesn't Claim
- Seller's escrow is returned
- Buyer loses deposit
- Platform keeps fees

### 3. Reservation Gets Sniped
- Both parties get refunds
- Platform keeps base fees
- Reputation system tracks reliability

## Privacy Features

- **Zero-Knowledge Proofs**: Only necessary reservation details are revealed
- **No PII Storage**: Personal information never touches the blockchain
- **Encrypted Communication**: Optional encrypted messaging between parties
- **Minimal On-chain Data**: Only hashes and proof results stored

## Conclusion

Relay creates a trustless marketplace for high-value restaurant reservations by combining:
- ZK Email proofs for ownership verification
- Economic incentives for good behavior
- Atomic coordination mechanisms
- Privacy-preserving architecture

This enables a liquid secondary market while protecting user privacy and preventing fraud. 