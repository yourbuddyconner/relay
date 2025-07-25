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
    
    // Setter functions
    function createListing(
        bytes32 listingId,
        address seller,
        bytes32 reservationHash,
        uint256 price,
        uint256 escrowAmount,
        uint64 expiry,
        string memory platform
    ) external {
        listings[listingId] = ReservationListing({
            seller: seller,
            reservationHash: reservationHash,
            price: price,
            escrowAmount: escrowAmount,
            expiry: expiry,
            status: ListingStatus.Active,
            platform: platform
        });
    }
    
    function updateListingStatus(bytes32 listingId, ListingStatus status) external {
        listings[listingId].status = status;
    }
    
    function createOrder(
        bytes32 orderId,
        address buyer,
        bytes32 listingId,
        uint256 depositAmount,
        uint64 coordinationTime,
        uint64 claimDeadline
    ) external {
        orders[orderId] = ReservationOrder({
            buyer: buyer,
            listingId: listingId,
            depositAmount: depositAmount,
            coordinationTime: coordinationTime,
            claimDeadline: claimDeadline,
            status: OrderStatus.Coordinating
        });
    }
    
    function updateOrderStatus(bytes32 orderId, OrderStatus status) external {
        orders[orderId].status = status;
    }
} 