package com.ugjb.hr.allocation.service

import com.ugjb.hr.allocation.dto.*
import org.jgrapht.Graph
import org.jgrapht.alg.matching.MaximumWeightBipartiteMatching
import org.jgrapht.graph.DefaultWeightedEdge
import org.jgrapht.graph.SimpleWeightedGraph
import org.springframework.stereotype.Service
import java.util.*

@Service
class OptimizationService {

    fun computeOptimalAllocation(
        employees: List<EmployeeCapacity>,
        projects: List<ProjectDemand>,
        maxAllocationPerEmployee: Int
    ): OptimalAllocationResponse {
        if (employees.isEmpty() || projects.isEmpty()) {
            return OptimalAllocationResponse(
                proposedAssignments = emptyList(),
                totalCoveragePercent = 0,
                unmetRequirements = projects.flatMap { p ->
                    p.requiredSkills.map { "${p.projectName}: ${it.skillName}" }
                }
            )
        }

        // Build bipartite graph: employees <-> project-skill requirements
        val graph: Graph<String, DefaultWeightedEdge> = SimpleWeightedGraph(DefaultWeightedEdge::class.java)

        val employeeNodes = mutableSetOf<String>()
        val requirementNodes = mutableSetOf<String>()

        // Add employee nodes
        employees.forEach { emp ->
            val nodeId = "EMP_${emp.employeeId}"
            graph.addVertex(nodeId)
            employeeNodes.add(nodeId)
        }

        // Add requirement nodes and edges
        projects.forEach { project ->
            project.requiredSkills.forEach { req ->
                val reqNodeId = "REQ_${project.projectId}_${req.skillName}"
                graph.addVertex(reqNodeId)
                requirementNodes.add(reqNodeId)

                // Create edges between employees and requirements they can fulfill
                employees.forEach { emp ->
                    val empNodeId = "EMP_${emp.employeeId}"
                    val skillProficiency = emp.skills[req.skillName] ?: 0

                    if (skillProficiency >= req.minProficiency && emp.availablePercent > 0) {
                        val edge = graph.addEdge(empNodeId, reqNodeId)
                        if (edge != null) {
                            // Weight based on proficiency match and available capacity
                            val matchScore = calculateMatchScore(
                                skillProficiency,
                                req.minProficiency,
                                emp.availablePercent,
                                req.requiredFtePercent
                            )
                            graph.setEdgeWeight(edge, matchScore)
                        }
                    }
                }
            }
        }

        // Find maximum weight bipartite matching
        val matching = MaximumWeightBipartiteMatching(graph, employeeNodes, requirementNodes)
        val matchResult = matching.matching

        // Convert matching to proposed assignments
        val proposedAssignments = mutableListOf<ProposedAssignment>()
        val fulfilledRequirements = mutableSetOf<String>()

        matchResult.edges.forEach { edge ->
            val source = graph.getEdgeSource(edge)
            val target = graph.getEdgeTarget(edge)

            val empNode = if (source.startsWith("EMP_")) source else target
            val reqNode = if (source.startsWith("REQ_")) source else target

            val empId = UUID.fromString(empNode.removePrefix("EMP_"))
            val employee = employees.find { it.employeeId == empId } ?: return@forEach

            // Parse project ID and skill from requirement node
            val reqParts = reqNode.removePrefix("REQ_").split("_", limit = 2)
            val projectId = UUID.fromString(reqParts[0])
            val skillName = reqParts[1]

            val project = projects.find { it.projectId == projectId } ?: return@forEach
            val requirement = project.requiredSkills.find { it.skillName == skillName } ?: return@forEach

            // Calculate allocation (minimum of available and required)
            val proposedAllocation = minOf(
                employee.availablePercent,
                requirement.requiredFtePercent,
                maxAllocationPerEmployee
            )

            proposedAssignments.add(
                ProposedAssignment(
                    employeeId = empId,
                    employeeName = employee.employeeName,
                    projectId = projectId,
                    proposedAllocationPercent = proposedAllocation,
                    matchedSkills = listOf(skillName),
                    matchScore = graph.getEdgeWeight(edge)
                )
            )

            fulfilledRequirements.add(reqNode)
        }

        // Calculate unmet requirements
        val unmetRequirements = requirementNodes
            .filter { it !in fulfilledRequirements }
            .map { reqNode ->
                val parts = reqNode.removePrefix("REQ_").split("_", limit = 2)
                val projectId = UUID.fromString(parts[0])
                val skillName = parts[1]
                val project = projects.find { it.projectId == projectId }
                "${project?.projectName ?: projectId}: $skillName"
            }

        // Calculate total coverage
        val totalRequired = projects.sumOf { p -> p.requiredSkills.sumOf { it.requiredFtePercent } }
        val totalAllocated = proposedAssignments.sumOf { it.proposedAllocationPercent }
        val coveragePercent = if (totalRequired > 0) {
            (totalAllocated * 100) / totalRequired
        } else {
            100
        }

        return OptimalAllocationResponse(
            proposedAssignments = proposedAssignments,
            totalCoveragePercent = coveragePercent,
            unmetRequirements = unmetRequirements
        )
    }

    private fun calculateMatchScore(
        actualProficiency: Int,
        requiredProficiency: Int,
        availablePercent: Int,
        requiredPercent: Int
    ): Double {
        // Score based on how well the employee matches the requirement
        val proficiencyBonus = (actualProficiency - requiredProficiency).coerceAtLeast(0) * 0.1
        val capacityFit = minOf(availablePercent.toDouble() / requiredPercent, 1.0)

        return (actualProficiency.toDouble() / 100) * capacityFit + proficiencyBonus
    }
}
