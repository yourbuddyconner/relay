// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "../ReservationVerifier.sol";

contract MockEmailVerifier is IEmailVerifier {
    // Store valid email hashes for testing
    mapping(bytes32 => bool) public validEmails;
    
    // Store reservation data for testing
    mapping(bytes32 => ReservationData) public reservationData;
    
    struct ReservationData {
        string platform;
        string reservationId;
        string restaurantName;
        uint64 timestamp;
        uint8 partySize;
        bool isValid;
    }
    
    // Owner can add valid email hashes
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    function verifyEmailProof(
        bytes32 emailHash,
        uint256[8] calldata /* proof */
    ) external view override returns (bool) {
        // For testing, just check if email hash is registered
        return validEmails[emailHash];
    }
    
    // Test helper functions
    function addValidEmail(
        bytes32 emailHash,
        string memory platform,
        string memory reservationId,
        string memory restaurantName,
        uint64 timestamp,
        uint8 partySize
    ) external onlyOwner {
        validEmails[emailHash] = true;
        reservationData[emailHash] = ReservationData({
            platform: platform,
            reservationId: reservationId,
            restaurantName: restaurantName,
            timestamp: timestamp,
            partySize: partySize,
            isValid: true
        });
    }
    
    function removeValidEmail(bytes32 emailHash) external onlyOwner {
        validEmails[emailHash] = false;
        delete reservationData[emailHash];
    }
    
    // Convenience function to generate test email hash
    function generateEmailHash(
        string memory platform,
        string memory reservationId,
        uint256 nonce
    ) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(platform, reservationId, nonce));
    }
} 