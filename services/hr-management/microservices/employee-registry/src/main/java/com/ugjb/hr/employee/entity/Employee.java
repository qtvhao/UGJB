package com.ugjb.hr.employee.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "hr_employees")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "employee_id")
    private UUID employeeId;

    @NotBlank(message = "Name is required")
    @Size(max = 200)
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Role is required")
    @Size(max = 100)
    @Column(nullable = false)
    private String role;

    @NotBlank(message = "Department is required")
    @Size(max = 100)
    @Column(nullable = false)
    private String department;

    @Size(max = 100)
    private String team;

    @NotNull(message = "Employment status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "employment_status", nullable = false)
    private EmploymentStatus employmentStatus;

    @Min(0)
    @Max(100)
    @Column(name = "fte_allocation", nullable = false)
    private Integer fteAllocation;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_location")
    private WorkLocation workLocation;

    @Column(name = "manager_id")
    private UUID managerId;

    @NotNull(message = "Hire date is required")
    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;

    @Email
    @Size(max = 255)
    @Column(unique = true)
    private String email;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (fteAllocation == null) {
            fteAllocation = 100;
        }
        if (employmentStatus == null) {
            employmentStatus = EmploymentStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
