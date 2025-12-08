package com.ugjb.hr.employee.service;

import com.ugjb.hr.employee.dto.PageResponse;
import com.ugjb.hr.employee.dto.SkillRequest;
import com.ugjb.hr.employee.dto.SkillResponse;
import com.ugjb.hr.employee.entity.Skill;
import com.ugjb.hr.employee.entity.SkillStatus;
import com.ugjb.hr.employee.exception.BusinessRuleException;
import com.ugjb.hr.employee.exception.ResourceNotFoundException;
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
public class SkillService {

    private final SkillRepository skillRepository;

    @Transactional
    public SkillResponse createSkill(SkillRequest request) {
        log.info("Creating new skill request: {}", request.getName());

        skillRepository.findByName(request.getName()).ifPresent(s -> {
            throw new BusinessRuleException(
                    "Skill with name '" + request.getName() + "' already exists");
        });

        Skill skill = Skill.builder()
                .name(request.getName())
                .category(request.getCategory())
                .description(request.getDescription())
                .status(SkillStatus.PENDING)
                .build();

        Skill saved = skillRepository.save(skill);
        log.info("Skill request created with ID: {} (pending approval)", saved.getSkillId());
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public SkillResponse getSkill(UUID skillId) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Skill not found with ID: " + skillId));
        return mapToResponse(skill);
    }

    @Transactional
    public SkillResponse approveSkill(UUID skillId) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Skill not found with ID: " + skillId));

        if (skill.getStatus() != SkillStatus.PENDING) {
            throw new BusinessRuleException(
                    "Only pending skills can be approved");
        }

        skill.setStatus(SkillStatus.APPROVED);
        Skill saved = skillRepository.save(skill);
        log.info("Skill {} approved", skillId);
        return mapToResponse(saved);
    }

    @Transactional
    public SkillResponse rejectSkill(UUID skillId) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Skill not found with ID: " + skillId));

        if (skill.getStatus() != SkillStatus.PENDING) {
            throw new BusinessRuleException(
                    "Only pending skills can be rejected");
        }

        skill.setStatus(SkillStatus.REJECTED);
        Skill saved = skillRepository.save(skill);
        log.info("Skill {} rejected", skillId);
        return mapToResponse(saved);
    }

    @Transactional
    public SkillResponse updateSkill(UUID skillId, SkillRequest request) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Skill not found with ID: " + skillId));

        skill.setName(request.getName());
        skill.setCategory(request.getCategory());
        skill.setDescription(request.getDescription());

        Skill saved = skillRepository.save(skill);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<SkillResponse> listSkills(
            String category,
            SkillStatus status,
            String search,
            int page,
            int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Skill> skillPage;

        if (search != null && !search.isEmpty()) {
            skillPage = skillRepository.searchByName(search, pageable);
        } else {
            skillPage = skillRepository.findByFilters(category, status, pageable);
        }

        List<SkillResponse> content = skillPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PageResponse.<SkillResponse>builder()
                .content(content)
                .pageNumber(skillPage.getNumber())
                .pageSize(skillPage.getSize())
                .totalElements(skillPage.getTotalElements())
                .totalPages(skillPage.getTotalPages())
                .first(skillPage.isFirst())
                .last(skillPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public List<SkillResponse> getApprovedSkills() {
        return skillRepository.findAllApproved().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SkillResponse mapToResponse(Skill skill) {
        return SkillResponse.builder()
                .skillId(skill.getSkillId())
                .name(skill.getName())
                .category(skill.getCategory())
                .description(skill.getDescription())
                .status(skill.getStatus())
                .createdAt(skill.getCreatedAt())
                .updatedAt(skill.getUpdatedAt())
                .build();
    }
}
