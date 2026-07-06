package com.ERP.QMS.repository;

import com.ERP.QMS.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByCertificationId(Long certificationId);
    List<Document> findByCertificationIdAndDepartmentId(Long certId, Long deptId);
    List<Document> findByCertificationIdAndStatus(Long certId, Document.DocumentStatus status);
    Optional<Document> findByDocumentNumber(String documentNumber);
    boolean existsByDocumentNumber(String documentNumber);
    @Query("SELECT d FROM Document d WHERE d.certification.id = :certId ORDER BY d.createdAt DESC")
    List<Document> findByCertificationIdOrderByCreatedAtDesc(Long certId);
    long countByCertificationId(Long certificationId);
    long countByCertificationIdAndStatus(Long certificationId, Document.DocumentStatus status);

    @Query("SELECT COUNT(d) FROM Document d WHERE d.department.departmentCode = :deptCode AND d.documentType = :docType")
    long countByDepartmentCodeAndDocumentType(String deptCode, String docType);
}
