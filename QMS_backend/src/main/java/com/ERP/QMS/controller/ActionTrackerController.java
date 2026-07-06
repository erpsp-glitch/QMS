package com.ERP.QMS.controller;

import com.ERP.QMS.dto.ApiResponse;
import com.ERP.QMS.model.ActionTracker;
import com.ERP.QMS.repository.ActionTrackerRepository;
import com.ERP.QMS.service.SequenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/action-trackers")
@RequiredArgsConstructor
public class ActionTrackerController {

    private final ActionTrackerRepository actionTrackerRepository;
    private final SequenceService sequenceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ActionTracker>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(actionTrackerRepository.findAll()));
    }

    @GetMapping("/open")
    public ResponseEntity<ApiResponse<List<ActionTracker>>> getOpen() {
        return ResponseEntity.ok(ApiResponse.ok(actionTrackerRepository.findByStatus(ActionTracker.ActionStatus.OPEN)));
    }

    @GetMapping("/overdue")
    public ResponseEntity<ApiResponse<List<ActionTracker>>> getOverdue() {
        return ResponseEntity.ok(ApiResponse.ok(actionTrackerRepository.findByStatus(ActionTracker.ActionStatus.OVERDUE)));
    }

    @GetMapping("/source/{sourceRef}")
    public ResponseEntity<ApiResponse<List<ActionTracker>>> getBySourceRef(@PathVariable String sourceRef) {
        return ResponseEntity.ok(ApiResponse.ok(actionTrackerRepository.findBySourceReferenceNo(sourceRef)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ActionTracker>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(actionTrackerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Action not found: " + id))));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        List<ActionTracker> all = actionTrackerRepository.findAll();
        LocalDate today = LocalDate.now();

        // Mark overdue
        all.stream()
            .filter(a -> a.getStatus() == ActionTracker.ActionStatus.OPEN || a.getStatus() == ActionTracker.ActionStatus.IN_PROGRESS)
            .filter(a -> a.getTargetCompletionDate() != null && a.getTargetCompletionDate().isBefore(today))
            .forEach(a -> {
                a.setStatus(ActionTracker.ActionStatus.OVERDUE);
                actionTrackerRepository.save(a);
            });

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("total",              all.size());
        dashboard.put("open",               all.stream().filter(a -> a.getStatus() == ActionTracker.ActionStatus.OPEN).count());
        dashboard.put("inProgress",         all.stream().filter(a -> a.getStatus() == ActionTracker.ActionStatus.IN_PROGRESS).count());
        dashboard.put("pendingVerification",all.stream().filter(a -> a.getStatus() == ActionTracker.ActionStatus.PENDING_VERIFICATION).count());
        dashboard.put("verified",           all.stream().filter(a -> a.getStatus() == ActionTracker.ActionStatus.VERIFIED).count());
        dashboard.put("closed",             all.stream().filter(a -> a.getStatus() == ActionTracker.ActionStatus.CLOSED).count());
        dashboard.put("overdue",            all.stream().filter(a -> a.getStatus() == ActionTracker.ActionStatus.OVERDUE).count());
        dashboard.put("upcomingDue",        all.stream().filter(a ->
                a.getTargetCompletionDate() != null &&
                !a.getTargetCompletionDate().isBefore(today) &&
                a.getTargetCompletionDate().isBefore(today.plusDays(7)) &&
                a.getStatus() != ActionTracker.ActionStatus.CLOSED).count());
        return ResponseEntity.ok(ApiResponse.ok(dashboard));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ActionTracker>> create(@RequestBody ActionTracker action) {
        action.setActionNo(sequenceService.nextActionNo());
        if (action.getActionDate() == null) action.setActionDate(LocalDate.now());
        if (action.getStatus() == null) action.setStatus(ActionTracker.ActionStatus.OPEN);
        return ResponseEntity.ok(ApiResponse.ok("Action created", actionTrackerRepository.save(action)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ActionTracker>> update(@PathVariable Long id, @RequestBody ActionTracker updated) {
        ActionTracker existing = actionTrackerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Action not found: " + id));

        existing.setActionDescription(updated.getActionDescription());
        existing.setResponsiblePerson(updated.getResponsiblePerson());
        existing.setDepartment(updated.getDepartment());
        existing.setTargetCompletionDate(updated.getTargetCompletionDate());
        existing.setRemarks(updated.getRemarks());
        existing.setPriority(updated.getPriority());
        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());

        existing.setReminderRequired(updated.isReminderRequired());
        existing.setReminderFrequency(updated.getReminderFrequency());
        existing.setReminderDaysBeforeDue(updated.getReminderDaysBeforeDue());
        existing.setEscalationRequired(updated.isEscalationRequired());

        existing.setProgressUpdate(updated.getProgressUpdate());
        existing.setCompletionPercent(updated.getCompletionPercent());
        existing.setUpdatedBy(updated.getUpdatedBy());
        existing.setUpdateDate(updated.getUpdateDate());

        existing.setVerificationRequired(updated.isVerificationRequired());
        existing.setVerifiedBy(updated.getVerifiedBy());
        existing.setVerificationDate(updated.getVerificationDate());
        existing.setVerificationRemarks(updated.getVerificationRemarks());

        existing.setClosureEvidence(updated.getClosureEvidence());
        existing.setClosureDate(updated.getClosureDate());
        existing.setClosureRemarks(updated.getClosureRemarks());

        existing.setReviewedBy(updated.getReviewedBy());
        existing.setApprovedBy(updated.getApprovedBy());
        existing.setApprovalDate(updated.getApprovalDate());

        return ResponseEntity.ok(ApiResponse.ok("Updated", actionTrackerRepository.save(existing)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ActionTracker>> updateStatus(
            @PathVariable Long id, @RequestParam String status) {
        ActionTracker action = actionTrackerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Action not found: " + id));
        action.setStatus(ActionTracker.ActionStatus.valueOf(status));
        if (ActionTracker.ActionStatus.CLOSED == ActionTracker.ActionStatus.valueOf(status)) {
            if (action.getClosureDate() == null) action.setClosureDate(LocalDate.now());
        }
        return ResponseEntity.ok(ApiResponse.ok("Status updated", actionTrackerRepository.save(action)));
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<ApiResponse<ActionTracker>> updateProgress(
            @PathVariable Long id, @RequestBody Map<String, Object> body) {
        ActionTracker action = actionTrackerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Action not found: " + id));
        if (body.containsKey("progressUpdate")) action.setProgressUpdate((String) body.get("progressUpdate"));
        if (body.containsKey("completionPercent")) action.setCompletionPercent((Integer) body.get("completionPercent"));
        if (body.containsKey("updatedBy")) action.setUpdatedBy((String) body.get("updatedBy"));
        action.setUpdateDate(LocalDate.now());
        if (action.getCompletionPercent() > 0 && action.getStatus() == ActionTracker.ActionStatus.OPEN) {
            action.setStatus(ActionTracker.ActionStatus.IN_PROGRESS);
        }
        return ResponseEntity.ok(ApiResponse.ok("Progress updated", actionTrackerRepository.save(action)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        actionTrackerRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted"));
    }
}
