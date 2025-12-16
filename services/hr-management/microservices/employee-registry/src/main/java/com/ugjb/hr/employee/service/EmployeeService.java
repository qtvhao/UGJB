/**
 * Associated Frontend Files:
 *   - web/app/src/lib/api.ts (hrApi.employees - lines 54-60)
 *   - web/app/src/pages/hr/EmployeesPage.tsx
 *   - web/app/src/pages/hr/EmployeeProfilePage.tsx
 */
package com.ugjb.hr.employee.service;

import com.ugjb.hr.employee.dto.*;
import com.ugjb.hr.employee.entity.*;
import com.ugjb.hr.employee.exception.BusinessRuleException;
import com.ugjb.hr.employee.exception.ResourceNotFoundException;
import com.ugjb.hr.employee.repository.EmployeeRepository;
import com.ugjb.hr.employee.repository.EmployeeSkillRepository;
import com.ugjb.hr.employee.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final SkillRepository skillRepository;
    private final EmployeeSkillRepository employeeSkillRepository;

    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        log.info("Creating new employee: {}", request.getName());

        Employee employee = Employee.builder()
                .name(request.getName())
                .role(request.getRole())
                .department(request.getDepartment())
                .team(request.getTeam())
                .employmentStatus(request.getEmploymentStatus() != null ?
                        request.getEmploymentStatus() : EmploymentStatus.ACTIVE)
                .fteAllocation(request.getFteAllocation() != null ?
                        request.getFteAllocation() : 100)
                .workLocation(request.getWorkLocation())
                .managerId(request.getManagerId())
                .hireDate(request.getHireDate())
                .email(request.getEmail())
                .build();

        Employee saved = employeeRepository.save(employee);
        log.info("Employee created with ID: {}", saved.getEmployeeId());
        return mapToResponse(saved, List.of());
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployee(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee not found with ID: " + employeeId));

        List<EmployeeSkill> skills = employeeSkillRepository
                .findByEmployeeIdWithSkill(employeeId);

        return mapToResponse(employee, skills);
    }

    @Transactional
    public EmployeeResponse updateEmployee(UUID employeeId, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee not found with ID: " + employeeId));

        employee.setName(request.getName());
        employee.setRole(request.getRole());
        employee.setDepartment(request.getDepartment());
        employee.setTeam(request.getTeam());
        if (request.getEmploymentStatus() != null) {
            employee.setEmploymentStatus(request.getEmploymentStatus());
        }
        if (request.getFteAllocation() != null) {
            employee.setFteAllocation(request.getFteAllocation());
        }
        employee.setWorkLocation(request.getWorkLocation());
        employee.setManagerId(request.getManagerId());
        employee.setHireDate(request.getHireDate());
        employee.setEmail(request.getEmail());

        Employee saved = employeeRepository.save(employee);
        List<EmployeeSkill> skills = employeeSkillRepository
                .findByEmployeeIdWithSkill(employeeId);

        return mapToResponse(saved, skills);
    }

    @Transactional(readOnly = true)
    public PageResponse<EmployeeResponse> listEmployees(
            String department,
            EmploymentStatus status,
            UUID managerId,
            int page,
            int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Employee> employeePage = employeeRepository.findByFilters(
                department, status, managerId, pageable);

        List<EmployeeResponse> content = employeePage.getContent().stream()
                .map(e -> mapToResponse(e, List.of()))
                .collect(Collectors.toList());

        return PageResponse.<EmployeeResponse>builder()
                .content(content)
                .pageNumber(employeePage.getNumber())
                .pageSize(employeePage.getSize())
                .totalElements(employeePage.getTotalElements())
                .totalPages(employeePage.getTotalPages())
                .first(employeePage.isFirst())
                .last(employeePage.isLast())
                .build();
    }

    @Transactional
    public EmployeeSkillResponse assignSkillToEmployee(
            UUID employeeId, AssignSkillRequest request) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee not found with ID: " + employeeId));

        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Skill not found with ID: " + request.getSkillId()));

        if (skill.getStatus() != SkillStatus.APPROVED) {
            throw new BusinessRuleException(
                    "Skill not found in taxonomy. Please request admin approval for new skills");
        }

        EmployeeSkill employeeSkill = employeeSkillRepository
                .findByEmployeeIdAndSkillId(employeeId, request.getSkillId())
                .orElse(EmployeeSkill.builder()
                        .employee(employee)
                        .skill(skill)
                        .build());

        employeeSkill.setProficiency(request.getProficiency());
        employeeSkill.setSource(request.getSource());

        EmployeeSkill saved = employeeSkillRepository.save(employeeSkill);

        return EmployeeSkillResponse.builder()
                .skillId(skill.getSkillId())
                .skillName(skill.getName())
                .category(skill.getCategory())
                .proficiency(saved.getProficiency())
                .source(saved.getSource())
                .lastUpdated(saved.getLastUpdated())
                .build();
    }

    @Transactional(readOnly = true)
    public List<EmployeeSkillResponse> getEmployeeSkills(UUID employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException(
                    "Employee not found with ID: " + employeeId);
        }

        return employeeSkillRepository.findByEmployeeIdWithSkill(employeeId).stream()
                .map(es -> EmployeeSkillResponse.builder()
                        .skillId(es.getSkill().getSkillId())
                        .skillName(es.getSkill().getName())
                        .category(es.getSkill().getCategory())
                        .proficiency(es.getProficiency())
                        .source(es.getSource())
                        .lastUpdated(es.getLastUpdated())
                        .build())
                .collect(Collectors.toList());
    }

    private EmployeeResponse mapToResponse(Employee employee, List<EmployeeSkill> skills) {
        List<EmployeeSkillResponse> skillResponses = skills.stream()
                .map(es -> EmployeeSkillResponse.builder()
                        .skillId(es.getSkill().getSkillId())
                        .skillName(es.getSkill().getName())
                        .category(es.getSkill().getCategory())
                        .proficiency(es.getProficiency())
                        .source(es.getSource())
                        .lastUpdated(es.getLastUpdated())
                        .build())
                .collect(Collectors.toList());

        return EmployeeResponse.builder()
                .employeeId(employee.getEmployeeId())
                .name(employee.getName())
                .role(employee.getRole())
                .department(employee.getDepartment())
                .team(employee.getTeam())
                .employmentStatus(employee.getEmploymentStatus())
                .fteAllocation(employee.getFteAllocation())
                .workLocation(employee.getWorkLocation())
                .managerId(employee.getManagerId())
                .hireDate(employee.getHireDate())
                .email(employee.getEmail())
                .skills(skillResponses)
                .createdAt(employee.getCreatedAt())
                .updatedAt(employee.getUpdatedAt())
                .build();
    }
}
