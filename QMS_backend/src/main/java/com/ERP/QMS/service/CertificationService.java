package com.ERP.QMS.service;

import com.ERP.QMS.model.Certification;
import com.ERP.QMS.repository.CertificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CertificationService {

    private final CertificationRepository certificationRepository;

    @Value("${qms.upload.dir}")
    private String uploadDir;

    public List<Certification> getAll() {
        return certificationRepository.findAll();
    }

    public Certification getById(Long id) {
        return certificationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Certification not found: " + id));
    }

    @Transactional
    public Certification create(Certification cert) {
        if (certificationRepository.existsByCode(cert.getCode())) {
            throw new RuntimeException("Certification code already exists: " + cert.getCode());
        }
        return certificationRepository.save(cert);
    }

    @Transactional
    public Certification update(Long id, Certification updated) {
        Certification existing = getById(id);
        existing.setName(updated.getName());
        existing.setStandardName(updated.getStandardName());
        existing.setStandardVersion(updated.getStandardVersion());
        existing.setStandardType(updated.getStandardType());
        existing.setIndustrySector(updated.getIndustrySector());
        existing.setCertificationBody(updated.getCertificationBody());
        existing.setCertificateNumber(updated.getCertificateNumber());
        existing.setScope(updated.getScope());
        existing.setApplicableClauses(updated.getApplicableClauses());
        existing.setReminderSettings(updated.getReminderSettings());
        existing.setIssueDate(updated.getIssueDate());
        existing.setExpiryDate(updated.getExpiryDate());
        existing.setRenewalDate(updated.getRenewalDate());
        existing.setSurveillanceDate(updated.getSurveillanceDate());
        existing.setStatus(updated.getStatus());
        return certificationRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        certificationRepository.deleteById(id);
    }

    public List<Certification> getActive() {
        return certificationRepository.findByStatus(Certification.CertificationStatus.ACTIVE);
    }

    @Transactional
    public Certification uploadFile(Long id, MultipartFile file) throws IOException {
        Certification cert = getById(id);
        Path dir = Paths.get(uploadDir, "certifications");
        Files.createDirectories(dir);
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path target = dir.resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        cert.setCertificatePath(target.toString());
        return certificationRepository.save(cert);
    }

    public byte[] downloadFile(Long id) throws IOException {
        Certification cert = getById(id);
        if (cert.getCertificatePath() == null) {
            throw new RuntimeException("No certificate file uploaded for this certification.");
        }
        Path filePath = Paths.get(cert.getCertificatePath());
        if (!Files.exists(filePath)) {
            throw new RuntimeException("Certificate file not found on server.");
        }
        return Files.readAllBytes(filePath);
    }

    public String getFilename(Long id) {
        Certification cert = getById(id);
        if (cert.getCertificatePath() == null) return "certificate.pdf";
        return Paths.get(cert.getCertificatePath()).getFileName().toString();
    }

    public String getContentType(Long id) {
        Certification cert = getById(id);
        if (cert.getCertificatePath() == null) return "application/octet-stream";
        try {
            String type = Files.probeContentType(Paths.get(cert.getCertificatePath()));
            return type != null ? type : "application/octet-stream";
        } catch (IOException e) {
            return "application/octet-stream";
        }
    }
}
