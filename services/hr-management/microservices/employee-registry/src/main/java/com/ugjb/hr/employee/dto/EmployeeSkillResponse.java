package com.ugjb.hr.employee.dto;

import com.ugjb.hr.employee.entity.ProficiencyLevel;
import com.ugjb.hr.employee.entity.SkillSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSkillResponse {

    private UUID skillId;
    private String skillName;
    private String category;
    private ProficiencyLevel proficiency;
    private SkillSource source;
    private LocalDateTime lastUpdated;
}
