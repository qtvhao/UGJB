package com.ugjb.hr.allocation.controller

import com.ugjb.hr.allocation.dto.*
import com.ugjb.hr.allocation.service.OptimizationService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/optimize")
@Tag(name = "Optimization", description = "Workforce allocation optimization endpoints")
class OptimizationController(
    private val optimizationService: OptimizationService
) {

    @PostMapping("/allocation")
    @Operation(summary = "Compute optimal workforce allocation using graph algorithms")
    fun computeOptimalAllocation(
        @Valid @RequestBody request: OptimizationRequest
    ): ResponseEntity<OptimalAllocationResponse> {
        val response = optimizationService.computeOptimalAllocation(
            employees = request.employees,
            projects = request.projects,
            maxAllocationPerEmployee = request.maxAllocationPerEmployee
        )
        return ResponseEntity.ok(response)
    }
}

data class OptimizationRequest(
    val employees: List<EmployeeCapacity>,
    val projects: List<ProjectDemand>,
    val maxAllocationPerEmployee: Int = 100
)
