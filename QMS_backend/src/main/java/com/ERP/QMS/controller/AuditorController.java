package com.ERP.QMS.controller;

import com.ERP.QMS.dto.ApiResponse;
import com.ERP.QMS.model.Auditor;
import com.ERP.QMS.repository.AuditorRepository;
import com.ERP.QMS.service.SequenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auditors")
@RequiredArgsConstructor
public class AuditorController {

    private final AuditorRepository auditorRepository;
    private final SequenceService sequenceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Auditor>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(auditorRepository.findAll()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Auditor>>> getActive() {
        return ResponseEntity.ok(ApiResponse.ok(
            auditorRepository.findByStatus(Auditor.AuditorStatus.ACTIVE)));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<Auditor>>> getByType(@PathVariable Auditor.AuditorType type) {
        return ResponseEntity.ok(ApiResponse.ok(auditorRepository.findByType(type)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Auditor>> getById(@PathVariable Long id) {
        Auditor auditor = auditorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Auditor not found: " + id));
        return ResponseEntity.ok(ApiResponse.ok(auditor));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<Auditor>> create(@RequestBody Auditor auditor) {
        if (auditor.getAuditorCode() == null || auditor.getAuditorCode().isBlank()) {
            auditor.setAuditorCode(sequenceService.nextAuditorCode());
        }
        if (auditor.getCertifications() == null) {
            auditor.setCertifications(new java.util.ArrayList<>());
        }
        return ResponseEntity.ok(ApiResponse.ok("Auditor created", auditorRepository.save(auditor)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<Auditor>> update(@PathVariable Long id, @RequestBody Auditor updated) {
        Auditor existing = auditorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Auditor not found: " + id));
        existing.setName(updated.getName());
        existing.setAuditorCode(updated.getAuditorCode());
        existing.setType(updated.getType());
        existing.setOrganization(updated.getOrganization());
        existing.setQualification(updated.getQualification());
        existing.setCertificationNumber(updated.getCertificationNumber());
        existing.setLeadAuditorCertNo(updated.getLeadAuditorCertNo());
        existing.setCertIssueDate(updated.getCertIssueDate());
        existing.setCertExpiryDate(updated.getCertExpiryDate());
        existing.setExperienceYears(updated.getExperienceYears());
        existing.setAuditHours(updated.getAuditHours());
        existing.setAreaOfExpertise(updated.getAreaOfExpertise());
        existing.setCertifications(updated.getCertifications());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setStatus(updated.getStatus());
        existing.setRemarks(updated.getRemarks());
        return ResponseEntity.ok(ApiResponse.ok("Updated", auditorRepository.save(existing)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        auditorRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted"));
    }
}
