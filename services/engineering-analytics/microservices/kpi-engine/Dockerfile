# KPIEngine - Python 3.11, scikit-learn, Protobuf, gRPC
FROM python:3.11-slim AS builder

WORKDIR /app

# Copy and install dependencies (all packages use binary wheels)
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-slim

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Copy application code
COPY . .

# Expose gRPC port
EXPOSE 50052

# Health check using HTTP endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD python -c "import socket; s = socket.socket(); s.connect(('localhost', 50052)); s.close()" || exit 1

# Run gRPC server
CMD ["python", "main.py"]
