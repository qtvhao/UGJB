package com.ugjb.hr.employee.repository;

import com.ugjb.hr.employee.entity.EmployeeSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeSkillRepository extends JpaRepository<EmployeeSkill, UUID> {

    List<EmployeeSkill> findByEmployeeEmployeeId(UUID employeeId);

    @Query("SELECT es FROM EmployeeSkill es WHERE es.employee.employeeId = :employeeId AND es.skill.skillId = :skillId")
    Optional<EmployeeSkill> findByEmployeeIdAndSkillId(
            @Param("employeeId") UUID employeeId,
            @Param("skillId") UUID skillId);

    @Query("SELECT es FROM EmployeeSkill es JOIN FETCH es.skill WHERE es.employee.employeeId = :employeeId")
    List<EmployeeSkill> findByEmployeeIdWithSkill(@Param("employeeId") UUID employeeId);

    void deleteByEmployeeEmployeeIdAndSkillSkillId(UUID employeeId, UUID skillId);
}
