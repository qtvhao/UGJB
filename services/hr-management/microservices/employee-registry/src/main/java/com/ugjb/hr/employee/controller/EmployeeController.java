package com.ugjb.hr.employee.controller;

import com.ugjb.hr.employee.dto.*;
import com.ugjb.hr.employee.entity.EmploymentStatus;
import com.ugjb.hr.employee.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
@Tag(name = "Employees", description = "Employee management endpoints")
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    @Operation(summary = "Create a new employee")
    public ResponseEntity<EmployeeResponse> createEmployee(
            @Valid @RequestBody EmployeeRequest request) {
        EmployeeResponse response = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{employeeId}")
    @Operation(summary = "Get employee by ID")
    public ResponseEntity<EmployeeResponse> getEmployee(
            @PathVariable UUID employeeId) {
        EmployeeResponse response = employeeService.getEmployee(employeeId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{employeeId}")
    @Operation(summary = "Update employee")
    public ResponseEntity<EmployeeResponse> updateEmployee(
            @PathVariable UUID employeeId,
            @Valid @RequestBody EmployeeRequest request) {
        EmployeeResponse response = employeeService.updateEmployee(employeeId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "List employees with filtering")
    public ResponseEntity<PageResponse<EmployeeResponse>> listEmployees(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) EmploymentStatus status,
            @RequestParam(required = false) UUID managerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        PageResponse<EmployeeResponse> response = employeeService.listEmployees(
                department, status, managerId, page, size);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{employeeId}/skills")
    @Operation(summary = "Assign skill to employee")
    public ResponseEntity<EmployeeSkillResponse> assignSkill(
            @PathVariable UUID employeeId,
            @Valid @RequestBody AssignSkillRequest request) {
        EmployeeSkillResponse response = employeeService.assignSkillToEmployee(
                employeeId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{employeeId}/skills")
    @Operation(summary = "Get employee skills")
    public ResponseEntity<List<EmployeeSkillResponse>> getEmployeeSkills(
            @PathVariable UUID employeeId) {
        List<EmployeeSkillResponse> response = employeeService.getEmployeeSkills(employeeId);
        return ResponseEntity.ok(response);
    }
}
