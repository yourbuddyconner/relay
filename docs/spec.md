# Relay - Restaurant Reservation Trading Platform - Technical Implementation Spec

## Name and Vibe

Relay is perfect because:

✅ Abstract but intuitive (passing something valuable)
✅ Tech-forward without being nerdy
✅ Works globally across cultures
✅ Strong verb and noun meanings
✅ Easy to build brand story around "relaying experiences"
✅ Short, memorable, professional


## Architecture Overview

This platform enables secure trading of restaurant reservations by combining **ZK Email proofs** for reservation verification with **ZKP2P V2's escrow infrastructure** for trustless settlement. The system proves ownership of reservations without revealing personal data, then coordinates atomic transfers through timed escrow releases.

## Tech Stack

### Core Infrastructure
- **ZK Email SDK**: Email verification and proof generation
- **ZKP2P V2 Contracts**: Escrow and settlement infrastructure  
- **ZK Email Registry**: Custom patterns for reservation platforms
- **Circom/Noir**: Zero-knowledge proof circuits
- **Solidity**: Smart contract logic

### Integration Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  ZK Email       │    │  Custom         │    │  ZKP2P V2       │
│  Registry       │──→ │  Reservation    │──→ │  Escrow         │
│  Patterns       │    │  Marketplace    │    │  Contracts      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## ZK Email Patterns Implementation

### 1. Restaurant Reservation Pattern Registry

Create patterns in the [ZK Email Registry](https://registry.zk.email/) for each major platform:

#### OpenTable Confirmation Pattern
```json
{
  "pattern_name": "OpenTable Reservation Confirmation",
  "description": "Verify OpenTable reservation ownership and details",
  "sender_domain": "opentable.com",
  "dkim_selector": "auto-generated", 
  "fields_to_extract": [
    {
      "field_name": "ReservationNumber",
      "data_location": "body",
      "regex": "Reservation #([A-Z0-9]{8,12})",
      "prefix_regex": "Reservation #",
      "reveal_states": [[[15,1],[1,1]]]
    },
    {
      "field_name": "RestaurantName", 
      "data_location": "body",
      "regex": "at ([^\\n]+) on",
      "prefix_regex": "at ",
      "reveal_states": [[[25,1],[1,1]]]
    },
    {
      "field_name": "ReservationDateTime",
      "data_location": "body", 
      "regex": "on ([A-Za-z]+, [A-Za-z]+ \\d{1,2}, \\d{4}) at (\\d{1,2}:\\d{2} [AP]M)",
      "prefix_regex": "on ",
      "reveal_states": [[[45,1],[1,1]]]
    },
    {
      "field_name": "PartySize",
      "data_location": "body",
      "regex": "for (\\d+) guest",
      "prefix_regex": "for ", 
      "reveal_states": [[[8,1],[1,1]]]
    },
    {
      "field_name": "ConfirmationTime",
      "data_location": "header",
      "regex": "Date: (.+)",
      "prefix_regex": "Date: ",
      "reveal_states": [[[35,1],[1,1]]]
    }
  ],
  "max_email_body_length": 4096,
  "ignore_email_body": false
}
```

#### Resy Confirmation Pattern
```json
{
  "pattern_name": "Resy Reservation Confirmation", 
  "description": "Verify Resy reservation ownership and details",
  "sender_domain": "resy.com",
  "dkim_selector": "auto-generated",
  "fields_to_extract": [
    {
      "field_name": "ReservationCode",
      "data_location": "body",
      "regex": "Reservation: ([A-Z0-9-]{10,15})",
      "prefix_regex": "Reservation: ",
      "reveal_states": [[[20,1],[1,1]]]
    },
    {
      "field_name": "RestaurantName",
      "data_location": "body", 
      "regex": "You're confirmed at ([^\\n]+)",
      "prefix_regex": "You're confirmed at ",
      "reveal_states": [[[30,1],[1,1]]]
    },
    {
      "field_name": "DateTime",
      "data_location": "body",
      "regex": "(\\w+, \\w+ \\d{1,2}) at (\\d{1,2}:\\d{2}(?:am|pm|AM|PM))",
      "prefix_regex": "",
      "reveal_states": [[[40,1],[1,1]]]
    },
    {
      "field_name": "GuestCount", 
      "data_location": "body",
      "regex": "Party of (\\d+)",
      "prefix_regex": "Party of ",
      "reveal_states": [[[10,1],[1,1]]]
    }
  ],
  "max_email_body_length": 3072,
  "ignore_email_body": false  
}
```

### 2. Cancellation Proof Pattern
```json
{
  "pattern_name": "Restaurant Cancellation Confirmation",
  "description": "Verify successful reservation cancellation", 
  "sender_domain": ["opentable.com", "resy.com"],
  "fields_to_extract": [
    {
      "field_name": "CancelledReservationId",
      "data_location": "body",
      "regex": "(?:cancelled|canceled)[^#]*#([A-Z0-9-]{8,15})",
      "prefix_regex": "#",
      "reveal_states": [[[15,1],[1,1]]]
    },
    {
      "field_name": "CancellationTime", 
      "data_location": "header",
      "regex": "Date: (.+)",
      "prefix_regex": "Date: ",
      "reveal_states": [[[35,1],[1,1]]]
    },
    {
      "field_name": "OriginalRestaurant",
      "data_location": "body",
      "regex": "at ([^\\n,]+)",
      "prefix_regex": "at ",
      "reveal_states": [[[25,1],[1,1]]]
    }
  ]
}
```

### 3. New Booking Proof Pattern  
```json
{
  "pattern_name": "Restaurant Booking Success",
  "description": "Verify successful new reservation booking",
  "sender_domain": ["opentable.com", "resy.com"],
  "fields_to_extract": [
    {
      "field_name": "NewReservationId",
      "data_location": "body", 
      "regex": "(?:Confirmation|Reservation)[^#]*#([A-Z0-9-]{8,15})",
      "prefix_regex": "#",
      "reveal_states": [[[15,1],[1,1]]]
    },
    {
      "field_name": "BookingTime",
      "data_location": "header", 
      "regex": "Date: (.+)",
      "prefix_regex": "Date: ",
      "reveal_states": [[[35,1],[1,1]]]
    },
    {
      "field_name": "BookedRestaurant",
      "data_location": "body",
      "regex": "at ([^\\n,]+)",
      "prefix_regex": "at ",
      "reveal_states": [[[25,1],[1,1]]]
    }
  ]
}
```

## Smart Contract Architecture

### 1. Core Contracts (Built on ZKP2P V2)

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@zkp2p/escrow/contracts/EscrowManager.sol";
import "@zk-email/contracts/EmailVerifier.sol";

contract ReservationEscrow is EscrowManager {
    // Pattern verifier contracts for each restaurant platform
    mapping(string => address) public platformVerifiers;
    
    // Reservation state tracking
    mapping(bytes32 => ReservationListing) public listings;
    mapping(bytes32 => ReservationOrder) public orders;
    
    struct ReservationListing {
        address seller;
        bytes32 reservationHash; // Hash of reservation details
        uint256 price;
        uint256 escrowAmount;
        uint64 expiry;
        ListingStatus status;
        string platform; // "opentable" or "resy"
    }
    
    struct ReservationOrder {
        address buyer;
        bytes32 listingId;
        uint256 depositAmount;
        uint64 coordinationTime; // Exact cancellation timestamp
        uint64 claimDeadline;    // When buyer must claim
        OrderStatus status;
    }
    
    enum ListingStatus { Active, Matched, Cancelled, Completed }
    enum OrderStatus { Pending, Coordinating, Claiming, Settled, Failed }
    
    // Events
    event ReservationListed(bytes32 indexed listingId, address seller, uint256 price);
    event OrderCreated(bytes32 indexed orderId, bytes32 listingId, address buyer);
    event CoordinationBegun(bytes32 indexed orderId, uint64 coordinationTime);
    event ReservationCancelled(bytes32 indexed orderId, bytes32 proofHash);
    event ReservationClaimed(bytes32 indexed orderId, bytes32 proofHash);
    event SettlementCompleted(bytes32 indexed orderId, SettlementType outcome);
    
    enum SettlementType { Success, Sniped, Failed, Timeout }
}
```

### 2. Reservation Proof Verifier
```solidity
contract ReservationVerifier {
    using ZKEmailVerifier for bytes32;
    
    mapping(string => address) public patternVerifiers;
    
    struct ReservationProof {
        string platform;
        string reservationId;
        string restaurantName;
        uint64 reservationTime;
        uint8 partySize;
        bytes32 emailHash;
        uint256[8] proof; // ZK proof
    }
    
    struct CancellationProof {
        string originalReservationId;
        uint64 cancellationTime;
        string restaurantName;
        bytes32 emailHash;
        uint256[8] proof;
    }
    
    struct BookingProof {
        string newReservationId;
        uint64 bookingTime;
        string restaurantName;
        bytes32 emailHash;
        uint256[8] proof;
    }
    
    function verifyReservationOwnership(
        ReservationProof calldata proof
    ) external view returns (bool) {
        address verifier = patternVerifiers[proof.platform];
        require(verifier != address(0), "Platform not supported");
        
        return IEmailVerifier(verifier).verifyEmailProof(
            proof.emailHash,
            proof.proof
        );
    }
    
    function verifyCoordinatedTransfer(
        CancellationProof calldata cancelProof,
        BookingProof calldata bookingProof,
        uint64 maxTimeDiff
    ) external view returns (bool) {
        // Verify both proofs are valid
        require(verifyCancellation(cancelProof), "Invalid cancellation");
        require(verifyBooking(bookingProof), "Invalid booking");
        
        // Verify timing (booking must be within seconds of cancellation)
        require(
            bookingProof.bookingTime >= cancelProof.cancellationTime &&
            bookingProof.bookingTime <= cancelProof.cancellationTime + maxTimeDiff,
            "Invalid timing"
        );
        
        // Verify same restaurant
        require(
            keccak256(bytes(cancelProof.restaurantName)) == 
            keccak256(bytes(bookingProof.restaurantName)),
            "Restaurant mismatch"
        );
        
        return true;
    }
}
```

### 3. Marketplace Controller
```solidity
contract ReservationMarketplace {
    ReservationEscrow public escrow;
    ReservationVerifier public verifier;
    
    // Configuration
    uint256 public constant LISTING_FEE_BPS = 200; // 2%
    uint256 public constant SUCCESS_FEE_BPS = 300; // 3%
    uint256 public constant BUYER_DEPOSIT_MULTIPLIER = 150; // 150%
    uint256 public constant CLAIM_WINDOW = 5 minutes;
    uint256 public constant MAX_TRANSFER_DELAY = 30 seconds;
    
    function listReservation(
        ReservationProof calldata proof,
        uint256 price,
        uint64 expiry
    ) external payable {
        // Verify reservation ownership
        require(verifier.verifyReservationOwnership(proof), "Invalid proof");
        
        // Calculate listing fee
        uint256 listingFee = (price * LISTING_FEE_BPS) / 10000;
        require(msg.value >= listingFee, "Insufficient listing fee");
        
        // Create listing
        bytes32 listingId = keccak256(abi.encode(
            msg.sender,
            proof.reservationId,
            block.timestamp
        ));
        
        // Lock seller's escrow (full sale price)
        escrow.lockSellerFunds{value: price}(listingId, msg.sender, price);
        
        emit ReservationListed(listingId, msg.sender, price);
    }
    
    function createOrder(bytes32 listingId, uint64 coordinationTime) external payable {
        ReservationListing memory listing = escrow.listings(listingId);
        require(listing.status == ListingStatus.Active, "Listing not active");
        
        // Calculate required deposit
        uint256 depositAmount = (listing.price * BUYER_DEPOSIT_MULTIPLIER) / 100;
        require(msg.value >= depositAmount, "Insufficient deposit");
        
        bytes32 orderId = keccak256(abi.encode(
            listingId,
            msg.sender,
            block.timestamp
        ));
        
        // Lock buyer's deposit
        escrow.lockBuyerFunds{value: depositAmount}(orderId, msg.sender, depositAmount);
        
        // Set coordination timing
        escrow.setCoordinationTime(orderId, coordinationTime);
        
        emit OrderCreated(orderId, listingId, msg.sender);
    }
    
    function executeCancellation(
        bytes32 orderId,
        CancellationProof calldata proof
    ) external {
        // Verify seller owns this order
        ReservationOrder memory order = escrow.orders(orderId);
        require(msg.sender == order.seller, "Not seller");
        require(order.status == OrderStatus.Coordinating, "Wrong status");
        
        // Verify cancellation is at coordinated time
        require(
            block.timestamp >= order.coordinationTime &&
            block.timestamp <= order.coordinationTime + MAX_TRANSFER_DELAY,
            "Wrong timing"
        );
        
        // Verify cancellation proof
        require(verifier.verifyCancellation(proof), "Invalid proof");
        
        // Update state and start claim window
        escrow.markCancelled(orderId);
        
        emit ReservationCancelled(orderId, keccak256(abi.encode(proof)));
    }
    
    function claimReservation(
        bytes32 orderId,
        BookingProof calldata proof
    ) external {
        ReservationOrder memory order = escrow.orders(orderId);
        require(msg.sender == order.buyer, "Not buyer");
        require(order.status == OrderStatus.Claiming, "Wrong status");
        
        // Verify within claim window
        require(block.timestamp <= order.claimDeadline, "Claim window expired");
        
        // Verify booking proof
        require(verifier.verifyBooking(proof), "Invalid booking proof");
        
        // Verify this booking matches the cancelled reservation
        CancellationProof memory cancelProof = escrow.getCancellationProof(orderId);
        require(
            verifier.verifyCoordinatedTransfer(cancelProof, proof, MAX_TRANSFER_DELAY),
            "Transfer verification failed"
        );
        
        // Successful transfer - settle
        _settleSuccess(orderId);
        
        emit ReservationClaimed(orderId, keccak256(abi.encode(proof)));
    }
    
    function _settleSuccess(bytes32 orderId) internal {
        // Seller gets 95% of price
        // Buyer gets deposit back minus 3% success fee
        // Platform keeps fees
        escrow.settleSuccess(orderId);
        emit SettlementCompleted(orderId, SettlementType.Success);
    }
}
```

## Frontend Integration

### 1. ZK Email SDK Integration
```typescript
import zkeSDK, { Proof } from "@zk-email/sdk";

class ReservationProofGenerator {
  private sdk = zkeSDK();
  
  async generateReservationProof(emailFile: File, platform: string): Promise<Proof> {
    const blueprintId = this.getBlueprintId(platform);
    const blueprint = await this.sdk.getBlueprint(blueprintId);
    const prover = blueprint.createProver();
    
    const emailContent = await emailFile.text();
    return await prover.generateProof(emailContent);
  }
  
  async generateCancellationProof(emailFile: File): Promise<Proof> {
    const blueprint = await this.sdk.getBlueprint("restaurant-cancellation@v1");
    const prover = blueprint.createProver();
    
    const emailContent = await emailFile.text();
    return await prover.generateProof(emailContent);
  }
  
  async generateBookingProof(emailFile: File): Promise<Proof> {
    const blueprint = await this.sdk.getBlueprint("restaurant-booking@v1");
    const prover = blueprint.createProver();
    
    const emailContent = await emailFile.text();
    return await prover.generateProof(emailContent);
  }
  
  private getBlueprintId(platform: string): string {
    const blueprints = {
      'opentable': 'opentable-reservation@v1',
      'resy': 'resy-reservation@v1'
    };
    return blueprints[platform] || 'generic-reservation@v1';
  }
}
```

### 2. Marketplace Interface
```typescript
import { ReservationMarketplace__factory } from './contracts';

class ReservationTrader {
  private marketplace: ReservationMarketplace;
  private proofGen: ReservationProofGenerator;
  
  async listReservation(
    emailFile: File, 
    platform: string, 
    price: bigint,
    expiry: number
  ) {
    // Generate ownership proof
    const proof = await this.proofGen.generateReservationProof(emailFile, platform);
    
    // Calculate listing fee
    const listingFee = (price * 200n) / 10000n;
    
    // Submit listing
    const tx = await this.marketplace.listReservation(
      this.convertProofToContract(proof),
      price,
      expiry,
      { value: listingFee }
    );
    
    return await tx.wait();
  }
  
  async purchaseReservation(listingId: string, coordinationTime: number) {
    // Get listing details
    const listing = await this.marketplace.listings(listingId);
    
    // Calculate required deposit
    const depositAmount = (listing.price * 150n) / 100n;
    
    // Create order
    const tx = await this.marketplace.createOrder(
      listingId,
      coordinationTime,
      { value: depositAmount }
    );
    
    return await tx.wait();
  }
  
  async executeCancellation(orderId: string, cancellationEmail: File) {
    // Generate cancellation proof
    const proof = await this.proofGen.generateCancellationProof(cancellationEmail);
    
    // Submit cancellation
    const tx = await this.marketplace.executeCancellation(
      orderId,
      this.convertCancellationProof(proof)
    );
    
    return await tx.wait();
  }
  
  async claimReservation(orderId: string, bookingEmail: File) {
    // Generate booking proof  
    const proof = await this.proofGen.generateBookingProof(bookingEmail);
    
    // Submit claim
    const tx = await this.marketplace.claimReservation(
      orderId,
      this.convertBookingProof(proof)
    );
    
    return await tx.wait();
  }
}
```

## Implementation Roadmap

### Phase 1: Pattern Development (Weeks 1-4)
1. **Create ZK Email Patterns**: Deploy reservation confirmation patterns for OpenTable and Resy in the ZK Email Registry
2. **Pattern Testing**: Test proof generation with real email samples
3. **Circuit Optimization**: Optimize circuit constraints for faster proving

### Phase 2: Smart Contract Development (Weeks 3-8)  
1. **Fork ZKP2P V2**: Adapt escrow contracts for reservation trading
2. **Implement Verification**: Build reservation proof verification logic
3. **Add Coordination**: Implement timed coordination mechanism
4. **Contract Testing**: Full test suite for all scenarios

### Phase 3: Frontend Development (Weeks 6-12)
1. **ZK Email Integration**: Build proof generation interface
2. **Marketplace UI**: Trading interface for buyers and sellers  
3. **Coordination UX**: Real-time coordination flow
4. **Mobile Support**: Responsive design for mobile users

### Phase 4: Integration & Launch (Weeks 10-16)
1. **End-to-End Testing**: Full flow testing with real reservations
2. **Security Audit**: Smart contract security review
3. **Beta Launch**: Limited beta with trusted users
4. **Mainnet Deployment**: Production launch

## Security Considerations

### 1. Proof Verification
- **Email Authenticity**: DKIM signature verification prevents fake emails
- **Timing Constraints**: Strict timing windows prevent delayed attacks
- **Content Matching**: Restaurant/time matching prevents substitution attacks

### 2. Economic Security
- **Deposit Structure**: High buyer deposits discourage griefing
- **Graduated Penalties**: Reduced seller payouts for failed transfers
- **Insurance Pool**: Platform reserves cover edge cases

### 3. Privacy Protection
- **Zero-Knowledge Proofs**: Personal email content remains private
- **Minimal Disclosure**: Only necessary reservation details revealed
- **No PII Storage**: No personally identifiable information on-chain

## Revenue Model

### 1. Transaction Fees
- **Listing Fee**: 2% of listing price (prevents spam)
- **Success Fee**: 3% of sale price (main revenue)
- **Platform Fee**: 1% to protocol treasury

### 2. Value-Added Services
- **Priority Matching**: Fast-track for premium users
- **Insurance Premium**: Optional coverage for edge cases  
- **API Access**: Developer access to trading infrastructure

### 3. Network Effects
- **Liquidity Mining**: Token rewards for early adopters
- **Restaurant Partnerships**: Revenue sharing with restaurants
- **Data Insights**: Aggregated demand analytics

## Conclusion

This implementation leverages the mature infrastructure of ZK Email and ZKP2P V2 to create a secure, privacy-preserving marketplace for restaurant reservations. By using proven patterns and existing escrow mechanisms, we can launch quickly while maintaining security and user privacy.

The combination of ZK Email's pattern registry for easy integration with new platforms and ZKP2P's battle-tested escrow infrastructure provides a solid foundation for scaling to handle significant transaction volume while maintaining trustless operation.