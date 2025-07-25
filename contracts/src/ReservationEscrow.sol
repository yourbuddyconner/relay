// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract ReservationEscrow {
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