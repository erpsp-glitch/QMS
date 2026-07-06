package com.ERP.QMS.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "quality_issues",
    indexes = {
        @Index(name = "idx_qi_cert",   columnList = "certification_id"),
        @Index(name = "idx_qi_dept",   columnList = "department_id"),
        @Index(name = "idx_qi_status", columnList = "status"),
        @Index(name = "idx_qi_sev",    columnList = "severity")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QualityIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String issueNumber;       // Auto: QI-ISO9001-2026-001

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private IssueCategory category = IssueCategory.PROCESS;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private IssueSeverity severity = IssueSeverity.MEDIUM;

    @Column(length = 100)
    private String raisedBy;

    private LocalDate targetDate;

    @Column(columnDefinition = "TEXT")
    private String rootCause;

    @Column(columnDefinition = "TEXT")
    private String correctiveAction;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private IssueStatus status = IssueStatus.OPEN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "certification_id")
    private Certification certification;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum IssueCategory {
        PROCESS, PRODUCT, SYSTEM, SAFETY, CUSTOMER, SUPPLIER, OTHER
    }

    public enum IssueSeverity {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum IssueStatus {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED
    }
}
