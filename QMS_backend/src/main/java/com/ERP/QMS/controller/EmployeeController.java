package com.ERP.QMS.controller;

import com.ERP.QMS.dto.ApiResponse;
import com.ERP.QMS.model.Department;
import com.ERP.QMS.model.Employee;
import com.ERP.QMS.repository.DepartmentRepository;
import com.ERP.QMS.repository.EmployeeRepository;
import com.ERP.QMS.service.SequenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final SequenceService sequenceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Employee>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(employeeRepository.findAll()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Employee>>> getActive() {
        return ResponseEntity.ok(ApiResponse.ok(
            employeeRepository.findByStatus(Employee.EmployeeStatus.ACTIVE)));
    }

    @GetMapping("/department/{deptId}")
    public ResponseEntity<ApiResponse<List<Employee>>> getByDepartment(@PathVariable Long deptId) {
        return ResponseEntity.ok(ApiResponse.ok(employeeRepository.findByDepartmentId(deptId)));
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<ApiResponse<List<Employee>>> getByRole(@PathVariable String role) {
        try {
            Employee.EmployeeRole r = Employee.EmployeeRole.valueOf(role.toUpperCase());
            return ResponseEntity.ok(ApiResponse.ok(employeeRepository.findByRole(r)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.ok(ApiResponse.ok(List.of()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Employee>> getById(@PathVariable Long id) {
        Employee emp = employeeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee not found: " + id));
        return ResponseEntity.ok(ApiResponse.ok(emp));
    }

    @PostMapping
@PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
public ResponseEntity<ApiResponse<Employee>> create(@RequestBody Employee employee) {
    // Always generate employee ID for new employees
    employee.setEmployeeId(sequenceService.nextEmployeeId());
    
    // Log the generated ID for debugging
    System.out.println("Generated Employee ID: " + employee.getEmployeeId());
    
    resolveDepartment(employee);
    
    // Save and return the employee with generated ID
    Employee savedEmployee = employeeRepository.save(employee);
    
    // Log the saved employee ID
    System.out.println("Saved Employee with ID: " + savedEmployee.getEmployeeId());
    
    return ResponseEntity.ok(ApiResponse.ok(
        "Employee created with ID: " + savedEmployee.getEmployeeId(), 
        savedEmployee
    ));
}

@PutMapping("/{id}")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
public ResponseEntity<ApiResponse<Employee>> update(@PathVariable Long id, @RequestBody Employee updated) {
    Employee existing = employeeRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Employee not found: " + id));
    
    // Preserve the existing employee ID
    // Only update if a valid non-empty ID is provided
    if (updated.getEmployeeId() != null && !updated.getEmployeeId().isBlank() 
            && !updated.getEmployeeId().isEmpty()) {
        existing.setEmployeeId(updated.getEmployeeId());
    }
    // Otherwise keep the existing ID
    
    existing.setFirstName(updated.getFirstName());
    existing.setLastName(updated.getLastName());
    existing.setDesignation(updated.getDesignation());
    existing.setReportingToId(updated.getReportingToId());
    existing.setReportingToName(updated.getReportingToName());
    existing.setEmail(updated.getEmail());
    existing.setPersonalEmail(updated.getPersonalEmail());
    existing.setPhone(updated.getPhone());
    existing.setAlternativeNumber(updated.getAlternativeNumber());
    existing.setJoiningDate(updated.getJoiningDate());
    existing.setDateOfBirth(updated.getDateOfBirth());
    existing.setHighestQualification(updated.getHighestQualification());
    existing.setProfessionalCertifications(updated.getProfessionalCertifications());
    existing.setSkills(updated.getSkills());
    existing.setYearsOfExperience(updated.getYearsOfExperience());
    existing.setRole(updated.getRole());
    existing.setStatus(updated.getStatus());
    existing.setRemarks(updated.getRemarks());
    
    if (updated.getDepartment() != null && updated.getDepartment().getId() != null) {
        existing.setDepartment(departmentRepository.findById(updated.getDepartment().getId()).orElse(null));
    } else {
        existing.setDepartment(null);
    }
    
    Employee updatedEmployee = employeeRepository.save(existing);
    return ResponseEntity.ok(ApiResponse.ok("Employee updated", updatedEmployee));
}


    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        employeeRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted"));
    }

    private void resolveDepartment(Employee emp) {
        if (emp.getDepartment() != null && emp.getDepartment().getId() != null) {
            Department dept = departmentRepository.findById(emp.getDepartment().getId()).orElse(null);
            emp.setDepartment(dept);
        }
    }
}
