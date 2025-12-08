# EmployeeRegistry - Java 17, Spring Boot, Hibernate
FROM eclipse-temurin:17-jdk AS builder

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Copy Gradle wrapper and build files
COPY gradle ./gradle
COPY gradlew build.gradle.kts settings.gradle.kts ./

# Make gradlew executable and download Gradle
RUN chmod +x gradlew && ./gradlew --version

# Download dependencies
RUN ./gradlew dependencies --no-daemon || true

# Copy source code
COPY src ./src

# Build application
RUN ./gradlew bootJar --no-daemon -x test

# Production stage
FROM eclipse-temurin:17-jre

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Copy JAR from builder
COPY --from=builder /app/build/libs/*.jar app.jar

# Expose REST API port
EXPOSE 8021

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8021/health || exit 1

# Run Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
