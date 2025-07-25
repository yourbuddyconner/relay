# Mock Email Relayer

A mock email relayer service for local development of the Relay Protocol. This service simulates the ZK email proof generation without requiring actual email infrastructure or ZK circuits.

## Features

- REST API for email submission and proof retrieval
- Instant mock proof generation for testing
- Support for all email commands (LIST, CANCEL, CLAIM)
- Test data generation endpoints
- Status tracking for email processing

## API Endpoints

### Email Processing
- `POST /api/v1/email/submit` - Submit an email for processing
- `GET /api/v1/email/status/:id` - Check processing status
- `GET /api/v1/proof/:email_hash` - Get generated proof

### Test Helpers
- `POST /api/v1/test/generate-proof` - Generate test proof directly
- `GET /api/v1/test/list-proofs` - List all stored proofs

## Running the Service

```bash
# From the crates/mock-relayer directory
cargo run

# Or from the project root
just mock-relayer
```

The service will start on `http://localhost:3001`

## Email Format

Emails should be submitted with the following structure:

```json
{
  "from": "confirmation@opentable.com",
  "to": "user@example.com",
  "subject": "LIST 100",
  "body": "Your reservation at The French Laundry...",
  "headers": {}
}
```

### Supported Commands
- `LIST [price]` - List a reservation for sale
- `CANCEL [reservation_id]` - Cancel a reservation
- `CLAIM` - Claim a new booking

## Example Usage

```bash
# Submit an email
curl -X POST http://localhost:3001/api/v1/email/submit \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@opentable.com",
    "to": "user@example.com",
    "subject": "LIST 150",
    "body": "Reservation confirmed at Noma for 2 guests"
  }'

# Check status
curl http://localhost:3001/api/v1/email/status/{id}

# Get proof
curl http://localhost:3001/api/v1/proof/{email_hash}
```

## Test Proof Generation

For quick testing without emails:

```bash
curl -X POST http://localhost:3001/api/v1/test/generate-proof \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "opentable",
    "restaurant_name": "The French Laundry",
    "party_size": 2,
    "reservation_type": "confirmation"
  }'
``` 