package com.ERP.QMS.controller;

import com.ERP.QMS.dto.ApiResponse;
import com.ERP.QMS.model.ActionTracker;
import com.ERP.QMS.model.KpiEntry;
import com.ERP.QMS.model.KpiMaster;
import com.ERP.QMS.model.KpiReview;
import com.ERP.QMS.model.MrmPlan;
import com.ERP.QMS.repository.ActionTrackerRepository;
import com.ERP.QMS.repository.KpiEntryRepository;
import com.ERP.QMS.repository.KpiMasterRepository;
import com.ERP.QMS.repository.KpiReviewRepository;
import com.ERP.QMS.repository.MrmPlanRepository;
import com.ERP.QMS.service.SequenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/kpi-reviews")
@RequiredArgsConstructor
public class KpiReviewController {

    private final KpiReviewRepository kpiReviewRepository;
    private final MrmPlanRepository mrmPlanRepository;
    private final KpiMasterRepository kpiMasterRepository;
    private final KpiEntryRepository kpiEntryRepository;
    private final ActionTrackerRepository actionTrackerRepository;
    private final SequenceService sequenceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<KpiReview>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(kpiReviewRepository.findAll()));
    }

    @GetMapping("/certification/{certId}")
    public ResponseEntity<ApiResponse<List<KpiReview>>> getByCert(@PathVariable Long certId) {
        return ResponseEntity.ok(ApiResponse.ok(kpiReviewRepository.findByCertificationId(certId)));
    }

    @GetMapping("/mrm/{mrmPlanId}")
    public ResponseEntity<ApiResponse<KpiReview>> getByMrm(@PathVariable Long mrmPlanId) {
        return ResponseEntity.ok(ApiResponse.ok(
                kpiReviewRepository.findByMrmPlanId(mrmPlanId).orElse(null)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<KpiReview>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(kpiReviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("KPI Review not found: " + id))));
    }

    // Load KPI entries for a given cert / year to pre-populate review form
    @GetMapping("/load-kpi-data")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> loadKpiData(
            @RequestParam Long certId,
            @RequestParam(required = false) Integer year) {
        int reviewYear = (year != null) ? year : LocalDate.now().getYear();
        List<KpiMaster> masters = kpiMasterRepository.findByCertificationId(certId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (KpiMaster master : masters) {
            // Find latest entry for this KPI in the given year
            List<KpiEntry> entries = kpiEntryRepository.findByKpiMasterIdAndYear(master.getId(), reviewYear);
            Double actualValue = null;
            if (!entries.isEmpty()) {
                KpiEntry latest = entries.get(entries.size() - 1);
                actualValue = latest.getActualValue() != null ? latest.getActualValue().doubleValue() : null;
            }

            double target = master.getTargetValue() instanceof Number
                    ? ((Number) master.getTargetValue()).doubleValue() : 0;
            Double achievement = null;
            String status = "NOT_ACHIEVED";
            if (actualValue != null && target > 0) {
                achievement = (actualValue / target) * 100;
                if (achievement >= 100) status = "ACHIEVED";
                else if (achievement >= 75) status = "PARTIALLY_ACHIEVED";
                else status = "NOT_ACHIEVED";
            }

            result.add(Map.of(
                "kpiCode", master.getKpiCode() != null ? master.getKpiCode() : "",
                "kpiName", master.getKpiObjective() != null ? master.getKpiObjective() : "",
                "department", master.getDepartment() != null ? master.getDepartment().getName() : "",
                "frequency", master.getFrequency() != null ? master.getFrequency() : "",
                "target", target,
                "unit", master.getUnit() != null ? master.getUnit() : "",
                "actualValue", actualValue != null ? actualValue : "",
                "achievementPercent", achievement != null ? achievement : "",
                "achievementStatus", status
            ));
        }
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<KpiReview>> create(@RequestBody KpiReview review) {
        // Resolve MRM Plan
        if (review.getMrmPlan() != null && review.getMrmPlan().getId() != null) {
            MrmPlan mrm = mrmPlanRepository.findById(review.getMrmPlan().getId())
                    .orElseThrow(() -> new RuntimeException("MRM Plan not found"));
            review.setMrmPlan(mrm);
            if (review.getCertification() == null && mrm.getCertification() != null) {
                review.setCertification(mrm.getCertification());
            }
            if (review.getReviewDate() == null) review.setReviewDate(mrm.getMeetingDate());
            if (review.getFinancialYear() == null) review.setFinancialYear(mrm.getFinancialYear());
        }

        String certCode = review.getCertification() != null ? review.getCertification().getCode() : "QMS";
        review.setKpiReviewId(sequenceService.nextKpiReviewId(certCode));

        // Calculate summary
        List<KpiReview.KpiReviewItem> items = review.getKpiPerformanceItems();
        if (items != null) {
            review.setTotalKpiReviewed(items.size());
            review.setAchieved((int) items.stream().filter(i -> "ACHIEVED".equals(i.getAchievementStatus())).count());
            review.setPartiallyAchieved((int) items.stream().filter(i -> "PARTIALLY_ACHIEVED".equals(i.getAchievementStatus())).count());
            review.setNotAchieved((int) items.stream().filter(i -> "NOT_ACHIEVED".equals(i.getAchievementStatus())).count());
        }

        review.setReviewStatus(KpiReview.ReviewStatus.DRAFT);
        KpiReview saved = kpiReviewRepository.save(review);

        // Auto-create action if corrective action required
        if (KpiReview.ReviewDecision.CORRECTIVE_ACTION_REQUIRED == saved.getReviewDecision()) {
            createActionFromKpiReview(saved);
        }

        return ResponseEntity.ok(ApiResponse.ok("KPI Review created", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<KpiReview>> update(@PathVariable Long id, @RequestBody KpiReview updated) {
        KpiReview existing = kpiReviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("KPI Review not found: " + id));

        existing.setKpiPerformanceItems(updated.getKpiPerformanceItems());
        existing.setReviewDecision(updated.getReviewDecision());
        existing.setManagementComments(updated.getManagementComments());
        existing.setResponsiblePerson(updated.getResponsiblePerson());
        existing.setTargetCompletionDate(updated.getTargetCompletionDate());
        if (updated.getReviewStatus() != null) existing.setReviewStatus(updated.getReviewStatus());
        existing.setReviewedBy(updated.getReviewedBy());
        existing.setReviewedDate(updated.getReviewedDate());

        // Recalculate summary
        List<KpiReview.KpiReviewItem> items = updated.getKpiPerformanceItems();
        if (items != null) {
            existing.setTotalKpiReviewed(items.size());
            existing.setAchieved((int) items.stream().filter(i -> "ACHIEVED".equals(i.getAchievementStatus())).count());
            existing.setPartiallyAchieved((int) items.stream().filter(i -> "PARTIALLY_ACHIEVED".equals(i.getAchievementStatus())).count());
            existing.setNotAchieved((int) items.stream().filter(i -> "NOT_ACHIEVED".equals(i.getAchievementStatus())).count());
        }

        return ResponseEntity.ok(ApiResponse.ok("Updated", kpiReviewRepository.save(existing)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        kpiReviewRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted"));
    }

    private void createActionFromKpiReview(KpiReview review) {
        ActionTracker action = new ActionTracker();
        action.setActionNo(sequenceService.nextActionNo());
        action.setSourceModule(ActionTracker.SourceModule.KPI_REVIEW);
        action.setSourceReferenceNo(review.getKpiReviewId());
        action.setActionDate(LocalDate.now());
        action.setActionDescription("KPI Review Action: " + (review.getManagementComments() != null ? review.getManagementComments() : "Corrective action required"));
        action.setResponsiblePerson(review.getResponsiblePerson());
        action.setTargetCompletionDate(review.getTargetCompletionDate());
        action.setPriority(ActionTracker.ActionPriority.HIGH);
        action.setStatus(ActionTracker.ActionStatus.OPEN);
        action.setReminderRequired(true);
        action.setReminderDaysBeforeDue(7);
        actionTrackerRepository.save(action);
    }
}
