package com.ugjb.hr.allocation.repository

import com.ugjb.hr.allocation.entity.Project
import com.ugjb.hr.allocation.entity.ProjectStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface ProjectRepository : JpaRepository<Project, UUID> {

    fun findByStatus(status: ProjectStatus): List<Project>

    fun findByNameContainingIgnoreCase(name: String): List<Project>
}
