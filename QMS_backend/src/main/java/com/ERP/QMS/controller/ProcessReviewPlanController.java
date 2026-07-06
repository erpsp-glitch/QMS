package com.ERP.QMS.controller;

import com.ERP.QMS.dto.ApiResponse;
import com.ERP.QMS.model.Certification;
import com.ERP.QMS.model.Department;
import com.ERP.QMS.model.MrmPlan;
import com.ERP.QMS.model.ProcessReviewPlan;
import com.ERP.QMS.repository.CertificationRepository;
import com.ERP.QMS.repository.DepartmentRepository;
import com.ERP.QMS.repository.MrmPlanRepository;
import com.ERP.QMS.repository.ProcessReviewPlanRepository;
import com.ERP.QMS.service.SequenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/process-review-plans")
@RequiredArgsConstructor
public class ProcessReviewPlanController {

    private final ProcessReviewPlanRepository planRepository;
    private final MrmPlanRepository mrmPlanRepository;
    private final CertificationRepository certificationRepository;
    private final DepartmentRepository departmentRepository;
    private final SequenceService sequenceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProcessReviewPlan>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(planRepository.findAll()));
    }

    @GetMapping("/mrm/{mrmPlanId}")
    public ResponseEntity<ApiResponse<List<ProcessReviewPlan>>> getByMrm(@PathVariable Long mrmPlanId) {
        return ResponseEntity.ok(ApiResponse.ok(planRepository.findByMrmPlanId(mrmPlanId)));
    }

    @GetMapping("/certification/{certId}")
    public ResponseEntity<ApiResponse<List<ProcessReviewPlan>>> getByCert(@PathVariable Long certId) {
        return ResponseEntity.ok(ApiResponse.ok(planRepository.findByCertificationId(certId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProcessReviewPlan>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Process Review Plan not found: " + id))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProcessReviewPlan>> create(@RequestBody ProcessReviewPlan plan) {
        // Resolve MRM Plan
        if (plan.getMrmPlan() != null && plan.getMrmPlan().getId() != null) {
            MrmPlan mrm = mrmPlanRepository.findById(plan.getMrmPlan().getId())
                    .orElseThrow(() -> new RuntimeException("MRM Plan not found"));
            plan.setMrmPlan(mrm);
            // Auto-load certification from MRM
            if (plan.getCertification() == null && mrm.getCertification() != null) {
                plan.setCertification(mrm.getCertification());
            }
        }

        // Resolve Department and auto-fill process fields
        if (plan.getDepartment() != null && plan.getDepartment().getId() != null) {
            Department dept = departmentRepository.findById(plan.getDepartment().getId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            plan.setDepartment(dept);
            if (plan.getProcessName() == null || plan.getProcessName().isBlank()) {
                plan.setProcessName(dept.getProcessName());
            }
            if (plan.getDepartmentHead() == null || plan.getDepartmentHead().isBlank()) {
                plan.setDepartmentHead(dept.getDepartmentHead());
            }
        }

        // Generate reference number
        String certCode = plan.getCertification() != null ? plan.getCertification().getCode() : "QMS";
        plan.setPrpRefNo(sequenceService.nextPrpRefNo(certCode));
        plan.setStatus(ProcessReviewPlan.PrpStatus.PLANNED);

        return ResponseEntity.ok(ApiResponse.ok("Process Review Plan created", planRepository.save(plan)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProcessReviewPlan>> update(@PathVariable Long id, @RequestBody ProcessReviewPlan updated) {
        ProcessReviewPlan existing = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Process Review Plan not found: " + id));

        if (updated.getDepartment() != null && updated.getDepartment().getId() != null) {
            Department dept = departmentRepository.findById(updated.getDepartment().getId())
                    .orElse(existing.getDepartment());
            existing.setDepartment(dept);
            if (updated.getProcessName() == null || updated.getProcessName().isBlank()) {
                existing.setProcessName(dept.getProcessName());
            }
            if (updated.getDepartmentHead() == null || updated.getDepartmentHead().isBlank()) {
                existing.setDepartmentHead(dept.getDepartmentHead());
            }
        }

        existing.setReviewDate(updated.getReviewDate());
        existing.setProcessName(updated.getProcessName() != null ? updated.getProcessName() : existing.getProcessName());
        existing.setDepartmentHead(updated.getDepartmentHead() != null ? updated.getDepartmentHead() : existing.getDepartmentHead());
        existing.setReviewer(updated.getReviewer());
        existing.setPlannedReviewDate(updated.getPlannedReviewDate());
        existing.setReviewScope(updated.getReviewScope());
        existing.setReviewObjective(updated.getReviewObjective());
        existing.setReviewCriteria(updated.getReviewCriteria());
        existing.setRemarks(updated.getRemarks());
        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());

        return ResponseEntity.ok(ApiResponse.ok("Updated", planRepository.save(existing)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        planRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted"));
    }
}
