package com.ERP.QMS.controller;

import com.ERP.QMS.dto.ApiResponse;
import com.ERP.QMS.model.KpiEntry;
import com.ERP.QMS.model.KpiMaster;
import com.ERP.QMS.service.KpiService;
import com.ERP.QMS.service.PdfReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/kpi")
@RequiredArgsConstructor
public class KpiController {

    private final KpiService kpiService;
    private final PdfReportService pdfReportService;

    // KPI Master
    @GetMapping("/masters")
    public ResponseEntity<ApiResponse<List<KpiMaster>>> getAllMasters() {
        return ResponseEntity.ok(ApiResponse.ok(kpiService.getAllMasters()));
    }

    @GetMapping("/masters/certification/{certId}")
    public ResponseEntity<ApiResponse<List<KpiMaster>>> getByCertification(@PathVariable Long certId) {
        return ResponseEntity.ok(ApiResponse.ok(kpiService.getMastersByCertification(certId)));
    }

    @PostMapping("/masters")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<KpiMaster>> createMaster(@RequestBody KpiMaster kpi) {
        return ResponseEntity.ok(ApiResponse.ok("KPI created", kpiService.createMaster(kpi)));
    }

    @PutMapping("/masters/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<KpiMaster>> updateMaster(@PathVariable Long id, @RequestBody KpiMaster kpi) {
        return ResponseEntity.ok(ApiResponse.ok("Updated", kpiService.updateMaster(id, kpi)));
    }

    @DeleteMapping("/masters/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR')")
    public ResponseEntity<ApiResponse<Void>> deleteMaster(@PathVariable Long id) {
        kpiService.deleteMaster(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted"));
    }

    // KPI Entry
    @GetMapping("/entries/certification/{certId}")
    public ResponseEntity<ApiResponse<List<KpiEntry>>> getEntries(
        @PathVariable Long certId,
        @RequestParam Integer year,
        @RequestParam(required = false) String month
    ) {
        List<KpiEntry> entries = month != null
            ? kpiService.getEntriesByCertificationAndMonth(certId, year, month)
            : kpiService.getEntriesByCertification(certId, year);
        return ResponseEntity.ok(ApiResponse.ok(entries));
    }

    @PostMapping("/entries")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR','DEPARTMENT_HEAD')")
    public ResponseEntity<ApiResponse<KpiEntry>> saveEntry(@RequestBody KpiEntry entry) {
        return ResponseEntity.ok(ApiResponse.ok("Saved", kpiService.saveEntry(entry)));
    }

    @PostMapping("/entries/{id}/approve")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR')")
    public ResponseEntity<ApiResponse<KpiEntry>> approveEntry(
        @PathVariable Long id,
        @RequestParam String reviewedBy
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Approved", kpiService.approveEntry(id, reviewedBy)));
    }

    @GetMapping("/reports/{certId}")
    public ResponseEntity<byte[]> downloadReport(
        @PathVariable Long certId,
        @RequestParam Integer year,
        @RequestParam String month
    ) {
        List<KpiEntry> entries = kpiService.getEntriesByCertificationAndMonth(certId, year, month);
        byte[] pdf = pdfReportService.generateKpiReport(entries, "Cert " + certId, month, year);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"KPI_Report.pdf\"")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdf);
    }
}
