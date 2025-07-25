use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use chrono::Utc;
use tracing::{info, warn};
use uuid::Uuid;

use crate::{
    mock_proofs::generate_mock_proof,
    models::*,
    AppState,
};

// Submit an email for processing
pub async fn submit_email(
    State(state): State<AppState>,
    Json(submission): Json<EmailSubmission>,
) -> impl IntoResponse {
    info!("Received email submission from: {}", submission.from);
    
    // Parse the subject for command
    let command = parse_email_command(&submission.subject);
    
    if command.is_none() {
        return (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse {
                error: "Invalid command in subject".to_string(),
                details: Some("Subject must start with LIST, CANCEL, or CLAIM".to_string()),
            }),
        ).into_response();
    }
    
    let command = command.unwrap();
    let id = Uuid::new_v4();
    
    // Create processing status
    let status = ProcessingStatus {
        id,
        status: Status::Processing,
        created_at: Utc::now(),
        updated_at: Utc::now(),
        email_hash: None,
        error: None,
    };
    
    // Store status
    state.processing_status.lock().unwrap().insert(id.to_string(), status.clone());
    
    // Simulate async processing
    let state_clone = state.clone();
    let submission_clone = submission.clone();
    tokio::spawn(async move {
        // Simulate processing delay
        tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
        
        // Generate mock proof based on command
        match process_email_command(state_clone, id, submission_clone, command).await {
            Ok(email_hash) => {
                info!("Successfully processed email: {}", email_hash);
            }
            Err(e) => {
                warn!("Failed to process email: {}", e);
            }
        }
    });
    
    (
        StatusCode::ACCEPTED,
        Json(SubmitEmailResponse {
            id,
            status: Status::Processing,
            message: "Email submitted for processing".to_string(),
        }),
    ).into_response()
}

// Get processing status
pub async fn get_email_status(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let statuses = state.processing_status.lock().unwrap();
    
    match statuses.get(&id) {
        Some(status) => (StatusCode::OK, Json(status.clone())).into_response(),
        None => (
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: "Status not found".to_string(),
                details: None,
            }),
        ).into_response(),
    }
}

// Get proof by email hash
pub async fn get_proof(
    State(state): State<AppState>,
    Path(email_hash): Path<String>,
) -> impl IntoResponse {
    let proofs = state.proofs.lock().unwrap();
    
    match proofs.get(&email_hash) {
        Some(proof) => {
            let response = ProofResponse {
                email_hash: proof.email_hash.clone(),
                proof: proof.proof.clone(),
                extracted_data: proof.extracted_data.clone(),
                ready_for_submission: true,
            };
            (StatusCode::OK, Json(response)).into_response()
        }
        None => (
            StatusCode::NOT_FOUND,
            Json(ErrorResponse {
                error: "Proof not found".to_string(),
                details: None,
            }),
        ).into_response(),
    }
}

// Generate test proof
pub async fn generate_test_proof(
    State(state): State<AppState>,
    Json(request): Json<GenerateTestProofRequest>,
) -> impl IntoResponse {
    info!("Generating test proof for: {:?}", request);
    
    let email_hash = format!("0x{}", hex::encode(
        ethers::utils::keccak256(format!("{}-{}-test", request.platform, request.restaurant_name))
    ));
    
    let extracted_data = match request.reservation_type {
        ReservationType::Confirmation => {
            ExtractedData::Reservation(ReservationData {
                platform: request.platform.clone(),
                reservation_id: format!("TEST-{}", Uuid::new_v4().to_string()[..8].to_uppercase()),
                restaurant_name: request.restaurant_name.clone(),
                reservation_time: (Utc::now().timestamp() + 7 * 24 * 3600) as u64,
                party_size: request.party_size.unwrap_or(2),
            })
        }
        ReservationType::Cancellation => {
            ExtractedData::Cancellation(CancellationData {
                original_reservation_id: format!("TEST-{}", Uuid::new_v4().to_string()[..8].to_uppercase()),
                cancellation_time: Utc::now().timestamp() as u64,
                restaurant_name: request.restaurant_name.clone(),
            })
        }
        ReservationType::NewBooking => {
            ExtractedData::Booking(BookingData {
                new_reservation_id: format!("TEST-{}", Uuid::new_v4().to_string()[..8].to_uppercase()),
                booking_time: Utc::now().timestamp() as u64,
                restaurant_name: request.restaurant_name.clone(),
            })
        }
    };
    
    let proof = EmailProof {
        email_hash: email_hash.clone(),
        proof: generate_mock_proof(),
        extracted_data: extracted_data.clone(),
        created_at: Utc::now(),
    };
    
    // Store the proof
    state.proofs.lock().unwrap().insert(email_hash.clone(), proof.clone());
    
    let response = ProofResponse {
        email_hash,
        proof: proof.proof,
        extracted_data,
        ready_for_submission: true,
    };
    
    (StatusCode::CREATED, Json(response))
}

// List all proofs (for testing)
pub async fn list_all_proofs(State(state): State<AppState>) -> impl IntoResponse {
    let proofs = state.proofs.lock().unwrap();
    let all_proofs: Vec<_> = proofs.values().cloned().collect();
    
    Json(serde_json::json!({
        "count": all_proofs.len(),
        "proofs": all_proofs
    }))
}

// Helper functions
fn parse_email_command(subject: &str) -> Option<EmailCommand> {
    let parts: Vec<&str> = subject.trim().split_whitespace().collect();
    
    if parts.is_empty() {
        return None;
    }
    
    let command_type = match parts[0].to_uppercase().as_str() {
        "LIST" => CommandType::List,
        "CANCEL" => CommandType::Cancel,
        "CLAIM" => CommandType::Claim,
        _ => return None,
    };
    
    Some(EmailCommand {
        command: command_type,
        params: parts[1..].iter().map(|s| s.to_string()).collect(),
    })
}

async fn process_email_command(
    state: AppState,
    id: Uuid,
    submission: EmailSubmission,
    command: EmailCommand,
) -> Result<String, anyhow::Error> {
    // Generate email hash
    let email_content = format!("{}{}{}", submission.from, submission.subject, submission.body);
    let email_hash = format!("0x{}", hex::encode(ethers::utils::keccak256(&email_content)));
    
    // Extract platform from sender
    let platform = extract_platform(&submission.from)?;
    
    // Generate appropriate proof based on command
    let extracted_data = match command.command {
        CommandType::List => {
            // Extract reservation details from email body
            ExtractedData::Reservation(ReservationData {
                platform: platform.clone(),
                reservation_id: format!("RES-{}", Uuid::new_v4().to_string()[..8].to_uppercase()),
                restaurant_name: extract_restaurant_name(&submission.body).unwrap_or("Test Restaurant".to_string()),
                reservation_time: (Utc::now().timestamp() + 7 * 24 * 3600) as u64,
                party_size: 2,
            })
        }
        CommandType::Cancel => {
            ExtractedData::Cancellation(CancellationData {
                original_reservation_id: command.params.get(0).cloned().unwrap_or_else(|| {
                    format!("RES-{}", Uuid::new_v4().to_string()[..8].to_uppercase())
                }),
                cancellation_time: Utc::now().timestamp() as u64,
                restaurant_name: extract_restaurant_name(&submission.body).unwrap_or("Test Restaurant".to_string()),
            })
        }
        CommandType::Claim => {
            ExtractedData::Booking(BookingData {
                new_reservation_id: format!("RES-{}", Uuid::new_v4().to_string()[..8].to_uppercase()),
                booking_time: Utc::now().timestamp() as u64,
                restaurant_name: extract_restaurant_name(&submission.body).unwrap_or("Test Restaurant".to_string()),
            })
        }
    };
    
    // Create and store proof
    let proof = EmailProof {
        email_hash: email_hash.clone(),
        proof: generate_mock_proof(),
        extracted_data,
        created_at: Utc::now(),
    };
    
    state.proofs.lock().unwrap().insert(email_hash.clone(), proof);
    
    // Update processing status
    let mut statuses = state.processing_status.lock().unwrap();
    if let Some(status) = statuses.get_mut(&id.to_string()) {
        status.status = Status::Completed;
        status.updated_at = Utc::now();
        status.email_hash = Some(email_hash.clone());
    }
    
    Ok(email_hash)
}

fn extract_platform(from: &str) -> Result<String, anyhow::Error> {
    if from.contains("opentable.com") {
        Ok("opentable".to_string())
    } else if from.contains("resy.com") {
        Ok("resy".to_string())
    } else {
        Ok("unknown".to_string())
    }
}

fn extract_restaurant_name(body: &str) -> Option<String> {
    // Simple extraction - in production this would use regex patterns
    if body.contains("at ") {
        body.split("at ")
            .nth(1)
            .and_then(|s| s.split('\n').next())
            .map(|s| s.trim().to_string())
    } else {
        None
    }
} 