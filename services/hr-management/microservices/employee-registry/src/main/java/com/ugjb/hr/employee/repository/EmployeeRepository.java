package com.ugjb.hr.employee.repository;

import com.ugjb.hr.employee.entity.Employee;
import com.ugjb.hr.employee.entity.EmploymentStatus;
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
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    Optional<Employee> findByEmail(String email);

    Page<Employee> findByDepartment(String department, Pageable pageable);

    Page<Employee> findByEmploymentStatus(EmploymentStatus status, Pageable pageable);

    Page<Employee> findByManagerId(UUID managerId, Pageable pageable);

    List<Employee> findByManagerId(UUID managerId);

    @Query("SELECT e FROM Employee e WHERE " +
           "(:department IS NULL OR e.department = :department) AND " +
           "(:status IS NULL OR e.employmentStatus = :status) AND " +
           "(:managerId IS NULL OR e.managerId = :managerId)")
    Page<Employee> findByFilters(
            @Param("department") String department,
            @Param("status") EmploymentStatus status,
            @Param("managerId") UUID managerId,
            Pageable pageable);

    @Query("SELECT e FROM Employee e WHERE e.name LIKE %:name%")
    List<Employee> findByNameContaining(@Param("name") String name);
}
