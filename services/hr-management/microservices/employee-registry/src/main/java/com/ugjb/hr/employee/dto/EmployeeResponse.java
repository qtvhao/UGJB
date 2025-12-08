package com.ugjb.hr.employee.dto;

import com.ugjb.hr.employee.entity.EmploymentStatus;
import com.ugjb.hr.employee.entity.WorkLocation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {

    private UUID employeeId;
    private String name;
    private String role;
    private String department;
    private String team;
    private EmploymentStatus employmentStatus;
    private Integer fteAllocation;
    private WorkLocation workLocation;
    private UUID managerId;
    private LocalDate hireDate;
    private String email;
    private List<EmployeeSkillResponse> skills;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
