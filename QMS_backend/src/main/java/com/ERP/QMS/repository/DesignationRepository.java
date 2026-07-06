package com.ERP.QMS.repository;

import com.ERP.QMS.model.Designation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DesignationRepository extends JpaRepository<Designation, Long> {

    List<Designation> findByActiveTrue();

    List<Designation> findByDepartmentIdAndActiveTrue(Long departmentId);

    List<Designation> findByDepartmentId(Long departmentId);

    boolean existsByNameAndDepartmentId(String name, Long departmentId);
}
