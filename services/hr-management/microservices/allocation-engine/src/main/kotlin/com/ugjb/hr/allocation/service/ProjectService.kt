package com.ugjb.hr.allocation.service

import com.ugjb.hr.allocation.entity.Project
import com.ugjb.hr.allocation.entity.ProjectStatus
import com.ugjb.hr.allocation.exception.ResourceNotFoundException
import com.ugjb.hr.allocation.repository.ProjectRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.*

data class CreateProjectRequest(
    val name: String,
    val description: String? = null,
    val startDate: LocalDate? = null,
    val endDate: LocalDate? = null,
    val requiredFte: Int = 0
)

data class UpdateProjectRequest(
    val name: String? = null,
    val description: String? = null,
    val status: ProjectStatus? = null,
    val endDate: LocalDate? = null,
    val requiredFte: Int? = null
)

data class ProjectResponse(
    val projectId: UUID,
    val name: String,
    val description: String?,
    val status: ProjectStatus,
    val startDate: LocalDate?,
    val endDate: LocalDate?,
    val requiredFte: Int
)

@Service
class ProjectService(
    private val projectRepository: ProjectRepository
) {

    @Transactional
    fun createProject(request: CreateProjectRequest): ProjectResponse {
        val project = Project(
            name = request.name,
            description = request.description,
            startDate = request.startDate,
            endDate = request.endDate,
            requiredFte = request.requiredFte
        )
        val saved = projectRepository.save(project)
        return toResponse(saved)
    }

    fun getProject(projectId: UUID): ProjectResponse {
        val project = projectRepository.findById(projectId)
            .orElseThrow { ResourceNotFoundException("Project not found: $projectId") }
        return toResponse(project)
    }

    @Transactional
    fun updateProject(projectId: UUID, request: UpdateProjectRequest): ProjectResponse {
        val project = projectRepository.findById(projectId)
            .orElseThrow { ResourceNotFoundException("Project not found: $projectId") }

        request.name?.let { project.name = it }
        request.description?.let { project.description = it }
        request.status?.let { project.status = it }
        request.endDate?.let { project.endDate = it }
        request.requiredFte?.let { project.requiredFte = it }

        val saved = projectRepository.save(project)
        return toResponse(saved)
    }

    fun listProjects(status: ProjectStatus?): List<ProjectResponse> {
        val projects = status?.let {
            projectRepository.findByStatus(it)
        } ?: projectRepository.findAll()

        return projects.map { toResponse(it) }
    }

    private fun toResponse(project: Project): ProjectResponse {
        return ProjectResponse(
            projectId = project.projectId!!,
            name = project.name,
            description = project.description,
            status = project.status,
            startDate = project.startDate,
            endDate = project.endDate,
            requiredFte = project.requiredFte
        )
    }
}
