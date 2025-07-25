// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./ReservationEscrow.sol";
import "./ReservationVerifier.sol";

contract ReservationMarketplace {
    ReservationEscrow public escrow;
    ReservationVerifier public verifier;
    
    // Configuration
    uint256 public constant LISTING_FEE_BPS = 200; // 2%
    uint256 public constant SUCCESS_FEE_BPS = 300; // 3%
    uint256 public constant BUYER_DEPOSIT_MULTIPLIER = 150; // 150%
    uint256 public constant CLAIM_WINDOW = 5 minutes;
    uint256 public constant MAX_TRANSFER_DELAY = 30 seconds;
    
    // Storage for cancellation proofs
    mapping(bytes32 => ReservationVerifier.CancellationProof) private cancellationProofs;
    
    constructor(address _escrow, address _verifier) {
        escrow = ReservationEscrow(_escrow);
        verifier = ReservationVerifier(_verifier);
    }
    
    function listReservation(
        ReservationVerifier.ReservationProof calldata proof,
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
        
        // Store listing details
        escrow.listings(listingId) = ReservationEscrow.ReservationListing({
            seller: msg.sender,
            reservationHash: keccak256(abi.encode(proof)),
            price: price,
            escrowAmount: price,
            expiry: expiry,
            status: ReservationEscrow.ListingStatus.Active,
            platform: proof.platform
        });
        
        emit ReservationEscrow.ReservationListed(listingId, msg.sender, price);
    }
    
    function createOrder(bytes32 listingId, uint64 coordinationTime) external payable {
        ReservationEscrow.ReservationListing memory listing = escrow.listings(listingId);
        require(listing.status == ReservationEscrow.ListingStatus.Active, "Listing not active");
        
        // Calculate required deposit
        uint256 depositAmount = (listing.price * BUYER_DEPOSIT_MULTIPLIER) / 100;
        require(msg.value >= depositAmount, "Insufficient deposit");
        
        bytes32 orderId = keccak256(abi.encode(
            listingId,
            msg.sender,
            block.timestamp
        ));
        
        // Store order details
        escrow.orders(orderId) = ReservationEscrow.ReservationOrder({
            buyer: msg.sender,
            listingId: listingId,
            depositAmount: depositAmount,
            coordinationTime: coordinationTime,
            claimDeadline: coordinationTime + uint64(CLAIM_WINDOW),
            status: ReservationEscrow.OrderStatus.Coordinating
        });
        
        // Update listing status
        escrow.listings(listingId).status = ReservationEscrow.ListingStatus.Matched;
        
        emit ReservationEscrow.OrderCreated(orderId, listingId, msg.sender);
        emit ReservationEscrow.CoordinationBegun(orderId, coordinationTime);
    }
    
    function executeCancellation(
        bytes32 orderId,
        ReservationVerifier.CancellationProof calldata proof
    ) external {
        ReservationEscrow.ReservationOrder memory order = escrow.orders(orderId);
        ReservationEscrow.ReservationListing memory listing = escrow.listings(order.listingId);
        
        // Verify seller owns this order
        require(msg.sender == listing.seller, "Not seller");
        require(order.status == ReservationEscrow.OrderStatus.Coordinating, "Wrong status");
        
        // Verify cancellation is at coordinated time
        require(
            block.timestamp >= order.coordinationTime &&
            block.timestamp <= order.coordinationTime + MAX_TRANSFER_DELAY,
            "Wrong timing"
        );
        
        // Verify cancellation proof
        require(verifier.verifyCancellation(proof), "Invalid proof");
        
        // Store cancellation proof for later verification
        cancellationProofs[orderId] = proof;
        
        // Update state and start claim window
        escrow.orders(orderId).status = ReservationEscrow.OrderStatus.Claiming;
        
        emit ReservationEscrow.ReservationCancelled(orderId, keccak256(abi.encode(proof)));
    }
    
    function claimReservation(
        bytes32 orderId,
        ReservationVerifier.BookingProof calldata proof
    ) external {
        ReservationEscrow.ReservationOrder memory order = escrow.orders(orderId);
        require(msg.sender == order.buyer, "Not buyer");
        require(order.status == ReservationEscrow.OrderStatus.Claiming, "Wrong status");
        
        // Verify within claim window
        require(block.timestamp <= order.claimDeadline, "Claim window expired");
        
        // Verify booking proof
        require(verifier.verifyBooking(proof), "Invalid booking proof");
        
        // Verify this booking matches the cancelled reservation
        ReservationVerifier.CancellationProof memory cancelProof = cancellationProofs[orderId];
        require(
            verifier.verifyCoordinatedTransfer(cancelProof, proof, MAX_TRANSFER_DELAY),
            "Transfer verification failed"
        );
        
        // Successful transfer - settle
        _settleSuccess(orderId);
        
        emit ReservationEscrow.ReservationClaimed(orderId, keccak256(abi.encode(proof)));
    }
    
    function _settleSuccess(bytes32 orderId) internal {
        ReservationEscrow.ReservationOrder memory order = escrow.orders(orderId);
        ReservationEscrow.ReservationListing memory listing = escrow.listings(order.listingId);
        
        // Update statuses
        escrow.orders(orderId).status = ReservationEscrow.OrderStatus.Settled;
        escrow.listings(order.listingId).status = ReservationEscrow.ListingStatus.Completed;
        
        // Calculate fees
        uint256 successFee = (listing.price * SUCCESS_FEE_BPS) / 10000;
        uint256 sellerPayout = listing.price - successFee;
        
        // Transfer funds
        // Seller gets 95% of price (after 3% success fee and 2% listing fee already paid)
        payable(listing.seller).transfer(sellerPayout);
        
        // Buyer gets full deposit back
        payable(order.buyer).transfer(order.depositAmount);
        
        // Platform keeps the fees
        
        emit ReservationEscrow.SettlementCompleted(orderId, ReservationEscrow.SettlementType.Success);
    }
} 