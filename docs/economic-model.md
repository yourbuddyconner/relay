# Economic Model & Game Theory

## Overview

Relay's economic model is designed to incentivize honest behavior while making dishonest actions unprofitable. The system uses a combination of deposits, fees, and time constraints to create a secure marketplace.

## Stakeholder Incentives

```mermaid
graph TB
    subgraph "Seller Incentives"
        A[Sell high-value reservations] --> B[Earn 95% of sale price]
        C[List only real reservations] --> D[Avoid losing escrow]
        E[Execute transfers on time] --> F[Maintain reputation]
    end
    
    subgraph "Buyer Incentives"
        G[Buy desired reservations] --> H[Get exclusive access]
        I[Complete transfers quickly] --> J[Recover full deposit]
        K[Avoid griefing sellers] --> L[Don't lose 150% deposit]
    end
    
    subgraph "Platform Incentives"
        M[Facilitate trades] --> N[Earn 5% total fees]
        O[Prevent fraud] --> P[Maintain market integrity]
        Q[Scale volume] --> R[Increase revenue]
    end
```

## Fee Structure Analysis

### Revenue Distribution

```mermaid
pie title "Revenue Distribution per Successful Trade"
    "Seller" : 95
    "Platform Listing Fee" : 2
    "Platform Success Fee" : 3
```

### Deposit Requirements

| Party | Deposit Amount | Purpose | Return Conditions |
|-------|----------------|---------|-------------------|
| Seller | 100% of price | Guarantee delivery | Successful transfer or buyer default |
| Buyer | 150% of price | Prevent griefing | Successful claim or seller default |

## Game Theory Analysis

### Normal Trade Scenario

```mermaid
graph LR
    subgraph "Expected Payoffs"
        A[Seller: +95% price] 
        B[Buyer: -100% price + reservation value]
        C[Platform: +5% price]
    end
    
    subgraph "Actions"
        D[Seller cancels on time]
        E[Buyer books on time]
        F[Both follow protocol]
    end
    
    F --> A
    F --> B
    F --> C
```

### Attack Scenarios

#### 1. Seller Doesn't Cancel (Scam Attempt)

```mermaid
sequenceDiagram
    participant Seller
    participant Buyer
    participant Platform
    participant Outcome
    
    Seller->>Platform: Lists fake/unavailable reservation
    Buyer->>Platform: Creates order (deposits 150%)
    Note over Seller: Doesn't cancel at coordination time
    Buyer->>Platform: Cannot claim (no booking possible)
    Platform->>Buyer: Return 150% deposit
    Platform->>Seller: Keep listing fee (lose 2%)
    Outcome->>Outcome: Seller loses money, gains nothing
```

**Result**: Seller loses 2% listing fee, gains nothing

#### 2. Buyer Griefing (Waste Seller's Time)

```mermaid
sequenceDiagram
    participant Buyer
    participant Seller
    participant Platform
    participant Outcome
    
    Buyer->>Platform: Creates order (deposits 150%)
    Seller->>Platform: Cancels reservation on time
    Note over Buyer: Doesn't book new reservation
    Platform->>Seller: Return escrow + compensation
    Platform->>Platform: Keep buyer's 150% deposit
    Outcome->>Outcome: Buyer loses 150% of price
```

**Result**: Buyer loses 150% deposit, seller compensated

#### 3. Reservation Sniping

```mermaid
graph TB
    A[Seller cancels] --> B[Third party books instantly]
    B --> C[Buyer cannot book]
    C --> D{Resolution}
    D --> E[Partial refunds]
    D --> F[Reputation impact]
    D --> G[Time window adjustment]
    
    style B fill:#f99,stroke:#333,stroke-width:2px
    style E fill:#ff9,stroke:#333,stroke-width:2px
```

**Mitigation**: 
- 30-second coordination window
- Reputation tracking
- Potential insurance fund

## Economic Sustainability

### Platform Revenue Model

```mermaid
graph TB
    subgraph "Revenue Streams"
        A[Listing Fees: 2%] --> E[Treasury]
        B[Success Fees: 3%] --> E
        C[Failed Trade Fees] --> E
        D[Future: Premium Features] --> E
    end
    
    subgraph "Expenses"
        E --> F[Gas Subsidies]
        E --> G[Relayer Infrastructure]
        E --> H[Development]
        E --> I[Insurance Fund]
    end
```

### Volume Projections

| Metric | Conservative | Base Case | Optimistic |
|--------|--------------|-----------|------------|
| Monthly Trades | 100 | 500 | 2,000 |
| Average Price | $200 | $300 | $500 |
| Monthly GMV | $20,000 | $150,000 | $1,000,000 |
| Platform Revenue | $1,000 | $7,500 | $50,000 |

## Market Dynamics

### Price Discovery

```mermaid
graph LR
    A[Restaurant Popularity] --> B[Reservation Demand]
    B --> C[Market Price]
    D[Time Until Reservation] --> C
    E[Day of Week] --> C
    F[Special Events] --> C
    G[Party Size] --> C
    
    C --> H[Listing Price]
    I[Competition] --> H
    J[Seller Urgency] --> H
```

### Liquidity Incentives

1. **Early Adopter Rewards**
   - Reduced fees for first 1,000 trades
   - Reputation bonuses

2. **Market Maker Program**
   - Lower fees for high-volume traders
   - API access for automated trading

3. **Restaurant Partnerships**
   - Revenue sharing with restaurants
   - Official integration possibilities

## Risk Management

### Economic Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low liquidity | High spreads | Incentive programs |
| Price manipulation | Market distortion | Volume limits |
| Sybil attacks | Fake listings | Stake requirements |
| Gas price spikes | Reduced activity | L2 deployment |

### Insurance Fund

```mermaid
pie title "Insurance Fund Allocation"
    "Sniping compensation" : 40
    "Technical failures" : 30
    "Dispute resolution" : 20
    "Emergency reserve" : 10
```

## Behavioral Economics

### Psychological Factors

1. **Loss Aversion**: 150% deposit makes buyers careful
2. **Commitment Device**: Listing fee commits sellers
3. **Time Pressure**: 5-minute claim window drives action
4. **Reputation Value**: Long-term benefits outweigh short-term gains

### Network Effects

```mermaid
graph TB
    A[More Sellers] --> B[Better Selection]
    B --> C[More Buyers]
    C --> D[Higher Prices]
    D --> A
    
    E[Increased Volume] --> F[Lower Spreads]
    F --> G[Better UX]
    G --> E
    
    style A fill:#9f9,stroke:#333,stroke-width:2px
    style C fill:#9f9,stroke:#333,stroke-width:2px
    style E fill:#99f,stroke:#333,stroke-width:2px
```

## Future Economic Features

### 1. Dynamic Pricing
- Algorithmic fee adjustment based on success rates
- Time-based pricing (peak hours = higher fees)
- Volume discounts

### 2. Staking Mechanism
- Stake tokens for reduced fees
- Stake to become preferred relayer
- Governance participation

### 3. Secondary Markets
- Options on future reservations
- Reservation futures contracts
- Bundled reservation packages

## Conclusion

The Relay economic model creates a sustainable marketplace by:
- Aligning incentives for honest behavior
- Making dishonest actions unprofitable
- Generating platform revenue for growth
- Building network effects for liquidity

The game theory ensures that cooperation is the dominant strategy for all participants. 