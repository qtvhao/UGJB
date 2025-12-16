/**
 * Associated Frontend Files:
 *   - web/app/src/lib/api.ts (integrationApi.connections - lines 131-139)
 *   - web/app/src/pages/integrations/IntegrationsPage.tsx
 */

package com.ugjb.integration.entity

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

/**
 * Connection entity representing an external system integration configuration.
 * Stored in MongoDB connections collection.
 */
@Document(collection = "connections")
data class Connection(
    @Id
    val id: String,
    val name: String,
    val type: String,
    val status: String,
    val lastSync: String?,
    val syncFrequency: String,
    val configuration: Map<String, String>
)

/**
 * DTO for creating a new connection
 */
data class CreateConnectionRequest(
    val name: String,
    val type: String,
    val syncFrequency: String = "DAILY",
    val configuration: Map<String, String> = emptyMap()
)

/**
 * DTO for updating an existing connection
 */
data class UpdateConnectionRequest(
    val name: String? = null,
    val syncFrequency: String? = null,
    val configuration: Map<String, String>? = null
)

/**
 * Response for listing connections
 */
data class ConnectionsListResponse(
    val connections: List<Connection>,
    val total: Int,
    val activeCount: Int,
    val errorCount: Int
)

/**
 * Response for sync operation
 */
data class SyncResponse(
    val connectionId: String,
    val status: String,
    val message: String,
    val estimatedCompletion: String
)

/**
 * Connection health status response
 */
data class ConnectionStatus(
    val connectionId: String,
    val status: String,
    val lastSync: String?,
    val health: String,
    val metrics: ConnectionMetrics
)

/**
 * Connection metrics data
 */
data class ConnectionMetrics(
    val recordsSynced: Int,
    val lastSyncDuration: String,
    val errorCount: Int
)
