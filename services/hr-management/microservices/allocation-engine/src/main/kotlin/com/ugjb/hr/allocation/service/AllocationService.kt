/**
 * Associated Frontend Files:
 *   - web/app/src/lib/api.ts (hrApi.assignments - lines 71-76)
 *   - web/app/src/pages/hr/WorkforceAssignmentsPage.tsx
 *   - web/app/src/pages/hr/NewAssignmentPage.tsx
 *   - web/app/src/pages/hr/OverallocationPage.tsx
 */
package com.ugjb.hr.allocation.service

import com.ugjb.hr.allocation.dto.*
import com.ugjb.hr.allocation.entity.Assignment
import com.ugjb.hr.allocation.entity.AssignmentStatus
import com.ugjb.hr.allocation.exception.AllocationExceededException
import com.ugjb.hr.allocation.exception.DuplicateAssignmentException
import com.ugjb.hr.allocation.exception.ResourceNotFoundException
import com.ugjb.hr.allocation.repository.AssignmentRepository
import com.ugjb.hr.allocation.repository.ProjectRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Service
class AllocationService(
    private val assignmentRepository: AssignmentRepository,
    private val projectRepository: ProjectRepository
) {
    companion object {
        const val MAX_ALLOCATION_PERCENT = 100
    }

    @Transactional
    fun createAssignment(request: CreateAssignmentRequest): AssignmentResponse {
        // Check for duplicate active assignment
        val existingAssignment = assignmentRepository.findByEmployeeIdAndProjectIdAndStatus(
            request.employeeId, request.projectId, AssignmentStatus.ACTIVE
        )
        if (existingAssignment != null) {
            throw DuplicateAssignmentException(
                "Employee already has an active assignment to this project"
            )
        }

        // Validate allocation doesn't exceed 100%
        val validationResult = validateAllocation(
            request.employeeId,
            request.allocationPercent,
            null
        )
        if (!validationResult.isValid) {
            throw AllocationExceededException(
                validationResult.currentAllocation,
                validationResult.requestedAllocation,
                validationResult.totalIfApproved
            )
        }

        val assignment = Assignment(
            employeeId = request.employeeId,
            projectId = request.projectId,
            role = request.role,
            allocationPercent = request.allocationPercent,
            startDate = request.startDate,
            endDate = request.endDate,
            status = AssignmentStatus.ACTIVE
        )

        val saved = assignmentRepository.save(assignment)
        return toResponse(saved)
    }

    fun getAssignment(assignmentId: UUID): AssignmentResponse {
        val assignment = assignmentRepository.findById(assignmentId)
            .orElseThrow { ResourceNotFoundException("Assignment not found: $assignmentId") }
        return toResponse(assignment)
    }

    @Transactional
    fun updateAssignment(assignmentId: UUID, request: UpdateAssignmentRequest): AssignmentResponse {
        val assignment = assignmentRepository.findById(assignmentId)
            .orElseThrow { ResourceNotFoundException("Assignment not found: $assignmentId") }

        // If allocation is being changed, validate
        request.allocationPercent?.let { newAllocation ->
            if (newAllocation != assignment.allocationPercent) {
                val validationResult = validateAllocation(
                    assignment.employeeId,
                    newAllocation,
                    assignmentId
                )
                if (!validationResult.isValid) {
                    throw AllocationExceededException(
                        validationResult.currentAllocation,
                        validationResult.requestedAllocation,
                        validationResult.totalIfApproved
                    )
                }
                assignment.allocationPercent = newAllocation
            }
        }

        request.role?.let { assignment.role = it }
        request.endDate?.let { assignment.endDate = it }
        request.status?.let { assignment.status = it }

        val saved = assignmentRepository.save(assignment)
        return toResponse(saved)
    }

    fun listAssignments(
        employeeId: UUID?,
        projectId: UUID?,
        status: AssignmentStatus?,
        page: Int,
        size: Int
    ): PageResponse<AssignmentResponse> {
        val pageable = PageRequest.of(page, size)
        val result = assignmentRepository.findWithFilters(employeeId, projectId, status, pageable)

        return PageResponse(
            content = result.content.map { toResponse(it) },
            total = result.totalElements,
            page = page,
            size = size
        )
    }

    fun getEmployeeUtilization(employeeId: UUID): EmployeeUtilizationResponse {
        val activeAssignments = assignmentRepository.findByEmployeeIdAndStatus(
            employeeId, AssignmentStatus.ACTIVE
        )

        val totalAllocation = activeAssignments.sumOf { it.allocationPercent }

        val summaries = activeAssignments.map { assignment ->
            val project = projectRepository.findById(assignment.projectId).orElse(null)
            AssignmentSummary(
                projectId = assignment.projectId,
                projectName = project?.name,
                allocationPercent = assignment.allocationPercent,
                role = assignment.role
            )
        }

        return EmployeeUtilizationResponse(
            employeeId = employeeId,
            totalAllocationPercent = totalAllocation,
            availablePercent = MAX_ALLOCATION_PERCENT - totalAllocation,
            activeAssignments = summaries
        )
    }

    fun validateAllocation(
        employeeId: UUID,
        requestedAllocation: Int,
        excludeAssignmentId: UUID?
    ): ValidationResponse {
        val currentAllocation = assignmentRepository.sumActiveAllocationByEmployeeId(
            employeeId, excludeAssignmentId
        )
        val totalIfApproved = currentAllocation + requestedAllocation
        val isValid = totalIfApproved <= MAX_ALLOCATION_PERCENT

        return ValidationResponse(
            isValid = isValid,
            message = if (isValid) {
                "Allocation is valid"
            } else {
                "Total FTE allocation (${totalIfApproved}%) exceeds 100% limit."
            },
            currentAllocation = currentAllocation,
            requestedAllocation = requestedAllocation,
            totalIfApproved = totalIfApproved
        )
    }

    private fun toResponse(assignment: Assignment): AssignmentResponse {
        return AssignmentResponse(
            assignmentId = assignment.assignmentId!!,
            employeeId = assignment.employeeId,
            projectId = assignment.projectId,
            role = assignment.role,
            allocationPercent = assignment.allocationPercent,
            startDate = assignment.startDate,
            endDate = assignment.endDate,
            status = assignment.status,
            createdAt = assignment.createdAt,
            updatedAt = assignment.updatedAt
        )
    }
}
