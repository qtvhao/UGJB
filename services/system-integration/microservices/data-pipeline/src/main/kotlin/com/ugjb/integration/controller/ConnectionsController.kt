/**
 * Associated Frontend Files:
 *   - web/app/src/lib/api.ts (integrationApi.connections - lines 131-139)
 *   - web/app/src/pages/integrations/IntegrationsPage.tsx
 */

package com.ugjb.integration.controller

import com.ugjb.integration.entity.*
import com.ugjb.integration.repository.ConnectionRepository
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.util.UUID

/**
 * Integration Connections Controller
 *
 * REST API endpoints for managing external system integrations/connections.
 * Handles CRUD operations for integration configurations and sync operations.
 */
@RestController
@RequestMapping("/connections")
class ConnectionsController(
    private val connectionRepository: ConnectionRepository
) {

    /**
     * List all connections
     */
    @GetMapping
    fun listConnections(
        @RequestParam(required = false) type: String?,
        @RequestParam(required = false) status: String?
    ): ResponseEntity<ConnectionsListResponse> {
        val result = when {
            type != null && status != null ->
                connectionRepository.findByTypeIgnoreCaseAndStatusIgnoreCase(type, status)
            type != null ->
                connectionRepository.findByTypeIgnoreCase(type)
            status != null ->
                connectionRepository.findByStatusIgnoreCase(status)
            else ->
                connectionRepository.findAll()
        }

        return ResponseEntity.ok(
            ConnectionsListResponse(
                connections = result,
                total = result.size,
                activeCount = result.count { it.status == "ACTIVE" },
                errorCount = result.count { it.status == "ERROR" }
            )
        )
    }

    /**
     * Get a specific connection by ID
     */
    @GetMapping("/{connectionId}")
    fun getConnection(@PathVariable connectionId: String): ResponseEntity<Connection> {
        return connectionRepository.findById(connectionId)
            .map { ResponseEntity.ok(it) }
            .orElse(ResponseEntity.notFound().build())
    }

    /**
     * Create a new connection
     */
    @PostMapping
    fun createConnection(@RequestBody request: CreateConnectionRequest): ResponseEntity<Connection> {
        val connection = Connection(
            id = UUID.randomUUID().toString(),
            name = request.name,
            type = request.type,
            status = "PENDING",
            lastSync = null,
            syncFrequency = request.syncFrequency,
            configuration = request.configuration
        )
        val saved = connectionRepository.save(connection)
        return ResponseEntity.status(HttpStatus.CREATED).body(saved)
    }

    /**
     * Update an existing connection
     */
    @PutMapping("/{connectionId}")
    fun updateConnection(
        @PathVariable connectionId: String,
        @RequestBody request: UpdateConnectionRequest
    ): ResponseEntity<Connection> {
        return connectionRepository.findById(connectionId)
            .map { existing ->
                val updated = existing.copy(
                    name = request.name ?: existing.name,
                    syncFrequency = request.syncFrequency ?: existing.syncFrequency,
                    configuration = request.configuration ?: existing.configuration
                )
                ResponseEntity.ok(connectionRepository.save(updated))
            }
            .orElse(ResponseEntity.notFound().build())
    }

    /**
     * Delete a connection
     */
    @DeleteMapping("/{connectionId}")
    fun deleteConnection(@PathVariable connectionId: String): ResponseEntity<Void> {
        return if (connectionRepository.existsById(connectionId)) {
            connectionRepository.deleteById(connectionId)
            ResponseEntity.noContent().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }

    /**
     * Trigger sync for a connection
     */
    @PostMapping("/{connectionId}/sync")
    fun syncConnection(@PathVariable connectionId: String): ResponseEntity<SyncResponse> {
        return connectionRepository.findById(connectionId)
            .map { connection ->
                val updated = connection.copy(
                    lastSync = Instant.now().toString(),
                    status = "ACTIVE"
                )
                connectionRepository.save(updated)

                ResponseEntity.ok(
                    SyncResponse(
                        connectionId = connectionId,
                        status = "QUEUED",
                        message = "Sync initiated successfully",
                        estimatedCompletion = Instant.now().plusSeconds(60).toString()
                    )
                )
            }
            .orElse(ResponseEntity.notFound().build())
    }

    /**
     * Get connection status/health
     */
    @GetMapping("/{connectionId}/status")
    fun getConnectionStatus(@PathVariable connectionId: String): ResponseEntity<ConnectionStatus> {
        return connectionRepository.findById(connectionId)
            .map { connection ->
                ResponseEntity.ok(
                    ConnectionStatus(
                        connectionId = connectionId,
                        status = connection.status,
                        lastSync = connection.lastSync,
                        health = if (connection.status == "ACTIVE") "HEALTHY" else "UNHEALTHY",
                        metrics = ConnectionMetrics(
                            recordsSynced = 0,
                            lastSyncDuration = "0s",
                            errorCount = if (connection.status == "ERROR") 1 else 0
                        )
                    )
                )
            }
            .orElse(ResponseEntity.notFound().build())
    }
}
