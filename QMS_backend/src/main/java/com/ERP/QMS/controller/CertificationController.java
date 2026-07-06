package com.ERP.QMS.controller;

import com.ERP.QMS.dto.ApiResponse;
import com.ERP.QMS.model.Certification;
import com.ERP.QMS.service.CertificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/certifications")
@RequiredArgsConstructor
public class CertificationController {

    private final CertificationService certificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Certification>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(certificationService.getAll()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Certification>>> getActive() {
        return ResponseEntity.ok(ApiResponse.ok(certificationService.getActive()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Certification>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(certificationService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR')")
    public ResponseEntity<ApiResponse<Certification>> create(@RequestBody Certification cert) {
        return ResponseEntity.ok(ApiResponse.ok("Certification created", certificationService.create(cert)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR')")
    public ResponseEntity<ApiResponse<Certification>> update(@PathVariable Long id, @RequestBody Certification cert) {
        return ResponseEntity.ok(ApiResponse.ok("Updated", certificationService.update(id, cert)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        certificationService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted"));
    }

    @PostMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<Certification>> uploadFile(
        @PathVariable Long id,
        @RequestPart("file") MultipartFile file
    ) throws IOException {
        return ResponseEntity.ok(ApiResponse.ok("File uploaded", certificationService.uploadFile(id, file)));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id) throws IOException {
        byte[] data = certificationService.downloadFile(id);
        String contentType = certificationService.getContentType(id);
        String filename = certificationService.getFilename(id);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.parseMediaType(contentType))
            .body(data);
    }
}
