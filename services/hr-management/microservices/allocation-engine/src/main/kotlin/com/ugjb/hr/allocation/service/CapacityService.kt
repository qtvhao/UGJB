package com.ugjb.hr.allocation.service

import com.ugjb.hr.allocation.dto.*
import com.ugjb.hr.allocation.entity.AssignmentStatus
import com.ugjb.hr.allocation.repository.AssignmentRepository
import com.ugjb.hr.allocation.repository.ProjectRepository
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.temporal.TemporalAdjusters
import java.util.*

/**
 * Capacity Service for Cluster_0002
 * Implements: Story 2.2 - View Team Capacity
 */
@Service
class CapacityService(
    private val assignmentRepository: AssignmentRepository,
    private val projectRepository: ProjectRepository
) {
    companion object {
        const val MAX_ALLOCATION = 100
    }

    /**
     * Get team capacity visualization for a given period
     */
    fun getTeamCapacity(
        teamId: UUID,
        teamName: String,
        memberIds: List<UUID>,
        period: String
    ): TeamCapacityResponse {
        val (periodStart, periodEnd) = getPeriodDates(period)

        val memberCapacities = memberIds.map { employeeId ->
            calculateMemberCapacity(employeeId, periodStart, periodEnd)
        }

        val totalCapacity = memberIds.size * MAX_ALLOCATION
        val allocatedCapacity = memberCapacities.sumOf { it.totalAllocation }
        val availableCapacity = totalCapacity - allocatedCapacity
        val utilizationPercent = if (totalCapacity > 0) {
            (allocatedCapacity.toDouble() / totalCapacity) * 100
        } else 0.0

        val overAllocated = memberCapacities
            .filter { it.status == AllocationStatus.OVER_ALLOCATED }
            .map { it.employeeId }

        val underAllocated = memberCapacities
            .filter { it.status == AllocationStatus.AVAILABLE }
            .map { it.employeeId }

        return TeamCapacityResponse(
            teamId = teamId,
            teamName = teamName,
            period = period,
            periodStart = periodStart,
            periodEnd = periodEnd,
            totalCapacity = totalCapacity,
            allocatedCapacity = allocatedCapacity,
            availableCapacity = availableCapacity,
            utilizationPercent = utilizationPercent.round(2),
            memberCapacities = memberCapacities,
            overAllocatedMembers = overAllocated,
            underAllocatedMembers = underAllocated
        )
    }

    /**
     * Calculate capacity for a single team member
     */
    private fun calculateMemberCapacity(
        employeeId: UUID,
        periodStart: LocalDate,
        periodEnd: LocalDate
    ): MemberCapacity {
        val assignments = assignmentRepository.findByEmployeeIdAndStatus(
            employeeId, AssignmentStatus.ACTIVE
        ).filter { assignment ->
            // Filter assignments active during the period
            val assignmentStart = assignment.startDate
            val assignmentEnd = assignment.endDate ?: LocalDate.MAX
            assignmentStart <= periodEnd && assignmentEnd >= periodStart
        }

        val totalAllocation = assignments.sumOf { it.allocationPercent }
        val availableAllocation = MAX_ALLOCATION - totalAllocation

        val status = when {
            totalAllocation > MAX_ALLOCATION -> AllocationStatus.OVER_ALLOCATED
            totalAllocation >= 85 -> AllocationStatus.NEAR_CAPACITY
            totalAllocation >= 50 -> AllocationStatus.OPTIMAL
            else -> AllocationStatus.AVAILABLE
        }

        val summaries = assignments.map { assignment ->
            val project = projectRepository.findById(assignment.projectId).orElse(null)
            AssignmentSummary(
                projectId = assignment.projectId,
                projectName = project?.name,
                allocationPercent = assignment.allocationPercent,
                role = assignment.role
            )
        }

        return MemberCapacity(
            employeeId = employeeId,
            employeeName = null, // Would be fetched from employee-registry service
            totalAllocation = totalAllocation,
            availableAllocation = availableAllocation.coerceAtLeast(0),
            status = status,
            assignments = summaries
        )
    }

    /**
     * Export team capacity data
     */
    fun exportCapacity(request: CapacityExportRequest, teamName: String, memberIds: List<UUID>): CapacityExportResponse {
        val capacity = getTeamCapacity(request.teamId, teamName, memberIds, request.period)

        val data = when (request.format) {
            ExportFormat.CSV -> generateCsvExport(capacity)
            ExportFormat.JSON -> generateJsonExport(capacity)
            ExportFormat.XLSX -> generateCsvExport(capacity) // Simplified for MVP
        }

        return CapacityExportResponse(
            teamId = request.teamId,
            period = request.period,
            format = request.format,
            data = data,
            generatedAt = LocalDateTime.now()
        )
    }

    private fun generateCsvExport(capacity: TeamCapacityResponse): String {
        val header = "Employee ID,Total Allocation,Available,Status,Projects"
        val rows = capacity.memberCapacities.map { member ->
            val projects = member.assignments.joinToString(";") { "${it.projectName}:${it.allocationPercent}%" }
            "${member.employeeId},${member.totalAllocation}%,${member.availableAllocation}%,${member.status},$projects"
        }
        return (listOf(header) + rows).joinToString("\n")
    }

    private fun generateJsonExport(capacity: TeamCapacityResponse): String {
        return """
            {
                "teamId": "${capacity.teamId}",
                "teamName": "${capacity.teamName}",
                "period": "${capacity.period}",
                "utilizationPercent": ${capacity.utilizationPercent},
                "memberCount": ${capacity.memberCapacities.size},
                "overAllocatedCount": ${capacity.overAllocatedMembers.size},
                "underAllocatedCount": ${capacity.underAllocatedMembers.size}
            }
        """.trimIndent()
    }

    /**
     * Convert period string to date range
     */
    private fun getPeriodDates(period: String): Pair<LocalDate, LocalDate> {
        val today = LocalDate.now()
        return when (period.lowercase()) {
            "week" -> {
                val start = today.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY))
                val end = start.plusDays(6)
                Pair(start, end)
            }
            "month" -> {
                val start = today.withDayOfMonth(1)
                val end = today.with(TemporalAdjusters.lastDayOfMonth())
                Pair(start, end)
            }
            "quarter" -> {
                val quarterMonth = ((today.monthValue - 1) / 3) * 3 + 1
                val start = today.withMonth(quarterMonth).withDayOfMonth(1)
                val end = start.plusMonths(2).with(TemporalAdjusters.lastDayOfMonth())
                Pair(start, end)
            }
            else -> {
                // Default to current month
                val start = today.withDayOfMonth(1)
                val end = today.with(TemporalAdjusters.lastDayOfMonth())
                Pair(start, end)
            }
        }
    }

    private fun Double.round(decimals: Int): Double {
        var multiplier = 1.0
        repeat(decimals) { multiplier *= 10 }
        return kotlin.math.round(this * multiplier) / multiplier
    }
}
