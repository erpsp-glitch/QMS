package com.ERP.QMS.repository;

import com.ERP.QMS.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByDepartmentId(Long departmentId);
    List<Employee> findByStatus(Employee.EmployeeStatus status);
    List<Employee> findByRole(Employee.EmployeeRole role);
    List<Employee> findByDepartmentIdAndStatus(Long deptId, Employee.EmployeeStatus status);
}
