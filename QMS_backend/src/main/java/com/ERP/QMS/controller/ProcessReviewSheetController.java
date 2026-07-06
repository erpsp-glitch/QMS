package com.ERP.QMS.controller;

import com.ERP.QMS.dto.ApiResponse;
import com.ERP.QMS.model.ActionTracker;
import com.ERP.QMS.model.ProcessReviewPlan;
import com.ERP.QMS.model.ProcessReviewSheet;
import com.ERP.QMS.repository.ActionTrackerRepository;
import com.ERP.QMS.repository.ProcessReviewPlanRepository;
import com.ERP.QMS.repository.ProcessReviewSheetRepository;
import com.ERP.QMS.service.SequenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/process-review-sheets")
@RequiredArgsConstructor
public class ProcessReviewSheetController {

    private final ProcessReviewSheetRepository sheetRepository;
    private final ProcessReviewPlanRepository planRepository;
    private final ActionTrackerRepository actionTrackerRepository;
    private final SequenceService sequenceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProcessReviewSheet>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(sheetRepository.findAll()));
    }

    @GetMapping("/plan/{planId}")
    public ResponseEntity<ApiResponse<List<ProcessReviewSheet>>> getByPlan(@PathVariable Long planId) {
        return ResponseEntity.ok(ApiResponse.ok(sheetRepository.findByProcessReviewPlanId(planId)));
    }

    @GetMapping("/mrm/{mrmPlanId}")
    public ResponseEntity<ApiResponse<List<ProcessReviewSheet>>> getByMrm(@PathVariable Long mrmPlanId) {
        return ResponseEntity.ok(ApiResponse.ok(sheetRepository.findByProcessReviewPlanMrmPlanId(mrmPlanId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProcessReviewSheet>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(sheetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Process Review Sheet not found: " + id))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProcessReviewSheet>> create(@RequestBody ProcessReviewSheet sheet) {
        // Resolve Process Review Plan and auto-fill
        if (sheet.getProcessReviewPlan() != null && sheet.getProcessReviewPlan().getId() != null) {
            ProcessReviewPlan plan = planRepository.findById(sheet.getProcessReviewPlan().getId())
                    .orElseThrow(() -> new RuntimeException("Process Review Plan not found"));
            sheet.setProcessReviewPlan(plan);
            // Auto-fill from plan
            if (sheet.getDepartment() == null && plan.getDepartment() != null) {
                sheet.setDepartment(plan.getDepartment().getName());
            }
            if (sheet.getProcessName() == null) sheet.setProcessName(plan.getProcessName());
            if (sheet.getProcessOwner() == null && plan.getDepartment() != null) {
                sheet.setProcessOwner(plan.getDepartment().getProcessOwner());
            }
            if (sheet.getProcessReviewedBy() == null) sheet.setProcessReviewedBy(plan.getReviewer());
            if (sheet.getCurrentReviewDate() == null) sheet.setCurrentReviewDate(plan.getPlannedReviewDate());

            // Generate PRS ref no using cert code
            String certCode = plan.getCertification() != null ? plan.getCertification().getCode() : "QMS";
            sheet.setPrsRefNo(sequenceService.nextPrsRefNo(certCode));
        } else {
            sheet.setPrsRefNo(sequenceService.nextPrsRefNo("QMS"));
        }

        sheet.setStatus(ProcessReviewSheet.SheetStatus.DRAFT);
        ProcessReviewSheet saved = sheetRepository.save(sheet);

        // Auto-create Action Tracker if action required
        if (saved.isActionRequired()) {
            createActionFromSheet(saved);
        }

        return ResponseEntity.ok(ApiResponse.ok("Process Review Sheet created", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProcessReviewSheet>> update(@PathVariable Long id, @RequestBody ProcessReviewSheet updated) {
        ProcessReviewSheet existing = sheetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Process Review Sheet not found: " + id));

        existing.setReviewChecklist(updated.getReviewChecklist());
        existing.setProcessEffectiveness(updated.getProcessEffectiveness());
        existing.setKpiAchievement(updated.getKpiAchievement());
        existing.setAuditFindingsImpact(updated.getAuditFindingsImpact());
        existing.setCustomerFeedbackImpact(updated.getCustomerFeedbackImpact());
        existing.setRisksIdentified(updated.getRisksIdentified());
        existing.setOpportunitiesForImprovement(updated.getOpportunitiesForImprovement());
        existing.setOverallComments(updated.getOverallComments());
        existing.setRecommendation(updated.getRecommendation());
        existing.setActionRequired(updated.isActionRequired());
        existing.setActionResponsiblePerson(updated.getActionResponsiblePerson());
        existing.setActionTargetDate(updated.getActionTargetDate());
        existing.setLastReviewDate(updated.getLastReviewDate());
        existing.setCurrentReviewDate(updated.getCurrentReviewDate());
        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
        existing.setReviewedBy(updated.getReviewedBy());
        existing.setReviewDate(updated.getReviewDate());

        ProcessReviewSheet saved = sheetRepository.save(existing);

        // Auto-create action tracker if newly required
        if (saved.isActionRequired()) {
            List<ActionTracker> existing_actions = actionTrackerRepository
                    .findBySourceReferenceNo(saved.getPrsRefNo());
            if (existing_actions.isEmpty()) {
                createActionFromSheet(saved);
            }
        }

        return ResponseEntity.ok(ApiResponse.ok("Updated", saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        sheetRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted"));
    }

    private void createActionFromSheet(ProcessReviewSheet sheet) {
        ActionTracker action = new ActionTracker();
        action.setActionNo(sequenceService.nextActionNo());
        action.setSourceModule(ActionTracker.SourceModule.PROCESS_REVIEW);
        action.setSourceReferenceNo(sheet.getPrsRefNo());
        action.setActionDate(LocalDate.now());
        action.setActionDescription("Process Review Action: " + sheet.getRecommendation());
        action.setResponsiblePerson(sheet.getActionResponsiblePerson());
        action.setDepartment(sheet.getDepartment());
        action.setTargetCompletionDate(sheet.getActionTargetDate());
        action.setPriority(ActionTracker.ActionPriority.MEDIUM);
        action.setStatus(ActionTracker.ActionStatus.OPEN);
        action.setReminderRequired(true);
        action.setReminderDaysBeforeDue(7);
        actionTrackerRepository.save(action);
    }
}
