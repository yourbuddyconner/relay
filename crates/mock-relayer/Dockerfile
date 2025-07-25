# Build stage
FROM rustlang/rust:nightly as builder

WORKDIR /workspace

# Copy workspace Cargo.toml
COPY Cargo.toml ./Cargo.toml

# Copy the mock-relayer crate
COPY crates/mock-relayer ./crates/mock-relayer

# Build the application
RUN cargo build --release -p mock-relayer

# Runtime stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the binary from builder
COPY --from=builder /workspace/target/release/mock-relayer /app/mock-relayer

# Expose port
EXPOSE 3001

# Run the binary
CMD ["./mock-relayer"] 