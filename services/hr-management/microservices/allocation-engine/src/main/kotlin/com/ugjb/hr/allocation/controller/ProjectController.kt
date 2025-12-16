/**
 * Associated Frontend Files:
 *   - web/app/src/lib/api.ts (projectsApi - lines 85-89)
 *   - web/app/src/pages/Dashboard.tsx
 */
package com.ugjb.hr.allocation.controller

import com.ugjb.hr.allocation.entity.ProjectStatus
import com.ugjb.hr.allocation.service.CreateProjectRequest
import com.ugjb.hr.allocation.service.ProjectResponse
import com.ugjb.hr.allocation.service.ProjectService
import com.ugjb.hr.allocation.service.UpdateProjectRequest
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/projects")
@Tag(name = "Projects", description = "Project management endpoints for allocation")
class ProjectController(
    private val projectService: ProjectService
) {

    @PostMapping
    @Operation(summary = "Create a new project")
    fun createProject(
        @Valid @RequestBody request: CreateProjectRequest
    ): ResponseEntity<ProjectResponse> {
        val response = projectService.createProject(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @GetMapping("/{projectId}")
    @Operation(summary = "Get project by ID")
    fun getProject(
        @PathVariable projectId: UUID
    ): ResponseEntity<ProjectResponse> {
        val response = projectService.getProject(projectId)
        return ResponseEntity.ok(response)
    }

    @PutMapping("/{projectId}")
    @Operation(summary = "Update a project")
    fun updateProject(
        @PathVariable projectId: UUID,
        @Valid @RequestBody request: UpdateProjectRequest
    ): ResponseEntity<ProjectResponse> {
        val response = projectService.updateProject(projectId, request)
        return ResponseEntity.ok(response)
    }

    @GetMapping
    @Operation(summary = "List projects with optional status filter")
    fun listProjects(
        @RequestParam(required = false) status: ProjectStatus?
    ): ResponseEntity<List<ProjectResponse>> {
        val response = projectService.listProjects(status)
        return ResponseEntity.ok(response)
    }
}
