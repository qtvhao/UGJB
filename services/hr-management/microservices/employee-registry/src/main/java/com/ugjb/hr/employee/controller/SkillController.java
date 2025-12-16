/**
 * Associated Frontend Files:
 *   - web/app/src/lib/api.ts (hrApi.skills - lines 62-69)
 *   - web/app/src/pages/hr/SkillsInventoryPage.tsx
 *   - web/app/src/pages/hr/PendingSkillsPage.tsx
 *   - web/app/src/pages/hr/SkillDevelopmentPage.tsx
 */
package com.ugjb.hr.employee.controller;

import com.ugjb.hr.employee.dto.PageResponse;
import com.ugjb.hr.employee.dto.SkillRequest;
import com.ugjb.hr.employee.dto.SkillResponse;
import com.ugjb.hr.employee.entity.SkillStatus;
import com.ugjb.hr.employee.service.SkillService;
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
@RequestMapping("/skills")
@RequiredArgsConstructor
@Tag(name = "Skills", description = "Skills taxonomy management endpoints")
public class SkillController {

    private final SkillService skillService;

    @PostMapping
    @Operation(summary = "Request new skill (pending admin approval)")
    public ResponseEntity<SkillResponse> createSkill(
            @Valid @RequestBody SkillRequest request) {
        SkillResponse response = skillService.createSkill(request);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    @GetMapping("/{skillId}")
    @Operation(summary = "Get skill by ID")
    public ResponseEntity<SkillResponse> getSkill(
            @PathVariable UUID skillId) {
        SkillResponse response = skillService.getSkill(skillId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{skillId}")
    @Operation(summary = "Update skill")
    public ResponseEntity<SkillResponse> updateSkill(
            @PathVariable UUID skillId,
            @Valid @RequestBody SkillRequest request) {
        SkillResponse response = skillService.updateSkill(skillId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{skillId}/approve")
    @Operation(summary = "Approve pending skill request")
    public ResponseEntity<SkillResponse> approveSkill(
            @PathVariable UUID skillId) {
        SkillResponse response = skillService.approveSkill(skillId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{skillId}/reject")
    @Operation(summary = "Reject pending skill request")
    public ResponseEntity<SkillResponse> rejectSkill(
            @PathVariable UUID skillId) {
        SkillResponse response = skillService.rejectSkill(skillId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "List skills with filtering")
    public ResponseEntity<PageResponse<SkillResponse>> listSkills(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) SkillStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        PageResponse<SkillResponse> response = skillService.listSkills(
                category, status, search, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/approved")
    @Operation(summary = "Get all approved skills (taxonomy)")
    public ResponseEntity<List<SkillResponse>> getApprovedSkills() {
        List<SkillResponse> response = skillService.getApprovedSkills();
        return ResponseEntity.ok(response);
    }
}
