// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../src/ReservationMarketplace.sol";
import "../src/ReservationEscrow.sol";
import "../src/ReservationVerifier.sol";
import "../src/mocks/MockEmailVerifier.sol";
import "../src/mocks/TestReservationVerifier.sol";

contract DeployLocal is Script {
    function run() external {
        // Default anvil private key #0
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy core contracts
        ReservationEscrow escrow = new ReservationEscrow();
        console.log("ReservationEscrow deployed to:", address(escrow));
        
        TestReservationVerifier verifier = new TestReservationVerifier();
        console.log("TestReservationVerifier deployed to:", address(verifier));
        
        ReservationMarketplace marketplace = new ReservationMarketplace(
            address(escrow),
            address(verifier)
        );
        console.log("ReservationMarketplace deployed to:", address(marketplace));
        
        // Deploy mock verifiers
        MockEmailVerifier mockVerifierOpenTable = new MockEmailVerifier();
        console.log("MockEmailVerifier (OpenTable) deployed to:", address(mockVerifierOpenTable));
        
        MockEmailVerifier mockVerifierResy = new MockEmailVerifier();
        console.log("MockEmailVerifier (Resy) deployed to:", address(mockVerifierResy));
        
        MockEmailVerifier mockVerifierCancellation = new MockEmailVerifier();
        console.log("MockEmailVerifier (Cancellation) deployed to:", address(mockVerifierCancellation));
        
        MockEmailVerifier mockVerifierBooking = new MockEmailVerifier();
        console.log("MockEmailVerifier (Booking) deployed to:", address(mockVerifierBooking));
        
        // Register pattern verifiers
        verifier.setPatternVerifier("opentable", address(mockVerifierOpenTable));
        verifier.setPatternVerifier("resy", address(mockVerifierResy));
        verifier.setPatternVerifier("cancellation", address(mockVerifierCancellation));
        verifier.setPatternVerifier("booking", address(mockVerifierBooking));
        
        console.log("\nPattern verifiers registered:");
        console.log("- opentable:", address(mockVerifierOpenTable));
        console.log("- resy:", address(mockVerifierResy));
        console.log("- cancellation:", address(mockVerifierCancellation));
        console.log("- booking:", address(mockVerifierBooking));
        
        // Add some test data
        bytes32 testEmailHash = keccak256("test@example.com");
        mockVerifierOpenTable.addValidEmail(
            testEmailHash,
            "opentable",
            "TEST-12345",
            "Test Restaurant",
            uint64(block.timestamp + 7 days),
            4
        );
        
        console.log("\nTest data added:");
        console.logBytes32(testEmailHash);
        console.log("- Platform: opentable");
        console.log("- Reservation ID: TEST-12345");
        
        // Write deployment addresses to file
        string memory deploymentData = string(
            abi.encodePacked(
                '{\n',
                '  "ReservationEscrow": "', vm.toString(address(escrow)), '",\n',
                '  "ReservationVerifier": "', vm.toString(address(verifier)), '",\n',
                '  "ReservationMarketplace": "', vm.toString(address(marketplace)), '",\n',
                '  "MockEmailVerifierOpenTable": "', vm.toString(address(mockVerifierOpenTable)), '",\n',
                '  "MockEmailVerifierResy": "', vm.toString(address(mockVerifierResy)), '",\n',
                '  "MockEmailVerifierCancellation": "', vm.toString(address(mockVerifierCancellation)), '",\n',
                '  "MockEmailVerifierBooking": "', vm.toString(address(mockVerifierBooking)), '"\n',
                '}'
            )
        );
        
        // Try to write deployment data
        try {
            vm.writeFile("deployments/local.json", deploymentData);
            console.log("\nDeployment addresses written to deployments/local.json");
        } catch {
            console.log("\nCould not write deployment file. Contract addresses:");
            console.log(deploymentData);
        }
        
        vm.stopBroadcast();
    }
} 