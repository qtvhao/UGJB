package com.ugjb.hr.employee.repository;

import com.ugjb.hr.employee.entity.Skill;
import com.ugjb.hr.employee.entity.SkillStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SkillRepository extends JpaRepository<Skill, UUID> {

    Optional<Skill> findByName(String name);

    Page<Skill> findByCategory(String category, Pageable pageable);

    Page<Skill> findByStatus(SkillStatus status, Pageable pageable);

    @Query("SELECT s FROM Skill s WHERE s.name LIKE %:searchTerm%")
    Page<Skill> searchByName(@Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT s FROM Skill s WHERE s.status = 'APPROVED'")
    List<Skill> findAllApproved();

    @Query("SELECT s FROM Skill s WHERE " +
           "(:category IS NULL OR s.category = :category) AND " +
           "(:status IS NULL OR s.status = :status)")
    Page<Skill> findByFilters(
            @Param("category") String category,
            @Param("status") SkillStatus status,
            Pageable pageable);
}
