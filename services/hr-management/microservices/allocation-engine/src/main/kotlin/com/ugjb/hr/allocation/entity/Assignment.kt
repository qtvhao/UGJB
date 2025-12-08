package com.ugjb.hr.allocation.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "hr_assignments")
data class Assignment(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "assignment_id")
    val assignmentId: UUID? = null,

    @Column(name = "employee_id", nullable = false)
    val employeeId: UUID,

    @Column(name = "project_id", nullable = false)
    val projectId: UUID,

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    var role: AssignmentRole,

    @Column(name = "allocation_percent", nullable = false)
    var allocationPercent: Int,

    @Column(name = "start_date", nullable = false)
    val startDate: LocalDate,

    @Column(name = "end_date")
    var endDate: LocalDate?,

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    var status: AssignmentStatus = AssignmentStatus.ACTIVE,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
) {
    @PreUpdate
    fun preUpdate() {
        updatedAt = LocalDateTime.now()
    }
}

enum class AssignmentRole {
    LEAD,
    CONTRIBUTOR,
    ADVISOR
}

enum class AssignmentStatus {
    ACTIVE,
    INACTIVE,
    PENDING
}
