package com.ugjb.hr.employee.dto;

import com.ugjb.hr.employee.entity.EmploymentStatus;
import com.ugjb.hr.employee.entity.WorkLocation;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 200)
    private String name;

    @NotBlank(message = "Role is required")
    @Size(max = 100)
    private String role;

    @NotBlank(message = "Department is required")
    @Size(max = 100)
    private String department;

    @Size(max = 100)
    private String team;

    private EmploymentStatus employmentStatus;

    @Min(value = 0, message = "FTE allocation must be between 0 and 100")
    @Max(value = 100, message = "FTE allocation must be between 0 and 100")
    private Integer fteAllocation;

    private WorkLocation workLocation;

    private UUID managerId;

    @NotNull(message = "Hire date is required")
    private LocalDate hireDate;

    @Email
    @Size(max = 255)
    private String email;
}
