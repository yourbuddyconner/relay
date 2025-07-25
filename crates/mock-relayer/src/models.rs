use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmailSubmission {
    pub from: String,
    pub to: String,
    pub subject: String,
    pub body: String,
    pub headers: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmailCommand {
    pub command: CommandType,
    pub params: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum CommandType {
    List,
    Cancel,
    Claim,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessingStatus {
    pub id: Uuid,
    pub status: Status,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub email_hash: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Status {
    Pending,
    Processing,
    Completed,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmailProof {
    pub email_hash: String,
    pub proof: MockProof,
    pub extracted_data: ExtractedData,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MockProof {
    // Mock ZK proof - in production this would be actual proof data
    pub proof_data: [u64; 8],
    pub public_signals: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ExtractedData {
    #[serde(rename = "reservation")]
    Reservation(ReservationData),
    #[serde(rename = "cancellation")]
    Cancellation(CancellationData),
    #[serde(rename = "booking")]
    Booking(BookingData),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReservationData {
    pub platform: String,
    pub reservation_id: String,
    pub restaurant_name: String,
    pub reservation_time: u64,
    pub party_size: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CancellationData {
    pub original_reservation_id: String,
    pub cancellation_time: u64,
    pub restaurant_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BookingData {
    pub new_reservation_id: String,
    pub booking_time: u64,
    pub restaurant_name: String,
}

// API Response types
#[derive(Debug, Serialize, Deserialize)]
pub struct SubmitEmailResponse {
    pub id: Uuid,
    pub status: Status,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProofResponse {
    pub email_hash: String,
    pub proof: MockProof,
    pub extracted_data: ExtractedData,
    pub ready_for_submission: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub error: String,
    pub details: Option<String>,
}

// Test data generation
#[derive(Debug, Deserialize)]
pub struct GenerateTestProofRequest {
    pub platform: String,
    pub restaurant_name: String,
    pub party_size: Option<u8>,
    pub reservation_type: ReservationType,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum ReservationType {
    Confirmation,
    Cancellation,
    NewBooking,
} 