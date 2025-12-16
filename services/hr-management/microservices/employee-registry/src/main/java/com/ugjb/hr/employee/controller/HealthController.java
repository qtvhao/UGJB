/**
 * Associated Frontend Files:
 *   - web/app/src/lib/api.ts (internal health check, not directly exposed)
 */
package com.ugjb.hr.employee.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@Tag(name = "Health", description = "Health check endpoints")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Health check endpoint")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "employee-registry",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @GetMapping("/health/ready")
    @Operation(summary = "Readiness probe")
    public ResponseEntity<Map<String, Object>> ready() {
        return ResponseEntity.ok(Map.of(
                "status", "READY",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @GetMapping("/health/live")
    @Operation(summary = "Liveness probe")
    public ResponseEntity<Map<String, Object>> live() {
        return ResponseEntity.ok(Map.of(
                "status", "ALIVE",
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}
