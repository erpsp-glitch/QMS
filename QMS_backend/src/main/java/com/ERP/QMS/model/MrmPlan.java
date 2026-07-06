package com.ERP.QMS.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "mrm_plans",
    indexes = {
        @Index(name = "idx_mrm_cert",   columnList = "certification_id"),
        @Index(name = "idx_mrm_status", columnList = "status"),
        @Index(name = "idx_mrm_date",   columnList = "meetingDate")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MrmPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String mrmRefNo;           // e.g. MRM-AS9100-2026-001

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "certification_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "scope", "applicableClauses",
            "certificatePath", "createdAt", "updatedAt"})
    private Certification certification;

    @Enumerated(EnumType.STRING)
    private MrmType mrmType;

    private LocalDate meetingDate;

    @Column(length = 20)
    private String meetingTime;        // e.g. "10:00 AM"

    @Column(length = 200)
    private String meetingLocation;    // e.g. Conference Room

    @Column(length = 30)
    private String financialYear;      // e.g. 2025-2026

    @Column(length = 100)
    private String chairman;

    @Column(length = 100)
    private String mrRepresentative;

    @Column(length = 100)
    private String coordinator;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "mrm_attendees", joinColumns = @JoinColumn(name = "mrm_plan_id"))
    @Column(name = "attendee")
    @Builder.Default
    private List<String> attendees = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "mrm_invitees", joinColumns = @JoinColumn(name = "mrm_plan_id"))
    @Column(name = "invitee")
    @Builder.Default
    private List<String> invitees = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String scope;

    @Enumerated(EnumType.STRING)
    private MrmStatus status = MrmStatus.PLANNED;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    // Approval section
    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column(length = 100)
    private String approvedBy;

    private LocalDate approvalDate;

    // MOM conclusion fields (stored on plan for simplicity)
    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private MomStatus momStatus = MomStatus.DRAFT;

    @Column(columnDefinition = "TEXT")
    private String meetingConclusion;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private OverallEffectiveness overallEffectiveness;

    @Column(length = 100)
    private String preparedBy;

    @Column(length = 100)
    private String momReviewedBy;

    @Column(length = 100)
    private String momApprovedBy;

    private LocalDate momApprovalDate;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private Long createdBy;

    public enum MrmType {
        ANNUAL, HALF_YEARLY, QUARTERLY, SPECIAL_REVIEW, MANAGEMENT_REVIEW
    }

    public enum MrmStatus {
        PLANNED, APPROVED, IN_PROGRESS, COMPLETED, CANCELLED
    }

    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
    }

    public enum MomStatus {
        DRAFT, REVIEWED, APPROVED, CLOSED
    }

    public enum OverallEffectiveness {
        EFFECTIVE, PARTIALLY_EFFECTIVE, NEEDS_IMPROVEMENT
    }
}
