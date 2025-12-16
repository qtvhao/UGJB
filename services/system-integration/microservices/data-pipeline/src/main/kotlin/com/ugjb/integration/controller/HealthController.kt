/**
 * Associated Frontend Files:
 *   - web/app/src/lib/api.ts (health checks via api-gateway)
 *   - web/app/src/components/layout/Sidebar.tsx (system status display)
 */
package com.ugjb.integration.controller

import org.springframework.boot.actuate.health.Health
import org.springframework.boot.actuate.health.HealthIndicator
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Instant

/**
 * Health Check Controller
 *
 * Provides health check endpoints for the DataPipeline microservice.
 * Used by container orchestration platforms and load balancers to determine service health.
 */
@RestController
@RequestMapping("/health")
class HealthController : HealthIndicator {

    /**
     * Simple health check endpoint
     * Returns 200 OK if service is running
     */
    @GetMapping
    fun health(): ResponseEntity<Map<String, Any>> {
        val healthStatus = mapOf(
            "status" to "UP",
            "service" to "data-pipeline",
            "timestamp" to Instant.now().toString(),
            "port" to 8061
        )
        return ResponseEntity.ok(healthStatus)
    }

    /**
     * Detailed health check for Spring Boot Actuator
     */
    override fun health(): Health {
        return Health.up()
            .withDetail("service", "data-pipeline")
            .withDetail("port", 8061)
            .withDetail("timestamp", Instant.now().toString())
            .build()
    }

    /**
     * Readiness probe endpoint
     * Indicates whether the service is ready to accept traffic
     */
    @GetMapping("/ready")
    fun ready(): ResponseEntity<Map<String, Any>> {
        val readyStatus = mapOf(
            "ready" to true,
            "service" to "data-pipeline",
            "timestamp" to Instant.now().toString()
        )
        return ResponseEntity.ok(readyStatus)
    }

    /**
     * Liveness probe endpoint
     * Indicates whether the service is alive and should not be restarted
     */
    @GetMapping("/live")
    fun live(): ResponseEntity<Map<String, Any>> {
        val liveStatus = mapOf(
            "alive" to true,
            "service" to "data-pipeline",
            "timestamp" to Instant.now().toString()
        )
        return ResponseEntity.ok(liveStatus)
    }
}
