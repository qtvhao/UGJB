/**
 * Associated Frontend Files:
 *   - web/app/src/lib/api.ts (capacityApi - lines 225-239)
 *   - web/app/src/pages/capacity/TeamCapacityPage.tsx
 */
package com.ugjb.hr.allocation.controller

import com.ugjb.hr.allocation.dto.*
import com.ugjb.hr.allocation.service.CapacityService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*

/**
 * Capacity Controller for Cluster_0002
 * Implements: Story 2.2 - View Team Capacity
 */
@RestController
@RequestMapping("/capacity")
@Tag(name = "Capacity", description = "Team capacity visualization endpoints")
class CapacityController(
    private val capacityService: CapacityService
) {

    @GetMapping("/team/{teamId}")
    @Operation(
        summary = "View team capacity",
        description = "Get team capacity visualization with allocations for week/month/quarter"
    )
    fun getTeamCapacity(
        @PathVariable teamId: UUID,
        @RequestParam(defaultValue = "Team") teamName: String,
        @RequestParam memberIds: List<UUID>,
        @RequestParam(defaultValue = "month") period: String
    ): ResponseEntity<TeamCapacityResponse> {
        val response = capacityService.getTeamCapacity(teamId, teamName, memberIds, period)
        return ResponseEntity.ok(response)
    }

    @PostMapping("/team/{teamId}/export")
    @Operation(
        summary = "Export team capacity",
        description = "Export team capacity data to CSV, XLSX, or JSON format"
    )
    fun exportTeamCapacity(
        @PathVariable teamId: UUID,
        @RequestParam(defaultValue = "Team") teamName: String,
        @RequestParam memberIds: List<UUID>,
        @RequestBody request: CapacityExportRequest
    ): ResponseEntity<CapacityExportResponse> {
        val response = capacityService.exportCapacity(request, teamName, memberIds)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(
        summary = "Get employee capacity",
        description = "Get individual employee's allocation and availability"
    )
    fun getEmployeeCapacity(
        @PathVariable employeeId: UUID,
        @RequestParam(defaultValue = "month") period: String
    ): ResponseEntity<MemberCapacity> {
        // This would integrate with the existing AllocationService
        // For now, return a placeholder that follows the same pattern
        val response = capacityService.getTeamCapacity(
            teamId = UUID.randomUUID(),
            teamName = "Individual",
            memberIds = listOf(employeeId),
            period = period
        ).memberCapacities.firstOrNull()

        return if (response != null) {
            ResponseEntity.ok(response)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @GetMapping("/alerts/over-allocated")
    @Operation(
        summary = "Get over-allocated employees",
        description = "List all employees with allocation exceeding 100%"
    )
    fun getOverAllocatedEmployees(
        @RequestParam teamId: UUID?,
        @RequestParam memberIds: List<UUID>?,
        @RequestParam(defaultValue = "month") period: String
    ): ResponseEntity<List<MemberCapacity>> {
        if (teamId == null || memberIds.isNullOrEmpty()) {
            return ResponseEntity.ok(emptyList())
        }

        val capacity = capacityService.getTeamCapacity(
            teamId = teamId,
            teamName = "Team",
            memberIds = memberIds,
            period = period
        )

        val overAllocated = capacity.memberCapacities
            .filter { it.status == AllocationStatus.OVER_ALLOCATED }

        return ResponseEntity.ok(overAllocated)
    }

    @GetMapping("/alerts/under-utilized")
    @Operation(
        summary = "Get under-utilized employees",
        description = "List all employees with allocation below 50%"
    )
    fun getUnderUtilizedEmployees(
        @RequestParam teamId: UUID?,
        @RequestParam memberIds: List<UUID>?,
        @RequestParam(defaultValue = "month") period: String
    ): ResponseEntity<List<MemberCapacity>> {
        if (teamId == null || memberIds.isNullOrEmpty()) {
            return ResponseEntity.ok(emptyList())
        }

        val capacity = capacityService.getTeamCapacity(
            teamId = teamId,
            teamName = "Team",
            memberIds = memberIds,
            period = period
        )

        val underUtilized = capacity.memberCapacities
            .filter { it.status == AllocationStatus.AVAILABLE }

        return ResponseEntity.ok(underUtilized)
    }
}
