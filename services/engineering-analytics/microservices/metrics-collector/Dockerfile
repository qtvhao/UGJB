# MetricsCollector - Python 3.11, FastAPI, Pandas, Pydantic
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

# Expose API port
EXPOSE 8031

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8031/health || exit 1

# Run FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8031"]
