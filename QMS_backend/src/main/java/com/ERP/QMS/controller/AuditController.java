package com.ERP.QMS.controller;

import com.ERP.QMS.dto.ApiResponse;
import com.ERP.QMS.model.AuditFeedback;
import com.ERP.QMS.model.AuditObservation;
import com.ERP.QMS.model.AuditPlan;
import com.ERP.QMS.model.AuditSchedule;
import com.ERP.QMS.model.ClauseMaster;
import com.ERP.QMS.model.NcTracking;
import com.ERP.QMS.service.AuditService;
import com.ERP.QMS.service.PdfReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import java.util.List;

@RestController
@RequestMapping("/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;
    private final PdfReportService pdfReportService;

    // ===== Audit Plans =====

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<AuditPlan>>> getAllPlans() {
        return ResponseEntity.ok(ApiResponse.ok(auditService.getAllPlans()));
    }

    @GetMapping("/plans/certification/{certId}")
    public ResponseEntity<ApiResponse<List<AuditPlan>>> getPlansByCertification(@PathVariable Long certId) {
        return ResponseEntity.ok(ApiResponse.ok(auditService.getPlansByCertification(certId)));
    }

    @GetMapping("/plans/{id}")
    public ResponseEntity<ApiResponse<AuditPlan>> getPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(auditService.getPlanById(id)));
    }

    @PostMapping("/plans")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<AuditPlan>> createPlan(@RequestBody AuditPlan plan) {
        return ResponseEntity.ok(ApiResponse.ok("Audit plan created", auditService.createPlan(plan)));
    }

    @PutMapping("/plans/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<AuditPlan>> updatePlan(@PathVariable Long id, @RequestBody AuditPlan plan) {
        return ResponseEntity.ok(ApiResponse.ok("Updated", auditService.updatePlan(id, plan)));
    }

    @DeleteMapping("/plans/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR')")
    public ResponseEntity<ApiResponse<Void>> deletePlan(@PathVariable Long id) {
        auditService.deletePlan(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted"));
    }

    @PostMapping("/plans/{id}/approve")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<AuditPlan>> approvePlan(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String approvedBy = body.getOrDefault("approvedBy", "MR");
        return ResponseEntity.ok(ApiResponse.ok("Audit plan approved", auditService.approvePlan(id, approvedBy)));
    }

    @GetMapping("/plans/{id}/report")
    public ResponseEntity<byte[]> downloadPlanReport(@PathVariable Long id) {
        AuditPlan plan      = auditService.getPlanById(id);
        List<AuditSchedule> schedules = auditService.getSchedulesByPlan(id);
        List<NcTracking>    ncs       = auditService.getAllNcs().stream()
            .filter(nc -> nc.getAuditPlan() != null && nc.getAuditPlan().getId().equals(id))
            .toList();
        byte[] pdf = pdfReportService.generateAuditPlanReport(plan, schedules, ncs);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"AuditPlan_" + plan.getAuditRefNo() + ".pdf\"")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdf);
    }

    // ===== Observations =====

    @GetMapping("/observations/plan/{planId}")
    public ResponseEntity<ApiResponse<List<AuditObservation>>> getObservationsByPlan(@PathVariable Long planId) {
        return ResponseEntity.ok(ApiResponse.ok(auditService.getObservationsByPlan(planId)));
    }

    @GetMapping("/observations/certification/{certId}")
    public ResponseEntity<ApiResponse<List<AuditObservation>>> getObservationsByCertification(@PathVariable Long certId) {
        return ResponseEntity.ok(ApiResponse.ok(auditService.getObservationsByCertification(certId)));
    }

    @PostMapping("/observations")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR','AUDITOR')")
    public ResponseEntity<ApiResponse<AuditObservation>> createObservation(@RequestBody AuditObservation obs) {
        return ResponseEntity.ok(ApiResponse.ok("Observation recorded", auditService.createObservation(obs)));
    }

    @PutMapping("/observations/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR','AUDITOR')")
    public ResponseEntity<ApiResponse<AuditObservation>> updateObservation(
        @PathVariable Long id,
        @RequestBody AuditObservation obs
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Updated", auditService.updateObservation(id, obs)));
    }

    // ===== NC Tracking =====

    @GetMapping("/nc")
    public ResponseEntity<ApiResponse<List<NcTracking>>> getAllNcs() {
        return ResponseEntity.ok(ApiResponse.ok(auditService.getAllNcs()));
    }

    @GetMapping("/nc/certification/{certId}")
    public ResponseEntity<ApiResponse<List<NcTracking>>> getNcsByCertification(@PathVariable Long certId) {
        return ResponseEntity.ok(ApiResponse.ok(auditService.getNcsByCertification(certId)));
    }

    @GetMapping("/nc/open")
    public ResponseEntity<ApiResponse<List<NcTracking>>> getOpenNcs() {
        return ResponseEntity.ok(ApiResponse.ok(auditService.getOpenNcs()));
    }

    @GetMapping("/nc/{id}")
    public ResponseEntity<ApiResponse<NcTracking>> getNcById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(auditService.getNcById(id)));
    }

    @PostMapping("/nc")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR','AUDITOR')")
    public ResponseEntity<ApiResponse<NcTracking>> createNc(@RequestBody NcTracking nc) {
        return ResponseEntity.ok(ApiResponse.ok("NC created", auditService.createNc(nc)));
    }

    @PutMapping("/nc/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR','DEPARTMENT_HEAD')")
    public ResponseEntity<ApiResponse<NcTracking>> updateNc(@PathVariable Long id, @RequestBody NcTracking nc) {
        return ResponseEntity.ok(ApiResponse.ok("Updated", auditService.updateNc(id, nc)));
    }

    @PostMapping("/nc/{id}/close")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR')")
    public ResponseEntity<ApiResponse<NcTracking>> closeNc(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("NC Closed", auditService.closeNc(id)));
    }

    // ===== Audit Schedules =====

    @GetMapping("/schedules")
    public ResponseEntity<ApiResponse<List<AuditSchedule>>> getAllSchedules() {
        return ResponseEntity.ok(ApiResponse.ok(auditService.getAllSchedules()));
    }

    @GetMapping("/schedules/plan/{planId}")
    public ResponseEntity<ApiResponse<List<AuditSchedule>>> getSchedulesByPlan(@PathVariable Long planId) {
        return ResponseEntity.ok(ApiResponse.ok(auditService.getSchedulesByPlan(planId)));
    }

    @PostMapping("/schedules")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<AuditSchedule>> createSchedule(@RequestBody AuditSchedule schedule) {
        return ResponseEntity.ok(ApiResponse.ok("Schedule created", auditService.createSchedule(schedule)));
    }

    @PutMapping("/schedules/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<AuditSchedule>> updateSchedule(
        @PathVariable Long id, @RequestBody AuditSchedule schedule
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Updated", auditService.updateSchedule(id, schedule)));
    }

    @DeleteMapping("/schedules/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable Long id) {
        auditService.deleteSchedule(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted"));
    }

    // ===== Audit Feedback =====

    @GetMapping("/feedback")
    public ResponseEntity<ApiResponse<List<AuditFeedback>>> getAllFeedback() {
        return ResponseEntity.ok(ApiResponse.ok(auditService.getAllFeedback()));
    }

    @GetMapping("/feedback/plan/{planId}")
    public ResponseEntity<ApiResponse<List<AuditFeedback>>> getFeedbackByPlan(@PathVariable Long planId) {
        return ResponseEntity.ok(ApiResponse.ok(auditService.getFeedbackByPlan(planId)));
    }

    @PostMapping("/feedback")
    public ResponseEntity<ApiResponse<AuditFeedback>> createFeedback(@RequestBody AuditFeedback feedback) {
        return ResponseEntity.ok(ApiResponse.ok("Feedback submitted", auditService.createFeedback(feedback)));
    }

    @PutMapping("/feedback/{id}")
    public ResponseEntity<ApiResponse<AuditFeedback>> updateFeedback(
        @PathVariable Long id, @RequestBody AuditFeedback feedback
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Updated", auditService.updateFeedback(id, feedback)));
    }

    @DeleteMapping("/feedback/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR')")
    public ResponseEntity<ApiResponse<Void>> deleteFeedback(@PathVariable Long id) {
        auditService.deleteFeedback(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted"));
    }

    // ===== Clause Master =====

    @GetMapping("/clauses")
    public ResponseEntity<ApiResponse<List<ClauseMaster>>> getAllClauses() {
        return ResponseEntity.ok(ApiResponse.ok(auditService.getAllClauses()));
    }

    @GetMapping("/clauses/certification/{certId}")
    public ResponseEntity<ApiResponse<List<ClauseMaster>>> getClausesByCertification(@PathVariable Long certId) {
        return ResponseEntity.ok(ApiResponse.ok(auditService.getClausesByCertification(certId)));
    }

    @GetMapping("/clauses/department/{deptId}")
    public ResponseEntity<ApiResponse<List<ClauseMaster>>> getClausesByDepartment(@PathVariable Long deptId) {
        return ResponseEntity.ok(ApiResponse.ok(auditService.getClausesByDepartment(deptId)));
    }

    @GetMapping("/clauses/observation")
    public ResponseEntity<ApiResponse<List<ClauseMaster>>> getClausesForObservation(
            @RequestParam Long certId, @RequestParam Long deptId) {
        return ResponseEntity.ok(ApiResponse.ok(auditService.getClausesForObservation(certId, deptId)));
    }

    @GetMapping("/clauses/{id}")
    public ResponseEntity<ApiResponse<ClauseMaster>> getClauseById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(auditService.getClauseById(id)));
    }

    @PostMapping("/clauses")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<ClauseMaster>> createClause(@RequestBody ClauseMaster clause) {
        return ResponseEntity.ok(ApiResponse.ok("Clause created", auditService.createClause(clause)));
    }

    @PutMapping("/clauses/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<ClauseMaster>> updateClause(
            @PathVariable Long id, @RequestBody ClauseMaster clause) {
        return ResponseEntity.ok(ApiResponse.ok("Updated", auditService.updateClause(id, clause)));
    }

    @DeleteMapping("/clauses/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR')")
    public ResponseEntity<ApiResponse<Void>> deleteClause(@PathVariable Long id) {
        auditService.deleteClause(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted"));
    }

    // ===== PDF Reports =====

    @GetMapping("/reports/nc/{certId}")
    public ResponseEntity<byte[]> downloadNcReport(@PathVariable Long certId) {
        List<NcTracking> ncs = auditService.getNcsByCertification(certId);
        byte[] pdf = pdfReportService.generateNcReport(ncs, "Certification " + certId);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"NC_Report.pdf\"")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdf);
    }
}
