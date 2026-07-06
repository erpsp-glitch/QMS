package com.ERP.QMS.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "audit_plans",
    indexes = {
        @Index(name = "idx_ap_cert",   columnList = "certification_id"),
        @Index(name = "idx_ap_status", columnList = "status"),
        @Index(name = "idx_ap_year",   columnList = "auditYear"),
        @Index(name = "idx_ap_refno",  columnList = "auditRefNo")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String auditRefNo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "certification_id", nullable = false)
    private Certification certification;

    @Column(nullable = false)
    private Integer auditYear;

    @Enumerated(EnumType.STRING)
    private AuditType auditType;

    @Column(length = 200)
    private String auditTitle;

    @Column(length = 100)
    private String leadAuditor;

    @Column(columnDefinition = "TEXT")
    private String auditorTeam;

    @Column(length = 100)
    private String auditCoordinator;

    @Column(columnDefinition = "TEXT")
    private String scope;

    @Column(columnDefinition = "TEXT")
    private String auditCriteria;

    @Column(columnDefinition = "TEXT")
    private String objective;

    private LocalDate plannedStartDate;
    private LocalDate plannedEndDate;
    private LocalDate actualStartDate;
    private LocalDate actualEndDate;

    private Integer durationDays;

    @Enumerated(EnumType.STRING)
    private AuditStatus status = AuditStatus.PLANNED;

    @Enumerated(EnumType.STRING)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column(length = 100)
    private String approvedBy;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private Long createdBy;

    public enum AuditType {
        INTERNAL, EXTERNAL, SURVEILLANCE, RECERTIFICATION, RE_AUDIT
    }

    public enum AuditStatus {
        DRAFT, PLANNED, APPROVED, SCHEDULED, IN_PROGRESS, NC_OPEN, CAPA, COMPLETED, CLOSED, CANCELLED
    }

    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
    }
}
