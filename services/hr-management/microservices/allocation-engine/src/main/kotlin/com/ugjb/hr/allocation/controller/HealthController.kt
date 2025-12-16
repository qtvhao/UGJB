/**
 * Associated Frontend Files:
 *   - web/app/src/lib/api.ts (internal health check, not directly exposed)
 */
package com.ugjb.hr.allocation.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDateTime

@RestController
@Tag(name = "Health", description = "Health check endpoints")
class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Health check endpoint")
    fun health(): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(mapOf(
            "status" to "UP",
            "service" to "allocation-engine",
            "timestamp" to LocalDateTime.now().toString()
        ))
    }

    @GetMapping("/health/ready")
    @Operation(summary = "Readiness probe")
    fun ready(): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(mapOf(
            "status" to "READY",
            "timestamp" to LocalDateTime.now().toString()
        ))
    }

    @GetMapping("/health/live")
    @Operation(summary = "Liveness probe")
    fun live(): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(mapOf(
            "status" to "ALIVE",
            "timestamp" to LocalDateTime.now().toString()
        ))
    }
}
