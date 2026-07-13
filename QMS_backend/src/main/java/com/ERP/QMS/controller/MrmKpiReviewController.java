package com.ERP.QMS.controller;

import com.ERP.QMS.dto.ApiResponse;
import com.ERP.QMS.model.ActionTracker;
import com.ERP.QMS.model.KpiEntry;
import com.ERP.QMS.model.KpiMaster;
import com.ERP.QMS.model.MrmKpiReview;
import com.ERP.QMS.model.MrmPlan;
import com.ERP.QMS.repository.ActionTrackerRepository;
import com.ERP.QMS.repository.KpiEntryRepository;
import com.ERP.QMS.repository.KpiMasterRepository;
import com.ERP.QMS.repository.MrmKpiReviewRepository;
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
public class MrmKpiReviewController {

    private final MrmKpiReviewRepository mrmKpiReviewRepository;
    private final MrmPlanRepository mrmPlanRepository;
    private final KpiMasterRepository kpiMasterRepository;
    private final KpiEntryRepository kpiEntryRepository;
    private final ActionTrackerRepository actionTrackerRepository;
    private final SequenceService sequenceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MrmKpiReview>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(mrmKpiReviewRepository.findAll()));
    }

    @GetMapping("/certification/{certId}")
    public ResponseEntity<ApiResponse<List<MrmKpiReview>>> getByCert(@PathVariable Long certId) {
        return ResponseEntity.ok(ApiResponse.ok(mrmKpiReviewRepository.findByCertificationId(certId)));
    }

    @GetMapping("/mrm/{mrmPlanId}")
    public ResponseEntity<ApiResponse<MrmKpiReview>> getByMrm(@PathVariable Long mrmPlanId) {
        return ResponseEntity.ok(ApiResponse.ok(
                mrmKpiReviewRepository.findByMrmPlanId(mrmPlanId).orElse(null)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MrmKpiReview>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(mrmKpiReviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MRM KPI Review not found: " + id))));
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
    public ResponseEntity<ApiResponse<MrmKpiReview>> create(@RequestBody MrmKpiReview review) {
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
        List<MrmKpiReview.KpiReviewItem> items = review.getKpiPerformanceItems();
        if (items != null) {
            review.setTotalKpiReviewed(items.size());
            review.setAchieved((int) items.stream().filter(i -> "ACHIEVED".equals(i.getAchievementStatus())).count());
            review.setPartiallyAchieved((int) items.stream().filter(i -> "PARTIALLY_ACHIEVED".equals(i.getAchievementStatus())).count());
            review.setNotAchieved((int) items.stream().filter(i -> "NOT_ACHIEVED".equals(i.getAchievementStatus())).count());
        }

        review.setReviewStatus(MrmKpiReview.ReviewStatus.DRAFT);
        MrmKpiReview saved = mrmKpiReviewRepository.save(review);

        // Auto-create action if corrective action required
        if (MrmKpiReview.ReviewDecision.CORRECTIVE_ACTION_REQUIRED == saved.getReviewDecision()) {
            createActionFromKpiReview(saved);
        }

        return ResponseEntity.ok(ApiResponse.ok("MRM KPI Review created", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MrmKpiReview>> update(@PathVariable Long id, @RequestBody MrmKpiReview updated) {
        MrmKpiReview existing = mrmKpiReviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MRM KPI Review not found: " + id));

        // Safely update ElementCollection to prevent Hibernate issues
        existing.getKpiPerformanceItems().clear();
        if (updated.getKpiPerformanceItems() != null) {
            existing.getKpiPerformanceItems().addAll(updated.getKpiPerformanceItems());
        }

        existing.setReviewDecision(updated.getReviewDecision());
        existing.setManagementComments(updated.getManagementComments());
        existing.setResponsiblePerson(updated.getResponsiblePerson());
        existing.setTargetCompletionDate(updated.getTargetCompletionDate());
        if (updated.getReviewStatus() != null) existing.setReviewStatus(updated.getReviewStatus());
        existing.setReviewedBy(updated.getReviewedBy());
        existing.setReviewedDate(updated.getReviewedDate());

        // Recalculate summary
        List<MrmKpiReview.KpiReviewItem> items = existing.getKpiPerformanceItems();
        existing.setTotalKpiReviewed(items.size());
        existing.setAchieved((int) items.stream().filter(i -> "ACHIEVED".equals(i.getAchievementStatus())).count());
        existing.setPartiallyAchieved((int) items.stream().filter(i -> "PARTIALLY_ACHIEVED".equals(i.getAchievementStatus())).count());
        existing.setNotAchieved((int) items.stream().filter(i -> "NOT_ACHIEVED".equals(i.getAchievementStatus())).count());

        MrmKpiReview saved = mrmKpiReviewRepository.save(existing);

        // Auto-create action if corrective action required and not already created
        if (MrmKpiReview.ReviewDecision.CORRECTIVE_ACTION_REQUIRED == saved.getReviewDecision()) {
            boolean actionExists = !actionTrackerRepository.findBySourceReferenceNo(saved.getKpiReviewId()).isEmpty();
            if (!actionExists) {
                createActionFromKpiReview(saved);
            }
        }

        return ResponseEntity.ok(ApiResponse.ok("Updated", saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        mrmKpiReviewRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted"));
    }

    private void createActionFromKpiReview(MrmKpiReview review) {
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
