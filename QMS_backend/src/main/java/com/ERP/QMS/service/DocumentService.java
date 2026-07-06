package com.ERP.QMS.service;

import com.ERP.QMS.model.Certification;
import com.ERP.QMS.model.Department;
import com.ERP.QMS.model.Document;
import com.ERP.QMS.repository.CertificationRepository;
import com.ERP.QMS.repository.DepartmentRepository;
import com.ERP.QMS.repository.DocumentRepository;
import com.ERP.QMS.repository.IssueRegisterRepository;
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
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final CertificationRepository certificationRepository;
    private final DepartmentRepository departmentRepository;
    private final IssueRegisterRepository issueRegisterRepository;

    @Value("${qms.upload.dir}")
    private String uploadDir;

    public List<Document> getByCertification(Long certId) {
        return documentRepository.findByCertificationId(certId);
    }

    public List<Document> getByCertificationAndDepartment(Long certId, Long deptId) {
        return documentRepository.findByCertificationIdAndDepartmentId(certId, deptId);
    }

    public Document getById(Long id) {
        return documentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Document not found: " + id));
    }

    @Transactional
    public Document create(Document doc, MultipartFile file) throws IOException {
        if (documentRepository.existsByDocumentNumber(doc.getDocumentNumber())) {
            throw new RuntimeException("Document number already exists: " + doc.getDocumentNumber());
        }
        syncDocumentFields(doc);
        resolveAssociations(doc);
        if (file != null && !file.isEmpty()) {
            doc.setFilePath(saveFile(file, "documents"));
        }
        return documentRepository.save(doc);
    }

    @Transactional
    public Document update(Long id, Document updated, MultipartFile file) throws IOException {
        Document existing = getById(id);

        if (!existing.getRevisionNumber().equals(updated.getRevisionNumber())) {
            existing.setStatus(Document.DocumentStatus.OBSOLETE);
            documentRepository.save(existing);

            Document newDoc = Document.builder()
                .certification(existing.getCertification())
                .department(existing.getDepartment())
                .documentNumber(existing.getDocumentNumber())
                .title(updated.getTitle())
                .level(existing.getLevel())
                .revisionNumber(updated.getRevisionNumber())
                .revisionDate(updated.getRevisionDate())
                .effectiveDate(updated.getEffectiveDate())
                .nextReviewDate(updated.getNextReviewDate())
                .owner(updated.getOwner())
                .preparedBy(updated.getPreparedBy())
                .reviewedBy(updated.getReviewedBy())
                .approvedBy(updated.getApprovedBy())
                .description(updated.getDescription())
                .status(Document.DocumentStatus.DRAFT)
                .build();

            if (file != null && !file.isEmpty()) {
                newDoc.setFilePath(saveFile(file, "documents"));
            }
            return documentRepository.save(newDoc);
        }

        syncDocumentFields(updated);
        String displayName = updated.getDocumentName() != null ? updated.getDocumentName() : updated.getTitle();
        existing.setTitle(displayName);
        existing.setDocumentName(displayName);
        existing.setDocumentType(updated.getDocumentType());
        existing.setKeywords(updated.getKeywords());
        existing.setChangeDescription(updated.getChangeDescription());
        existing.setDescription(updated.getDescription());
        existing.setOwner(updated.getOwner());
        existing.setReviewFrequency(updated.getReviewFrequency());
        existing.setNextReviewDate(updated.getNextReviewDate());
        existing.setEffectiveDate(updated.getEffectiveDate());
        existing.setPreparedBy(updated.getPreparedBy());
        existing.setPreparedById(updated.getPreparedById());
        existing.setReviewedBy(updated.getReviewedBy());
        existing.setReviewedById(updated.getReviewedById());
        existing.setApprovedBy(updated.getApprovedBy());
        existing.setApprovedById(updated.getApprovedById());
        existing.setCopyType(updated.getCopyType());
        existing.setReferenceNumber(updated.getReferenceNumber());
        existing.setStatus(updated.getStatus());

        if (updated.getCertification() != null && updated.getCertification().getId() != null) {
            existing.setCertification(certificationRepository.findById(updated.getCertification().getId()).orElse(null));
        }
        if (updated.getDepartment() != null && updated.getDepartment().getId() != null) {
            existing.setDepartment(departmentRepository.findById(updated.getDepartment().getId()).orElse(null));
        } else if (updated.getDepartment() == null) {
            existing.setDepartment(null);
        }

        if (file != null && !file.isEmpty()) {
            existing.setFilePath(saveFile(file, "documents"));
        }
        return documentRepository.save(existing);
    }

    @Transactional
    public Document approve(Long id) {
        Document doc = getById(id);
        doc.setStatus(Document.DocumentStatus.ACTIVE);
        return documentRepository.save(doc);
    }

    @Transactional
    public void delete(Long id) {
        documentRepository.deleteById(id);
    }

    public List<Document> getAll() {
        return documentRepository.findAll();
    }

    private void syncDocumentFields(Document doc) {
        // Keep title and documentName in sync
        if (doc.getDocumentName() != null && doc.getTitle() == null) {
            doc.setTitle(doc.getDocumentName());
        } else if (doc.getTitle() != null && doc.getDocumentName() == null) {
            doc.setDocumentName(doc.getTitle());
        }
    }

    private void resolveAssociations(Document doc) {
        if (doc.getCertification() != null && doc.getCertification().getId() != null) {
            Certification cert = certificationRepository.findById(doc.getCertification().getId()).orElse(null);
            doc.setCertification(cert);
        } else {
            doc.setCertification(null);
        }
        if (doc.getDepartment() != null && doc.getDepartment().getId() != null) {
            Department dept = departmentRepository.findById(doc.getDepartment().getId()).orElse(null);
            doc.setDepartment(dept);
        } else {
            doc.setDepartment(null);
        }
    }

    private String saveFile(MultipartFile file, String subfolder) throws IOException {
        Path dir = Paths.get(uploadDir, subfolder);
        Files.createDirectories(dir);
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path target = dir.resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        return target.toString();
    }
}
