// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

interface IEmailVerifier {
    function verifyEmailProof(bytes32 emailHash, uint256[8] calldata proof) external view returns (bool);
}

contract ReservationVerifier {
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
    
    function verifyCancellation(
        CancellationProof calldata proof
    ) public view returns (bool) {
        address verifier = patternVerifiers["cancellation"];
        require(verifier != address(0), "Cancellation verifier not set");
        
        return IEmailVerifier(verifier).verifyEmailProof(
            proof.emailHash,
            proof.proof
        );
    }
    
    function verifyBooking(
        BookingProof calldata proof
    ) public view returns (bool) {
        address verifier = patternVerifiers["booking"];
        require(verifier != address(0), "Booking verifier not set");
        
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