package com.ERP.QMS.controller;

import com.ERP.QMS.dto.ApiResponse;
import com.ERP.QMS.model.QualityIssue;
import com.ERP.QMS.repository.QualityIssueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Year;
import java.util.List;

@RestController
@RequestMapping("/issue-register")
@RequiredArgsConstructor
public class QualityIssueController {

    private final QualityIssueRepository repo;

    // ── GET ALL ────────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<List<QualityIssue>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(repo.findAllByOrderByCreatedAtDesc()));
    }

    // ── GET BY CERT ────────────────────────────────────────────────────────────

    @GetMapping("/certification/{certId}")
    public ResponseEntity<ApiResponse<List<QualityIssue>>> getByCertification(@PathVariable Long certId) {
        return ResponseEntity.ok(ApiResponse.ok(repo.findByCertificationIdOrderByCreatedAtDesc(certId)));
    }

    // ── GET BY DEPT ────────────────────────────────────────────────────────────

    @GetMapping("/department/{deptId}")
    public ResponseEntity<ApiResponse<List<QualityIssue>>> getByDepartment(@PathVariable Long deptId) {
        return ResponseEntity.ok(ApiResponse.ok(repo.findByDepartmentIdOrderByCreatedAtDesc(deptId)));
    }

    // ── GET BY STATUS ──────────────────────────────────────────────────────────

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<QualityIssue>>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(ApiResponse.ok(
            repo.findByStatusOrderByCreatedAtDesc(QualityIssue.IssueStatus.valueOf(status.toUpperCase()))
        ));
    }

    // ── GET BY ID ─────────────────────────────────────────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QualityIssue>> getById(@PathVariable Long id) {
        return repo.findById(id)
            .map(q -> ResponseEntity.ok(ApiResponse.ok(q)))
            .orElse(ResponseEntity.notFound().build());
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<ApiResponse<QualityIssue>> create(@RequestBody QualityIssue issue) {
        // Auto-generate issue number
        String certCode = (issue.getCertification() != null && issue.getCertification().getCode() != null)
            ? issue.getCertification().getCode()
            : "GEN";
        long seq = repo.count() + 1;
        String issueNumber = String.format("QI-%s-%d-%04d", certCode, Year.now().getValue(), seq);
        issue.setIssueNumber(issueNumber);

        QualityIssue saved = repo.save(issue);
        return ResponseEntity.ok(ApiResponse.ok("Issue registered successfully", saved));
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<QualityIssue>> update(
            @PathVariable Long id,
            @RequestBody QualityIssue update) {
        return repo.findById(id).map(existing -> {
            existing.setTitle(update.getTitle());
            existing.setDescription(update.getDescription());
            existing.setCategory(update.getCategory());
            existing.setSeverity(update.getSeverity());
            existing.setRaisedBy(update.getRaisedBy());
            existing.setTargetDate(update.getTargetDate());
            existing.setRootCause(update.getRootCause());
            existing.setCorrectiveAction(update.getCorrectiveAction());
            existing.setStatus(update.getStatus());
            existing.setRemarks(update.getRemarks());
            if (update.getCertification() != null) existing.setCertification(update.getCertification());
            if (update.getDepartment() != null) existing.setDepartment(update.getDepartment());
            return ResponseEntity.ok(ApiResponse.ok("Updated successfully", repo.save(existing)));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── STATUS UPDATE ─────────────────────────────────────────────────────────

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<QualityIssue>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return repo.findById(id).map(existing -> {
            existing.setStatus(QualityIssue.IssueStatus.valueOf(status.toUpperCase()));
            return ResponseEntity.ok(ApiResponse.ok("Status updated", repo.save(existing)));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted successfully"));
    }

    // ── STATS ─────────────────────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Object>> getStats() {
        long total    = repo.count();
        long open     = repo.countOpenIssues();
        long critical = repo.countCriticalIssues();
        return ResponseEntity.ok(ApiResponse.ok(new java.util.HashMap<String, Long>() {{
            put("total",    total);
            put("open",     open);
            put("critical", critical);
            put("closed",   (long) repo.findByStatusOrderByCreatedAtDesc(QualityIssue.IssueStatus.CLOSED).size());
        }}));
    }
}
