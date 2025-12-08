package com.ugjb.hr.employee.dto;

import com.ugjb.hr.employee.entity.ProficiencyLevel;
import com.ugjb.hr.employee.entity.SkillSource;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignSkillRequest {

    @NotNull(message = "Skill ID is required")
    private UUID skillId;

    @NotNull(message = "Proficiency level is required")
    private ProficiencyLevel proficiency;

    @NotNull(message = "Skill source is required")
    private SkillSource source;
}
