use crate::models::MockProof;
use rand::{thread_rng, Rng};

/// Generate a mock ZK proof for testing
/// In production, this would generate actual ZK proofs using circom/snarkjs
pub fn generate_mock_proof() -> MockProof {
    let mut rng = thread_rng();
    
    // Generate random proof data
    let proof_data: [u64; 8] = [
        rng.gen(),
        rng.gen(),
        rng.gen(),
        rng.gen(),
        rng.gen(),
        rng.gen(),
        rng.gen(),
        rng.gen(),
    ];
    
    // Generate mock public signals
    let public_signals = vec![
        format!("0x{:064x}", rng.gen::<u64>()),
        format!("0x{:064x}", rng.gen::<u64>()),
        format!("0x{:064x}", rng.gen::<u64>()),
    ];
    
    MockProof {
        proof_data,
        public_signals,
    }
}

/// Generate a deterministic mock proof for testing
/// Useful for creating reproducible test cases
pub fn generate_deterministic_mock_proof(seed: &str) -> MockProof {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    
    let mut hasher = DefaultHasher::new();
    seed.hash(&mut hasher);
    let hash = hasher.finish();
    
    // Generate deterministic proof data based on seed
    let proof_data: [u64; 8] = [
        hash,
        hash.wrapping_mul(2),
        hash.wrapping_mul(3),
        hash.wrapping_mul(5),
        hash.wrapping_mul(7),
        hash.wrapping_mul(11),
        hash.wrapping_mul(13),
        hash.wrapping_mul(17),
    ];
    
    // Generate deterministic public signals
    let public_signals = vec![
        format!("0x{:064x}", hash),
        format!("0x{:064x}", hash.wrapping_mul(19)),
        format!("0x{:064x}", hash.wrapping_mul(23)),
    ];
    
    MockProof {
        proof_data,
        public_signals,
    }
} 