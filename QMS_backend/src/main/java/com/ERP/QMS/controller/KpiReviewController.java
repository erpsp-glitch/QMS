package com.ERP.QMS.controller;

import com.ERP.QMS.dto.ApiResponse;
import com.ERP.QMS.model.ActionTracker;
import com.ERP.QMS.model.KpiEntry;
import com.ERP.QMS.model.KpiReview;
import com.ERP.QMS.repository.ActionTrackerRepository;
import com.ERP.QMS.repository.KpiEntryRepository;
import com.ERP.QMS.repository.KpiMasterRepository;
import com.ERP.QMS.repository.KpiReviewRepository;
import com.ERP.QMS.repository.CertificationRepository;
import com.ERP.QMS.repository.DepartmentRepository;
import com.ERP.QMS.service.SequenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/kpi-review")
@RequiredArgsConstructor
public class KpiReviewController {

    private final KpiReviewRepository kpiReviewRepository;
    private final KpiEntryRepository kpiEntryRepository;
    private final KpiMasterRepository kpiMasterRepository;
    private final CertificationRepository certificationRepository;
    private final DepartmentRepository departmentRepository;
    private final ActionTrackerRepository actionTrackerRepository;
    private final SequenceService sequenceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<KpiReview>>> getAllReviews() {
        return ResponseEntity.ok(ApiResponse.ok(kpiReviewRepository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<KpiReview>> getReviewById(@PathVariable Long id) {
        KpiReview review = kpiReviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("KPI Review not found: " + id));
        return ResponseEntity.ok(ApiResponse.ok(review));
    }

    @GetMapping("/history/{kpiEntryId}")
    public ResponseEntity<ApiResponse<List<KpiReview>>> getReviewHistory(@PathVariable Long kpiEntryId) {
        List<KpiReview> history = kpiReviewRepository.findByKpiEntryIdOrderByCreatedDateDesc(kpiEntryId);
        return ResponseEntity.ok(ApiResponse.ok(history));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<KpiReview>> createReview(@RequestBody KpiReview review) {
        if (review.getKpiEntry() == null || review.getKpiEntry().getId() == null) {
            throw new RuntimeException("KPI Entry is required for review.");
        }

        KpiEntry entry = kpiEntryRepository.findById(review.getKpiEntry().getId())
                .orElseThrow(() -> new RuntimeException("KPI Entry not found."));
        review.setKpiEntry(entry);

        // Inherit certification and department from KPI Entry/Master if not set
        if (review.getCertification() == null && entry.getKpiMaster() != null) {
            review.setCertification(entry.getKpiMaster().getCertification());
        }
        if (review.getDepartment() == null && entry.getKpiMaster() != null) {
            review.setDepartment(entry.getKpiMaster().getDepartment());
        }

        review.setReviewNo(sequenceService.nextKpiEntryReviewNo());
        if (review.getAchievementPercentage() == null) {
            review.setAchievementPercentage(entry.getAchievementPercent());
        }
        if (review.getReviewStatus() == null) {
            review.setReviewStatus("PENDING_REVIEW");
        }
        if (review.getReviewDate() == null) {
            review.setReviewDate(LocalDate.now());
        }

        KpiReview saved = kpiReviewRepository.save(review);
        return ResponseEntity.ok(ApiResponse.ok("Review created successfully", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<KpiReview>> updateReview(@PathVariable Long id, @RequestBody KpiReview updated) {
        KpiReview existing = kpiReviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("KPI Review not found: " + id));

        if (updated.getReviewStatus() != null) existing.setReviewStatus(updated.getReviewStatus());
        if (updated.getReviewDecision() != null) existing.setReviewDecision(updated.getReviewDecision());
        if (updated.getPerformanceRating() != null) existing.setPerformanceRating(updated.getPerformanceRating());
        if (updated.getManagementComment() != null) existing.setManagementComment(updated.getManagementComment());
        if (updated.getStrengths() != null) existing.setStrengths(updated.getStrengths());
        if (updated.getWeaknesses() != null) existing.setWeaknesses(updated.getWeaknesses());
        if (updated.getRootCause() != null) existing.setRootCause(updated.getRootCause());
        if (updated.getImprovementOpportunity() != null) existing.setImprovementOpportunity(updated.getImprovementOpportunity());
        if (updated.getCorrectiveAction() != null) existing.setCorrectiveAction(updated.getCorrectiveAction());
        if (updated.getPreventiveAction() != null) existing.setPreventiveAction(updated.getPreventiveAction());
        if (updated.getResponsiblePerson() != null) existing.setResponsiblePerson(updated.getResponsiblePerson());
        if (updated.getTargetCompletionDate() != null) existing.setTargetCompletionDate(updated.getTargetCompletionDate());
        if (updated.getPriority() != null) existing.setPriority(updated.getPriority());
        if (updated.getNextReviewDate() != null) existing.setNextReviewDate(updated.getNextReviewDate());
        if (updated.getAttachmentPath() != null) existing.setAttachmentPath(updated.getAttachmentPath());
        if (updated.getReviewerId() != null) existing.setReviewerId(updated.getReviewerId());

        KpiReview saved = kpiReviewRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.ok("Review updated successfully", saved));
    }

    @PutMapping("/complete/{id}")
    public ResponseEntity<ApiResponse<KpiReview>> completeReview(@PathVariable Long id) {
        KpiReview existing = kpiReviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("KPI Review not found: " + id));

        existing.setReviewStatus("COMPLETED");
        KpiReview saved = kpiReviewRepository.save(existing);

        // Auto-create Corrective Action if needed
        boolean needsAction = "NEEDS_IMPROVEMENT".equalsIgnoreCase(saved.getReviewDecision())
                || "ESCALATED".equalsIgnoreCase(saved.getReviewDecision())
                || (saved.getCorrectiveAction() != null && !saved.getCorrectiveAction().isBlank());

        if (needsAction) {
            createActionTracker(saved);
        }

        return ResponseEntity.ok(ApiResponse.ok("KPI Review completed and locked", saved));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long id) {
        kpiReviewRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("KPI Review deleted successfully"));
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        List<KpiReview> reviews = kpiReviewRepository.findAll();
        List<KpiEntry> entries = kpiEntryRepository.findAll();

        long totalKpis = kpiMasterRepository.count();
        long completedReviews = reviews.stream().filter(r -> "COMPLETED".equalsIgnoreCase(r.getReviewStatus()) || "APPROVED".equalsIgnoreCase(r.getReviewStatus())).count();
        long pendingReviews = entries.size() - completedReviews;
        if (pendingReviews < 0) pendingReviews = 0;

        List<ActionTracker> actions = actionTrackerRepository.findAll();
        long overdueActions = actions.stream()
                .filter(a -> ActionTracker.ActionStatus.OPEN == a.getStatus() || ActionTracker.ActionStatus.IN_PROGRESS == a.getStatus())
                .filter(a -> a.getTargetCompletionDate() != null && a.getTargetCompletionDate().isBefore(LocalDate.now()))
                .count();

        // Department-wise Review Status
        Map<String, Map<String, Long>> deptStats = reviews.stream()
                .filter(r -> r.getDepartment() != null)
                .collect(Collectors.groupingBy(
                        r -> r.getDepartment().getName(),
                        Collectors.groupingBy(KpiReview::getReviewStatus, Collectors.counting())
                ));

        // Certification-wise Review Status
        Map<String, Map<String, Long>> certStats = reviews.stream()
                .filter(r -> r.getCertification() != null)
                .collect(Collectors.groupingBy(
                        r -> r.getCertification().getCode(),
                        Collectors.groupingBy(KpiReview::getReviewStatus, Collectors.counting())
                ));

        // Reviewer-wise Pending Reviews
        Map<String, Long> reviewerPending = reviews.stream()
                .filter(r -> "PENDING_REVIEW".equalsIgnoreCase(r.getReviewStatus()) || "UNDER_REVIEW".equalsIgnoreCase(r.getReviewStatus()))
                .filter(r -> r.getReviewerId() != null)
                .collect(Collectors.groupingBy(KpiReview::getReviewerId, Collectors.counting()));

        // KPI Performance Distribution
        Map<String, Long> performanceDist = entries.stream()
                .filter(e -> e.getStatus() != null)
                .collect(Collectors.groupingBy(e -> e.getStatus().name(), Collectors.counting()));

        // Action Closure Status
        Map<String, Long> actionClosure = actions.stream()
                .filter(a -> ActionTracker.SourceModule.KPI_REVIEW == a.getSourceModule())
                .filter(a -> a.getStatus() != null)
                .collect(Collectors.groupingBy(a -> a.getStatus().name(), Collectors.counting()));

        // Upcoming Reviews Calendar
        List<Map<String, Object>> calendar = reviews.stream()
                .filter(r -> r.getNextReviewDate() != null)
                .map(r -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", r.getId());
                    map.put("kpiCode", r.getKpiEntry().getKpiMaster() != null ? r.getKpiEntry().getKpiMaster().getKpiCode() : "");
                    map.put("kpiName", r.getKpiEntry().getKpiMaster() != null ? r.getKpiEntry().getKpiMaster().getKpiObjective() : "");
                    map.put("nextReviewDate", r.getNextReviewDate().toString());
                    map.put("reviewer", r.getReviewerId());
                    return map;
                })
                .collect(Collectors.toList());

        stats.put("totalKpis", totalKpis);
        stats.put("pendingReviews", pendingReviews);
        stats.put("completedReviews", completedReviews);
        stats.put("overdueActions", overdueActions);
        stats.put("departmentStats", deptStats);
        stats.put("certificationStats", certStats);
        stats.put("reviewerPending", reviewerPending);
        stats.put("performanceDistribution", performanceDist);
        stats.put("actionClosureStatus", actionClosure);
        stats.put("upcomingCalendar", calendar);

        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    private void createActionTracker(KpiReview review) {
        ActionTracker action = new ActionTracker();
        action.setActionNo(sequenceService.nextActionNo());
        action.setSourceModule(ActionTracker.SourceModule.KPI_REVIEW);
        action.setSourceReferenceNo(review.getReviewNo());
        action.setActionDate(LocalDate.now());
        action.setActionDescription(String.format("Corrective Action for KPI %s Review %s: %s",
                review.getKpiEntry().getKpiMaster() != null ? review.getKpiEntry().getKpiMaster().getKpiCode() : "N/A",
                review.getReviewNo(),
                review.getCorrectiveAction() != null ? review.getCorrectiveAction() : "Management Review Recommendation"
        ));
        action.setResponsiblePerson(review.getResponsiblePerson() != null ? review.getResponsiblePerson() : "Unassigned");
        action.setTargetCompletionDate(review.getTargetCompletionDate() != null ? review.getTargetCompletionDate() : LocalDate.now().plusDays(30));
        action.setPriority(review.getPriority() != null ? ActionTracker.ActionPriority.valueOf(review.getPriority().toUpperCase()) : ActionTracker.ActionPriority.MEDIUM);
        action.setStatus(ActionTracker.ActionStatus.OPEN);
        action.setReminderRequired(true);
        action.setReminderDaysBeforeDue(7);
        if (review.getDepartment() != null) {
            action.setDepartment(review.getDepartment().getName());
        }
        actionTrackerRepository.save(action);
    }
}
