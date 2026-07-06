package com.ERP.QMS.controller;

import com.ERP.QMS.dto.ApiResponse;
import com.ERP.QMS.model.Document;
import com.ERP.QMS.service.DocumentService;
import com.ERP.QMS.service.PdfReportService;
import com.ERP.QMS.service.SequenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final PdfReportService pdfReportService;
    private final SequenceService sequenceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Document>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(documentService.getAll()));
    }

    @GetMapping("/certification/{certId}")
    public ResponseEntity<ApiResponse<List<Document>>> getByCertification(@PathVariable Long certId) {
        return ResponseEntity.ok(ApiResponse.ok(documentService.getByCertification(certId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Document>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(documentService.getById(id)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<Document>> create(
        @RequestPart("data") Document doc,
        @RequestPart(value = "file", required = false) MultipartFile file
    ) throws Exception {
        return ResponseEntity.ok(ApiResponse.ok("Document created", documentService.create(doc, file)));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<Document>> update(
        @PathVariable Long id,
        @RequestPart("data") Document doc,
        @RequestPart(value = "file", required = false) MultipartFile file
    ) throws Exception {
        return ResponseEntity.ok(ApiResponse.ok("Updated", documentService.update(id, doc, file)));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR')")
    public ResponseEntity<ApiResponse<Document>> approve(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Approved", documentService.approve(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        documentService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted"));
    }

    @GetMapping("/reports/master-list/{certId}")
    public ResponseEntity<byte[]> downloadMasterList(@PathVariable Long certId) {
        List<Document> docs = documentService.getByCertification(certId);
        byte[] pdf = pdfReportService.generateDocumentMasterList(docs, "Certification " + certId);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Document_Master_List.pdf\"")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdf);
    }

    /** Generate next document number based on dept code and doc type */
    @GetMapping("/generate-number")
    public ResponseEntity<ApiResponse<Map<String, String>>> generateNumber(
            @RequestParam(defaultValue = "QMS") String companyCode,
            @RequestParam(defaultValue = "QA") String deptCode,
            @RequestParam(defaultValue = "WI") String docType) {
        String number = sequenceService.nextDocumentNumber(companyCode, deptCode, docType);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("documentNumber", number)));
    }
}
