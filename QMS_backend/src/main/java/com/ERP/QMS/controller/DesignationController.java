package com.ERP.QMS.controller;

import com.ERP.QMS.dto.ApiResponse;
import com.ERP.QMS.model.Designation;
import com.ERP.QMS.repository.DesignationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/designations")
@RequiredArgsConstructor
public class DesignationController {

    private final DesignationRepository repo;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Designation>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(repo.findAll()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Designation>>> getAllActive() {
        return ResponseEntity.ok(ApiResponse.ok(repo.findByActiveTrue()));
    }

    @GetMapping("/department/{deptId}")
    public ResponseEntity<ApiResponse<List<Designation>>> getByDepartment(@PathVariable Long deptId) {
        return ResponseEntity.ok(ApiResponse.ok(repo.findByDepartmentId(deptId)));
    }

    @GetMapping("/department/{deptId}/active")
    public ResponseEntity<ApiResponse<List<Designation>>> getActiveByDepartment(@PathVariable Long deptId) {
        return ResponseEntity.ok(ApiResponse.ok(repo.findByDepartmentIdAndActiveTrue(deptId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Designation>> getById(@PathVariable Long id) {
        return repo.findById(id)
            .map(d -> ResponseEntity.ok(ApiResponse.ok(d)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<Designation>> create(@RequestBody Designation designation) {
        if (designation.getDepartment() != null && designation.getDepartment().getId() != null
            && repo.existsByNameAndDepartmentId(designation.getName(), designation.getDepartment().getId())) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.fail("Designation already exists for this department"));
        }
        return ResponseEntity.ok(ApiResponse.ok("Designation created", repo.save(designation)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<Designation>> update(
            @PathVariable Long id,
            @RequestBody Designation update) {
        return repo.findById(id).map(existing -> {
            existing.setName(update.getName());
            existing.setDescription(update.getDescription());
            existing.setActive(update.isActive());
            if (update.getDepartment() != null) existing.setDepartment(update.getDepartment());
            return ResponseEntity.ok(ApiResponse.ok("Updated", repo.save(existing)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted"));
    }
}
