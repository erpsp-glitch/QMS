package com.ERP.QMS.controller;

import com.ERP.QMS.dto.ApiResponse;
import com.ERP.QMS.model.ActionTracker;
import com.ERP.QMS.model.AuditObservation;
import com.ERP.QMS.model.AuditPlan;
import com.ERP.QMS.model.InternalAuditReview;
import com.ERP.QMS.model.MrmPlan;
import com.ERP.QMS.model.NcTracking;
import com.ERP.QMS.repository.ActionTrackerRepository;
import com.ERP.QMS.repository.AuditObservationRepository;
import com.ERP.QMS.repository.AuditPlanRepository;
import com.ERP.QMS.repository.CarRepository;
import com.ERP.QMS.repository.InternalAuditReviewRepository;
import com.ERP.QMS.repository.MrmPlanRepository;
import com.ERP.QMS.repository.NcTrackingRepository;
import com.ERP.QMS.service.SequenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/audit-reviews")
@RequiredArgsConstructor
public class InternalAuditReviewController {

    private final InternalAuditReviewRepository reviewRepository;
    private final MrmPlanRepository mrmPlanRepository;
    private final AuditPlanRepository auditPlanRepository;
    private final AuditObservationRepository observationRepository;
    private final NcTrackingRepository ncTrackingRepository;
    private final CarRepository carRepository;
    private final ActionTrackerRepository actionTrackerRepository;
    private final SequenceService sequenceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<InternalAuditReview>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(reviewRepository.findAll()));
    }

    @GetMapping("/certification/{certId}")
    public ResponseEntity<ApiResponse<List<InternalAuditReview>>> getByCert(@PathVariable Long certId) {
        return ResponseEntity.ok(ApiResponse.ok(reviewRepository.findByCertificationId(certId)));
    }

    @GetMapping("/mrm/{mrmPlanId}")
    public ResponseEntity<ApiResponse<InternalAuditReview>> getByMrm(@PathVariable Long mrmPlanId) {
        return ResponseEntity.ok(ApiResponse.ok(
                reviewRepository.findByMrmPlanId(mrmPlanId).orElse(null)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InternalAuditReview>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Audit Review not found: " + id))));
    }

    // Load audit dashboard data for a given certification
    @GetMapping("/dashboard-data")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardData(@RequestParam Long certId) {
        List<AuditPlan> plans = auditPlanRepository.findByCertificationId(certId);
        List<AuditObservation> observations = observationRepository.findByAuditPlanCertificationId(certId);
        List<NcTracking> ncs = ncTrackingRepository.findByCertificationId(certId);

        long openNc = ncs.stream().filter(n -> n.getStatus() == NcTracking.NcStatus.OPEN).count();
        long closedNc = ncs.stream().filter(n -> n.getStatus() == NcTracking.NcStatus.CLOSED).count();
        long overdueNc = ncs.stream().filter(n ->
                n.getStatus() == NcTracking.NcStatus.OPEN &&
                n.getTargetDate() != null &&
                n.getTargetDate().isBefore(LocalDate.now())).count();

        long openCar = carRepository.findByCertificationId(certId).stream()
                .filter(c -> c.getStatus() != com.ERP.QMS.model.Car.CarStatus.CLOSED).count();
        long closedCar = carRepository.findByCertificationId(certId).stream()
                .filter(c -> c.getStatus() == com.ERP.QMS.model.Car.CarStatus.CLOSED).count();

        long totalConformance = observations.stream().filter(o ->
                o.getFindingType() == AuditObservation.FindingType.POSITIVE_OBSERVATION).count();
        long totalObs = observations.stream().filter(o ->
                o.getFindingType() == AuditObservation.FindingType.NEGATIVE_OBSERVATION).count();
        long totalOfi = observations.stream().filter(o ->
                o.getFindingType() == AuditObservation.FindingType.OFI).count();
        long totalNcCount = ncs.size();

        Map<String, Object> data = new HashMap<>();
        data.put("totalAuditsConducted", plans.size());
        data.put("totalClausesAudited", observations.size());
        data.put("totalConformance", totalConformance);
        data.put("totalObservations", totalObs);
        data.put("totalOfi", totalOfi);
        data.put("totalNc", totalNcCount);
        data.put("openNc", openNc);
        data.put("closedNc", closedNc);
        data.put("overdueNc", overdueNc);
        data.put("openCar", openCar);
        data.put("closedCar", closedCar);
        data.put("plans", plans);
        data.put("ncs", ncs);

        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InternalAuditReview>> create(@RequestBody InternalAuditReview review) {
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
        review.setAuditReviewId(sequenceService.nextAuditReviewId(certCode));
        review.setReviewStatus(InternalAuditReview.ReviewStatus.DRAFT);

        InternalAuditReview saved = reviewRepository.save(review);

        if (InternalAuditReview.ReviewDecision.CORRECTIVE_ACTION_REQUIRED == saved.getReviewDecision()) {
            createActionFromAuditReview(saved);
        }

        return ResponseEntity.ok(ApiResponse.ok("Audit Review created", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InternalAuditReview>> update(@PathVariable Long id, @RequestBody InternalAuditReview updated) {
        InternalAuditReview existing = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Audit Review not found: " + id));

        existing.setManagementComments(updated.getManagementComments());
        existing.setReviewDecision(updated.getReviewDecision());
        existing.setResponsiblePerson(updated.getResponsiblePerson());
        existing.setTargetCompletionDate(updated.getTargetCompletionDate());
        if (updated.getReviewStatus() != null) existing.setReviewStatus(updated.getReviewStatus());
        existing.setReviewedBy(updated.getReviewedBy());
        existing.setApprovedBy(updated.getApprovedBy());
        existing.setApprovalDate(updated.getApprovalDate());
        // Update dashboard snapshot
        existing.setTotalAuditsConducted(updated.getTotalAuditsConducted());
        existing.setTotalClausesAudited(updated.getTotalClausesAudited());
        existing.setTotalNc(updated.getTotalNc());
        existing.setOpenNc(updated.getOpenNc());
        existing.setClosedNc(updated.getClosedNc());
        existing.setOverdueNc(updated.getOverdueNc());
        existing.setOpenCar(updated.getOpenCar());
        existing.setClosedCar(updated.getClosedCar());

        return ResponseEntity.ok(ApiResponse.ok("Updated", reviewRepository.save(existing)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        reviewRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted"));
    }

    private void createActionFromAuditReview(InternalAuditReview review) {
        ActionTracker action = new ActionTracker();
        action.setActionNo(sequenceService.nextActionNo());
        action.setSourceModule(ActionTracker.SourceModule.AUDIT_REVIEW);
        action.setSourceReferenceNo(review.getAuditReviewId());
        action.setActionDate(LocalDate.now());
        action.setActionDescription("Audit Review Action: " + (review.getManagementComments() != null ? review.getManagementComments() : "Corrective action required"));
        action.setResponsiblePerson(review.getResponsiblePerson());
        action.setTargetCompletionDate(review.getTargetCompletionDate());
        action.setPriority(ActionTracker.ActionPriority.HIGH);
        action.setStatus(ActionTracker.ActionStatus.OPEN);
        action.setReminderRequired(true);
        action.setReminderDaysBeforeDue(7);
        actionTrackerRepository.save(action);
    }
}
