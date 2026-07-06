package com.ERP.QMS.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "documents",
    indexes = {
        @Index(name = "idx_doc_cert",    columnList = "certification_id"),
        @Index(name = "idx_doc_dept",    columnList = "department_id"),
        @Index(name = "idx_doc_status",  columnList = "status"),
        @Index(name = "idx_doc_number",  columnList = "documentNumber"),
        @Index(name = "idx_doc_review",  columnList = "nextReviewDate"),
        @Index(name = "idx_doc_type",    columnList = "documentType")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "certification_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "scope", "certificationBody",
            "issueDate", "expiryDate", "renewalDate", "surveillanceDate", "certificatePath",
            "createdAt", "updatedAt"})
    private Certification certification;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "processDescription", "objectives",
            "description", "departmentHead", "email", "createdAt", "updatedAt"})
    private Department department;

    @Column(nullable = false, length = 50)
    private String documentNumber;      // e.g. ARTL-QA-WI-001

    @Column(nullable = false, length = 200)
    private String title;               // Kept for backward compat

    @Column(length = 200)
    private String documentName;        // Same as title, preferred name per spec

    @JsonProperty("documentLevel")
    @Enumerated(EnumType.STRING)
    @Column(name = "level", nullable = false)
    private DocumentLevel level = DocumentLevel.LEVEL_2;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private DocumentType documentType;  // QM, QSP, WI, FM, RF, LF

    @Column(nullable = false)
    private String revisionNumber = "00";

    private LocalDate revisionDate;
    private LocalDate effectiveDate;
    private LocalDate nextReviewDate;

    @Column(length = 20)
    private String reviewFrequency;     // 6M, 1Y, 2Y

    @Column(length = 150)
    private String owner;

    @Column(length = 100)
    private String preparedBy;
    @Column(length = 100)
    private String preparedById;

    @Column(length = 100)
    private String reviewedBy;
    @Column(length = 100)
    private String reviewedById;

    @Column(length = 100)
    private String approvedBy;
    @Column(length = 100)
    private String approvedById;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String keywords;            // Comma-sep tags for search

    @Column(columnDefinition = "TEXT")
    private String changeDescription;   // What changed in this revision

    @Column(columnDefinition = "TEXT")
    private String changeLog;           // Full revision history (auto-appended)

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private CopyType copyType = CopyType.CONTROLLED;

    @Column(length = 30)
    private String referenceNumber;     // REF-2025-001

    private String filePath;
    private String driveFileId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentStatus status = DocumentStatus.DRAFT;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private Long createdBy;

    public enum DocumentLevel {
        LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4
    }

    public enum DocumentType {
        QM, QSP, WI, FM, RF, LF
    }

    public enum CopyType {
        MASTER, CONTROLLED, UNCONTROLLED, REFERENCE
    }

    public enum DocumentStatus {
        DRAFT, UNDER_REVIEW, APPROVED, RELEASED, ACTIVE, OBSOLETE, ARCHIVED
    }
}
