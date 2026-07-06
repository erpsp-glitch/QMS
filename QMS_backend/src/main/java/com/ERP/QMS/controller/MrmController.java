package com.ERP.QMS.controller;

import com.ERP.QMS.dto.ApiResponse;
import com.ERP.QMS.model.MrmAgenda;
import com.ERP.QMS.model.MrmMinutes;
import com.ERP.QMS.model.MrmPlan;
import com.ERP.QMS.service.MrmService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/mrm")
@RequiredArgsConstructor
public class MrmController {

    private final MrmService mrmService;

    // =====================================================
    // MRM PLANS
    // =====================================================

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<MrmPlan>>> getAllPlans() {
        return ResponseEntity.ok(
                ApiResponse.ok(mrmService.getAllPlans())
        );
    }

    @GetMapping("/plans/certification/{certId}")
    public ResponseEntity<ApiResponse<List<MrmPlan>>> getPlansByCertification(
            @PathVariable Long certId
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok(mrmService.getPlansByCertification(certId))
        );
    }

    @GetMapping("/plans/{id}")
    public ResponseEntity<ApiResponse<MrmPlan>> getPlanById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok(mrmService.getPlanById(id))
        );
    }

    @PostMapping("/plans")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<MrmPlan>> createPlan(
            @RequestBody MrmPlan plan
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok(
                        "MRM Plan Created Successfully",
                        mrmService.createPlan(plan)
                )
        );
    }

    @PutMapping("/plans/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<MrmPlan>> updatePlan(
            @PathVariable Long id,
            @RequestBody MrmPlan plan
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok(
                        "MRM Plan Updated Successfully",
                        mrmService.updatePlan(id, plan)
                )
        );
    }

    @PostMapping("/plans/{id}/submit")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<MrmPlan>> submitPlan(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Submitted for approval", mrmService.submitPlan(id)));
    }

    @PostMapping("/plans/{id}/approve")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR')")
    public ResponseEntity<ApiResponse<MrmPlan>> approvePlan(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String approvedBy = body != null ? body.getOrDefault("approvedBy", "MR") : "MR";
        return ResponseEntity.ok(ApiResponse.ok("MRM Plan Approved", mrmService.approvePlan(id, approvedBy)));
    }

    @PostMapping("/plans/{id}/reject")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR')")
    public ResponseEntity<ApiResponse<MrmPlan>> rejectPlan(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String rejectedBy = body != null ? body.getOrDefault("rejectedBy", "MR") : "MR";
        return ResponseEntity.ok(ApiResponse.ok("MRM Plan Rejected", mrmService.rejectPlan(id, rejectedBy)));
    }

    @PutMapping("/plans/{id}/mom")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<MrmPlan>> updateMom(
            @PathVariable Long id,
            @RequestBody MrmPlan update) {
        return ResponseEntity.ok(ApiResponse.ok("MOM updated", mrmService.updateMom(id, update)));
    }

    @DeleteMapping("/plans/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR')")
    public ResponseEntity<ApiResponse<Void>> deletePlan(
            @PathVariable Long id
    ) {
        mrmService.deletePlan(id);

        return ResponseEntity.ok(
                ApiResponse.ok("MRM Plan Deleted Successfully")
        );
    }

    // =====================================================
    // MRM AGENDA
    // =====================================================

   

    @PostMapping("/agenda")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<MrmAgenda>> saveAgenda(
            @RequestBody MrmAgenda agenda
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok(
                        "MRM Agenda Saved Successfully",
                        mrmService.saveAgenda(agenda)
                )
        );
    }

    @DeleteMapping("/agenda/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<Void>> deleteAgenda(
            @PathVariable Long id
    ) {
        mrmService.deleteAgenda(id);

        return ResponseEntity.ok(
                ApiResponse.ok("MRM Agenda Deleted Successfully")
        );
    }


    @GetMapping("/agenda/plan/{planId}")
public ResponseEntity<ApiResponse<List<MrmAgenda>>> getAgendaByPlan(
        @PathVariable Long planId
) {
    return ResponseEntity.ok(
            ApiResponse.ok(mrmService.getAgendaByPlan(planId))
    );
}



    // =====================================================
    // MRM MINUTES
    // =====================================================

    @GetMapping("/minutes/plan/{planId}")
    public ResponseEntity<ApiResponse<List<MrmMinutes>>> getMinutesByPlan(
            @PathVariable Long planId
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok(mrmService.getMinutesByPlan(planId))
        );
    }

    @GetMapping("/minutes/pending-actions")
    public ResponseEntity<ApiResponse<List<MrmMinutes>>> getPendingActions() {
        return ResponseEntity.ok(
                ApiResponse.ok(mrmService.getPendingActions())
        );
    }

    @PostMapping("/minutes")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<MrmMinutes>> saveMinutes(
            @RequestBody MrmMinutes minutes
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok(
                        "MRM Minutes Saved Successfully",
                        mrmService.saveMinutes(minutes)
                )
        );
    }

    @PutMapping("/minutes/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR','DEPARTMENT_HEAD')")
    public ResponseEntity<ApiResponse<MrmMinutes>> updateMinutesStatus(
            @PathVariable Long id,
            @RequestParam MrmMinutes.MinutesStatus status
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                "MRM Minutes Status Updated Successfully",
                mrmService.updateMinutesStatus(id, status)
        ));
    }

    @PutMapping("/minutes/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<MrmMinutes>> updateMinutes(
            @PathVariable Long id,
            @RequestBody MrmMinutes minutes
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                "MRM Minutes Updated Successfully",
                mrmService.updateMinutes(id, minutes)
        ));
    }

    @DeleteMapping("/minutes/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<Void>> deleteMinutes(@PathVariable Long id) {
        mrmService.deleteMinutes(id);
        return ResponseEntity.ok(ApiResponse.ok("MRM Minutes Deleted Successfully"));
    }
}