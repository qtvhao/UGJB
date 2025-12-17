# BurnoutPredictor - Python 3.11, scikit-learn, XGBoost, Protobuf
FROM python:3.11-slim AS builder

WORKDIR /app

# Copy and install dependencies (all packages use binary wheels)
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-slim

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Copy application code
COPY . .

# Generate gRPC code from proto files
RUN python -m grpc_tools.protoc \
    -I./protos \
    --python_out=. \
    --grpc_python_out=. \
    ./protos/burnout.proto || true

# Create models directory
RUN mkdir -p /app/models

# Expose REST and gRPC ports
EXPOSE 8072 50054

# Health check using REST API
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8072/health || exit 1

# Run FastAPI + gRPC server
CMD ["python", "main.py"]
