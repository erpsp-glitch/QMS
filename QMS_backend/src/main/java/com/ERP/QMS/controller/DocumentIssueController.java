package com.ERP.QMS.controller;

import com.ERP.QMS.dto.ApiResponse;
import com.ERP.QMS.model.IssueRegister;
import com.ERP.QMS.repository.IssueRegisterRepository;
import com.ERP.QMS.service.SequenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Document Issue Register — tracks controlled copy issuance to employees.
 * Mounted at /document-issues (separate from /issue-register which handles Quality Issues).
 */
@RestController
@RequestMapping("/document-issues")
@RequiredArgsConstructor
public class DocumentIssueController {

    private final IssueRegisterRepository repo;
    private final SequenceService sequenceService;

    // ── GET ALL ────────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<List<IssueRegister>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(repo.findAll()));
    }

    // ── GET BY CERT ────────────────────────────────────────────────────────────

    @GetMapping("/certification/{certId}")
    public ResponseEntity<ApiResponse<List<IssueRegister>>> getByCertification(@PathVariable Long certId) {
        return ResponseEntity.ok(ApiResponse.ok(repo.findByCertificationId(certId)));
    }

    // ── GET BY DOCUMENT ────────────────────────────────────────────────────────

    @GetMapping("/document/{docId}")
    public ResponseEntity<ApiResponse<List<IssueRegister>>> getByDocument(@PathVariable Long docId) {
        return ResponseEntity.ok(ApiResponse.ok(repo.findByDocumentId(docId)));
    }

    // ── GET BY ID ─────────────────────────────────────────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<IssueRegister>> getById(@PathVariable Long id) {
        return repo.findById(id)
            .map(i -> ResponseEntity.ok(ApiResponse.ok(i)))
            .orElse(ResponseEntity.notFound().build());
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<IssueRegister>> create(@RequestBody IssueRegister issue) {
        String certCode = (issue.getCertification() != null && issue.getCertification().getCode() != null)
            ? issue.getCertification().getCode()
            : "GEN";
        issue.setIssueId(sequenceService.nextIssueId(certCode));
        if (issue.getIssueDate() == null) issue.setIssueDate(LocalDate.now());
        IssueRegister saved = repo.save(issue);
        return ResponseEntity.ok(ApiResponse.ok("Document issued successfully", saved));
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<IssueRegister>> update(
            @PathVariable Long id,
            @RequestBody IssueRegister update) {
        return repo.findById(id).map(existing -> {
            if (update.getDocument()      != null) existing.setDocument(update.getDocument());
            if (update.getDepartment()    != null) existing.setDepartment(update.getDepartment());
            if (update.getCopyType()      != null) existing.setCopyType(update.getCopyType());
            if (update.getIssuedTo()      != null) existing.setIssuedTo(update.getIssuedTo());
            if (update.getDesignation()   != null) existing.setDesignation(update.getDesignation());
            if (update.getRevisionNumber()!= null) existing.setRevisionNumber(update.getRevisionNumber());
            if (update.getIssueDate()     != null) existing.setIssueDate(update.getIssueDate());
            if (update.getReturnDate()    != null) existing.setReturnDate(update.getReturnDate());
            if (update.getStatus()        != null) existing.setStatus(update.getStatus());
            if (update.getRemarks()       != null) existing.setRemarks(update.getRemarks());
            return ResponseEntity.ok(ApiResponse.ok("Updated successfully", repo.save(existing)));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── STATUS UPDATE ─────────────────────────────────────────────────────────

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<IssueRegister>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return repo.findById(id).map(existing -> {
            existing.setStatus(IssueRegister.IssueStatus.valueOf(status.toUpperCase()));
            return ResponseEntity.ok(ApiResponse.ok("Status updated", repo.save(existing)));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── ACKNOWLEDGE ────────────────────────────────────────────────────────────

    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<ApiResponse<IssueRegister>> acknowledge(@PathVariable Long id) {
        return repo.findById(id).map(existing -> {
            existing.setRemarks(
                (existing.getRemarks() != null ? existing.getRemarks() + " | " : "") +
                "ACKNOWLEDGED on " + LocalDate.now()
            );
            return ResponseEntity.ok(ApiResponse.ok("Acknowledged", repo.save(existing)));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── MARK RETURN ────────────────────────────────────────────────────────────

    @PostMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<IssueRegister>> markReturn(
            @PathVariable Long id,
            @RequestParam(required = false) String returnDate) {
        return repo.findById(id).map(existing -> {
            existing.setReturnDate(returnDate != null ? LocalDate.parse(returnDate) : LocalDate.now());
            existing.setStatus(IssueRegister.IssueStatus.RETURNED);
            return ResponseEntity.ok(ApiResponse.ok("Marked as returned", repo.save(existing)));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted successfully"));
    }
}
