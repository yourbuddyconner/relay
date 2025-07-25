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
    uint64 public constant CLAIM_WINDOW = 5 minutes;
    uint64 public constant MAX_TRANSFER_DELAY = 30 seconds;
    
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
        escrow.createListing(
            listingId,
            msg.sender,
            keccak256(abi.encode(proof)),
            price,
            price,
            expiry,
            proof.platform
        );
        
        emit ReservationEscrow.ReservationListed(listingId, msg.sender, price);
    }
    
    function createOrder(bytes32 listingId, uint64 coordinationTime) external payable {
        (
            address seller,
            bytes32 reservationHash,
            uint256 price,
            uint256 escrowAmount,
            uint64 expiry,
            ReservationEscrow.ListingStatus status,
            string memory platform
        ) = escrow.listings(listingId);
        
        require(status == ReservationEscrow.ListingStatus.Active, "Listing not active");
        
        // Calculate required deposit
        uint256 depositAmount = (price * BUYER_DEPOSIT_MULTIPLIER) / 100;
        require(msg.value >= depositAmount, "Insufficient deposit");
        
        bytes32 orderId = keccak256(abi.encode(
            listingId,
            msg.sender,
            block.timestamp
        ));
        
        // Store order details
        escrow.createOrder(
            orderId,
            msg.sender,
            listingId,
            depositAmount,
            coordinationTime,
            coordinationTime + uint64(CLAIM_WINDOW)
        );
        
        // Update listing status
        escrow.updateListingStatus(listingId, ReservationEscrow.ListingStatus.Matched);
        
        emit ReservationEscrow.OrderCreated(orderId, listingId, msg.sender);
        emit ReservationEscrow.CoordinationBegun(orderId, coordinationTime);
    }
    
    function executeCancellation(
        bytes32 orderId,
        ReservationVerifier.CancellationProof calldata proof
    ) external {
        (
            address buyer,
            bytes32 listingId,
            uint256 depositAmount,
            uint64 coordinationTime,
            uint64 claimDeadline,
            ReservationEscrow.OrderStatus status
        ) = escrow.orders(orderId);
        
        // Get listing details to verify seller
        (address seller,,,,,,) = escrow.listings(listingId);
        
        // Verify seller owns this order
        require(msg.sender == seller, "Not seller");
        require(status == ReservationEscrow.OrderStatus.Coordinating, "Wrong status");
        
        // Verify cancellation is at coordinated time
        require(
            block.timestamp >= coordinationTime &&
            block.timestamp <= coordinationTime + MAX_TRANSFER_DELAY,
            "Wrong timing"
        );
        
        // Verify cancellation proof
        require(verifier.verifyCancellation(proof), "Invalid proof");
        
        // Store cancellation proof for later verification
        cancellationProofs[orderId] = proof;
        
        // Update state and start claim window
        escrow.updateOrderStatus(orderId, ReservationEscrow.OrderStatus.Claiming);
        
        emit ReservationEscrow.ReservationCancelled(orderId, keccak256(abi.encode(proof)));
    }
    
    function claimReservation(
        bytes32 orderId,
        ReservationVerifier.BookingProof calldata proof
    ) external {
        (
            address buyer,
            bytes32 listingId,
            uint256 depositAmount,
            uint64 coordinationTime,
            uint64 claimDeadline,
            ReservationEscrow.OrderStatus status
        ) = escrow.orders(orderId);
        
        require(msg.sender == buyer, "Not buyer");
        require(status == ReservationEscrow.OrderStatus.Claiming, "Wrong status");
        
        // Verify within claim window
        require(block.timestamp <= claimDeadline, "Claim window expired");
        
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
        (
            address buyer,
            bytes32 listingId,
            uint256 depositAmount,
            uint64 coordinationTime,
            uint64 claimDeadline,
            ReservationEscrow.OrderStatus status
        ) = escrow.orders(orderId);
        
        (
            address seller,
            bytes32 reservationHash,
            uint256 price,
            uint256 escrowAmount,
            uint64 expiry,
            ReservationEscrow.ListingStatus listingStatus,
            string memory platform
        ) = escrow.listings(listingId);
        
        // Update statuses
        escrow.updateOrderStatus(orderId, ReservationEscrow.OrderStatus.Settled);
        escrow.updateListingStatus(listingId, ReservationEscrow.ListingStatus.Completed);
        
        // Calculate fees
        uint256 successFee = (price * SUCCESS_FEE_BPS) / 10000;
        uint256 sellerPayout = price - successFee;
        
        // Transfer funds
        // Seller gets 95% of price (after 3% success fee and 2% listing fee already paid)
        payable(seller).transfer(sellerPayout);
        
        // Buyer gets full deposit back
        payable(buyer).transfer(depositAmount);
        
        // Platform keeps the fees
        
        emit ReservationEscrow.SettlementCompleted(orderId, ReservationEscrow.SettlementType.Success);
    }
} 