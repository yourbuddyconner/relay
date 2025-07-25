// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "../ReservationVerifier.sol";

contract TestReservationVerifier is ReservationVerifier {
    // Add function to set pattern verifiers for testing
    function setPatternVerifier(string memory pattern, address verifier) external {
        patternVerifiers[pattern] = verifier;
    }
    
    // Batch set multiple verifiers
    function setPatternVerifiers(
        string[] memory patterns,
        address[] memory verifiers
    ) external {
        require(patterns.length == verifiers.length, "Length mismatch");
        
        for (uint i = 0; i < patterns.length; i++) {
            patternVerifiers[patterns[i]] = verifiers[i];
        }
    }
} 