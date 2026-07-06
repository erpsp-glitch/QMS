

package com.ERP.QMS.controller;

import com.ERP.QMS.dto.ApiResponse;
import com.ERP.QMS.model.Department;
import com.ERP.QMS.repository.DepartmentRepository;
import com.ERP.QMS.service.SequenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentRepository departmentRepository;
    private final SequenceService sequenceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Department>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(departmentRepository.findAll()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Department>>> getActive() {
        return ResponseEntity.ok(ApiResponse.ok(departmentRepository.findByActive(true)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Department>> getById(@PathVariable Long id) {
        Department dept = departmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Department not found: " + id));
        return ResponseEntity.ok(ApiResponse.ok(dept));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR')")
    public ResponseEntity<ApiResponse<Department>> create(@RequestBody Department dept) {
        // Validate required fields
        if (dept.getName() == null || dept.getName().isBlank()) {
            throw new RuntimeException("Department Name is required");
        }
        
        // Check for duplicate name
        if (departmentRepository.existsByName(dept.getName())) {
            throw new RuntimeException("Department with name '" + dept.getName() + "' already exists");
        }
        
        // Auto-generate department ID
        dept.setDepartmentId(sequenceService.nextDepartmentIdFormatted());
        
        // Auto-generate department code if not provided
        if (dept.getDepartmentCode() == null || dept.getDepartmentCode().isBlank()) {
            String code = dept.getName().replaceAll("[^A-Za-z]", "").toUpperCase();
            dept.setDepartmentCode(code.length() > 4 ? code.substring(0, 4) : code);
        }
        
        // Set default active status if not set
        dept.setActive(true);
        
        return ResponseEntity.ok(ApiResponse.ok("Department created", departmentRepository.save(dept)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<Department>> update(@PathVariable Long id, @RequestBody Department updated) {
        Department existing = departmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Department not found: " + id));
        
        // Update only the fields that exist in the model
        existing.setName(updated.getName());
        existing.setDepartmentCode(updated.getDepartmentCode());
        existing.setDepartmentHead(updated.getDepartmentHead());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setLocation(updated.getLocation());
        existing.setProcessName(updated.getProcessName());
        existing.setProcessOwner(updated.getProcessOwner());
        existing.setDescription(updated.getDescription());
        existing.setRemarks(updated.getRemarks());
        existing.setActive(updated.isActive());
        
        return ResponseEntity.ok(ApiResponse.ok("Updated", departmentRepository.save(existing)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new RuntimeException("Department not found: " + id);
        }
        departmentRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted"));
    }
}