/**
 * Associated Frontend Files:
 *   - web/app/src/lib/api.ts (integrationApi.connections - lines 131-139)
 *   - web/app/src/pages/integrations/IntegrationsPage.tsx
 */

package com.ugjb.integration.repository

import com.ugjb.integration.entity.Connection
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

/**
 * MongoDB repository for Connection entities.
 * Provides CRUD operations and custom query methods for integration connections.
 */
@Repository
interface ConnectionRepository : MongoRepository<Connection, String> {

    /**
     * Find connections by type (e.g., JIRA, GITLAB)
     */
    fun findByTypeIgnoreCase(type: String): List<Connection>

    /**
     * Find connections by status (e.g., ACTIVE, ERROR, PENDING)
     */
    fun findByStatusIgnoreCase(status: String): List<Connection>

    /**
     * Find connections by both type and status
     */
    fun findByTypeIgnoreCaseAndStatusIgnoreCase(type: String, status: String): List<Connection>

    /**
     * Count connections by status
     */
    fun countByStatus(status: String): Long
}
