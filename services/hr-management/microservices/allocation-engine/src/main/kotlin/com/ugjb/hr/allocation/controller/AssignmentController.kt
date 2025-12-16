/**
 * Associated Frontend Files:
 *   - web/app/src/lib/api.ts (hrApi.assignments - lines 71-76)
 *   - web/app/src/pages/hr/WorkforceAssignmentsPage.tsx
 *   - web/app/src/pages/hr/NewAssignmentPage.tsx
 *   - web/app/src/pages/hr/OverallocationPage.tsx
 */
package com.ugjb.hr.allocation.controller

import com.ugjb.hr.allocation.dto.*
import com.ugjb.hr.allocation.entity.AssignmentStatus
import com.ugjb.hr.allocation.service.AllocationService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/assignments")
@Tag(name = "Assignments", description = "Workforce assignment management endpoints")
class AssignmentController(
    private val allocationService: AllocationService
) {

    @PostMapping
    @Operation(summary = "Create a new workforce assignment")
    fun createAssignment(
        @Valid @RequestBody request: CreateAssignmentRequest
    ): ResponseEntity<AssignmentResponse> {
        val response = allocationService.createAssignment(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @GetMapping("/{assignmentId}")
    @Operation(summary = "Get assignment by ID")
    fun getAssignment(
        @PathVariable assignmentId: UUID
    ): ResponseEntity<AssignmentResponse> {
        val response = allocationService.getAssignment(assignmentId)
        return ResponseEntity.ok(response)
    }

    @PutMapping("/{assignmentId}")
    @Operation(summary = "Update an existing assignment")
    fun updateAssignment(
        @PathVariable assignmentId: UUID,
        @Valid @RequestBody request: UpdateAssignmentRequest
    ): ResponseEntity<AssignmentResponse> {
        val response = allocationService.updateAssignment(assignmentId, request)
        return ResponseEntity.ok(response)
    }

    @GetMapping
    @Operation(summary = "List assignments with filtering")
    fun listAssignments(
        @RequestParam(required = false) employeeId: UUID?,
        @RequestParam(required = false) projectId: UUID?,
        @RequestParam(required = false) status: AssignmentStatus?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "50") size: Int
    ): ResponseEntity<PageResponse<AssignmentResponse>> {
        val response = allocationService.listAssignments(employeeId, projectId, status, page, size)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/employee/{employeeId}/utilization")
    @Operation(summary = "Get employee's FTE utilization")
    fun getEmployeeUtilization(
        @PathVariable employeeId: UUID
    ): ResponseEntity<EmployeeUtilizationResponse> {
        val response = allocationService.getEmployeeUtilization(employeeId)
        return ResponseEntity.ok(response)
    }

    @PostMapping("/validate")
    @Operation(summary = "Validate allocation before creation")
    fun validateAllocation(
        @RequestParam employeeId: UUID,
        @RequestParam requestedAllocation: Int,
        @RequestParam(required = false) excludeAssignmentId: UUID?
    ): ResponseEntity<ValidationResponse> {
        val response = allocationService.validateAllocation(
            employeeId, requestedAllocation, excludeAssignmentId
        )
        return ResponseEntity.ok(response)
    }
}
