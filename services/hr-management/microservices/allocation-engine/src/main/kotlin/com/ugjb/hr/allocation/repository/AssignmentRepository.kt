package com.ugjb.hr.allocation.repository

import com.ugjb.hr.allocation.entity.Assignment
import com.ugjb.hr.allocation.entity.AssignmentStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface AssignmentRepository : JpaRepository<Assignment, UUID> {

    fun findByEmployeeIdAndStatus(employeeId: UUID, status: AssignmentStatus): List<Assignment>

    fun findByEmployeeId(employeeId: UUID): List<Assignment>

    fun findByProjectIdAndStatus(projectId: UUID, status: AssignmentStatus): List<Assignment>

    fun findByStatus(status: AssignmentStatus, pageable: Pageable): Page<Assignment>

    @Query("""
        SELECT COALESCE(SUM(a.allocationPercent), 0)
        FROM Assignment a
        WHERE a.employeeId = :employeeId
        AND a.status = 'ACTIVE'
        AND (:excludeAssignmentId IS NULL OR a.assignmentId != :excludeAssignmentId)
    """)
    fun sumActiveAllocationByEmployeeId(
        @Param("employeeId") employeeId: UUID,
        @Param("excludeAssignmentId") excludeAssignmentId: UUID?
    ): Int

    @Query("""
        SELECT a FROM Assignment a
        WHERE (:employeeId IS NULL OR a.employeeId = :employeeId)
        AND (:projectId IS NULL OR a.projectId = :projectId)
        AND (:status IS NULL OR a.status = :status)
    """)
    fun findWithFilters(
        @Param("employeeId") employeeId: UUID?,
        @Param("projectId") projectId: UUID?,
        @Param("status") status: AssignmentStatus?,
        pageable: Pageable
    ): Page<Assignment>

    @Query("""
        SELECT COUNT(a) FROM Assignment a
        WHERE (:employeeId IS NULL OR a.employeeId = :employeeId)
        AND (:projectId IS NULL OR a.projectId = :projectId)
        AND (:status IS NULL OR a.status = :status)
    """)
    fun countWithFilters(
        @Param("employeeId") employeeId: UUID?,
        @Param("projectId") projectId: UUID?,
        @Param("status") status: AssignmentStatus?
    ): Long

    fun findByEmployeeIdAndProjectIdAndStatus(
        employeeId: UUID,
        projectId: UUID,
        status: AssignmentStatus
    ): Assignment?
}
