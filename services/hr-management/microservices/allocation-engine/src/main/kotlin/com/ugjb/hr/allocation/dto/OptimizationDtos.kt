package com.ugjb.hr.allocation.dto

import java.util.*

data class OptimalAllocationRequest(
    val projectIds: List<UUID>,
    val skillRequirements: List<SkillRequirement>,
    val maxAllocationPerEmployee: Int = 100
)

data class SkillRequirement(
    val skillName: String,
    val minProficiency: Int,
    val requiredFtePercent: Int
)

data class OptimalAllocationResponse(
    val proposedAssignments: List<ProposedAssignment>,
    val totalCoveragePercent: Int,
    val unmetRequirements: List<String>
)

data class ProposedAssignment(
    val employeeId: UUID,
    val employeeName: String,
    val projectId: UUID,
    val proposedAllocationPercent: Int,
    val matchedSkills: List<String>,
    val matchScore: Double
)

data class EmployeeCapacity(
    val employeeId: UUID,
    val employeeName: String,
    val skills: Map<String, Int>,
    val availablePercent: Int
)

data class ProjectDemand(
    val projectId: UUID,
    val projectName: String,
    val requiredSkills: List<SkillRequirement>,
    val totalRequiredFte: Int
)
