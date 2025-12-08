package com.ugjb.hr.allocation.dto

import com.ugjb.hr.allocation.entity.AssignmentRole
import com.ugjb.hr.allocation.entity.AssignmentStatus
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotNull
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

data class CreateAssignmentRequest(
    @field:NotNull(message = "Employee ID is required")
    val employeeId: UUID,

    @field:NotNull(message = "Project ID is required")
    val projectId: UUID,

    @field:NotNull(message = "Role is required")
    val role: AssignmentRole,

    @field:NotNull(message = "Allocation percent is required")
    @field:Min(value = 1, message = "Allocation must be at least 1%")
    @field:Max(value = 100, message = "Allocation cannot exceed 100%")
    val allocationPercent: Int,

    @field:NotNull(message = "Start date is required")
    val startDate: LocalDate,

    val endDate: LocalDate? = null
)

data class UpdateAssignmentRequest(
    val role: AssignmentRole? = null,

    @field:Min(value = 1, message = "Allocation must be at least 1%")
    @field:Max(value = 100, message = "Allocation cannot exceed 100%")
    val allocationPercent: Int? = null,

    val endDate: LocalDate? = null,

    val status: AssignmentStatus? = null
)

data class AssignmentResponse(
    val assignmentId: UUID,
    val employeeId: UUID,
    val projectId: UUID,
    val role: AssignmentRole,
    val allocationPercent: Int,
    val startDate: LocalDate,
    val endDate: LocalDate?,
    val status: AssignmentStatus,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class EmployeeUtilizationResponse(
    val employeeId: UUID,
    val totalAllocationPercent: Int,
    val availablePercent: Int,
    val activeAssignments: List<AssignmentSummary>
)

data class AssignmentSummary(
    val projectId: UUID,
    val projectName: String?,
    val allocationPercent: Int,
    val role: AssignmentRole
)

data class ValidationResponse(
    val isValid: Boolean,
    val message: String,
    val currentAllocation: Int,
    val requestedAllocation: Int,
    val totalIfApproved: Int
)

data class PageResponse<T>(
    val content: List<T>,
    val total: Long,
    val page: Int,
    val size: Int
)

// Team Capacity Visualization DTOs (Story 2.2)
data class TeamCapacityResponse(
    val teamId: UUID,
    val teamName: String,
    val period: String,
    val periodStart: LocalDate,
    val periodEnd: LocalDate,
    val totalCapacity: Int,
    val allocatedCapacity: Int,
    val availableCapacity: Int,
    val utilizationPercent: Double,
    val memberCapacities: List<MemberCapacity>,
    val overAllocatedMembers: List<UUID>,
    val underAllocatedMembers: List<UUID>
)

data class MemberCapacity(
    val employeeId: UUID,
    val employeeName: String?,
    val totalAllocation: Int,
    val availableAllocation: Int,
    val status: AllocationStatus,
    val assignments: List<AssignmentSummary>
)

enum class AllocationStatus {
    AVAILABLE,      // < 50%
    OPTIMAL,        // 50-85%
    NEAR_CAPACITY,  // 85-100%
    OVER_ALLOCATED  // > 100%
}

data class CapacityExportRequest(
    val teamId: UUID,
    val period: String,
    val format: ExportFormat = ExportFormat.CSV
)

enum class ExportFormat {
    CSV,
    XLSX,
    JSON
}

data class CapacityExportResponse(
    val teamId: UUID,
    val period: String,
    val format: ExportFormat,
    val data: String,
    val generatedAt: LocalDateTime
)

// Period filtering
data class PeriodFilter(
    val type: PeriodType,
    val startDate: LocalDate,
    val endDate: LocalDate
)

enum class PeriodType {
    WEEK,
    MONTH,
    QUARTER,
    CUSTOM
}
