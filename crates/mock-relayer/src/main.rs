use anyhow::Result;
use axum::{
    extract::Json,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use std::{
    collections::HashMap,
    net::SocketAddr,
    sync::{Arc, Mutex},
};
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod models;
mod handlers;
mod mock_proofs;

use models::*;
use handlers::*;

#[derive(Clone)]
pub struct AppState {
    // Store processed emails and their proofs
    proofs: Arc<Mutex<HashMap<String, EmailProof>>>,
    // Store email processing status
    processing_status: Arc<Mutex<HashMap<String, ProcessingStatus>>>,
}

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "mock_relayer=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    dotenv::dotenv().ok();

    // Initialize state
    let state = AppState {
        proofs: Arc::new(Mutex::new(HashMap::new())),
        processing_status: Arc::new(Mutex::new(HashMap::new())),
    };

    // Build the router
    let app = Router::new()
        // Health check
        .route("/health", get(health_check))
        // Email processing endpoints
        .route("/api/v1/email/submit", post(submit_email))
        .route("/api/v1/email/status/:id", get(get_email_status))
        .route("/api/v1/proof/:email_hash", get(get_proof))
        // Test data endpoints
        .route("/api/v1/test/generate-proof", post(generate_test_proof))
        .route("/api/v1/test/list-proofs", get(list_all_proofs))
        // WebSocket endpoint for real-time updates (simplified for now)
        .route("/ws", get(websocket_handler))
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        )
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let host = std::env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let addr: SocketAddr = format!("{}:3001", host).parse()?;
    info!("Mock relayer listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn health_check() -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "healthy",
        "service": "mock-relayer",
        "version": "0.1.0"
    }))
}

async fn websocket_handler() -> impl IntoResponse {
    // Simplified for now - just return not implemented
    StatusCode::NOT_IMPLEMENTED
} 