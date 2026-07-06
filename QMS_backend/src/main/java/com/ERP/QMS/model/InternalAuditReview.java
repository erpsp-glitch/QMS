package com.ERP.QMS.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "internal_audit_reviews",
    indexes = {
        @Index(name = "idx_iar_mrm",  columnList = "mrm_plan_id"),
        @Index(name = "idx_iar_cert", columnList = "certification_id")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InternalAuditReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String auditReviewId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mrm_plan_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "attendees", "invitees",
            "scope", "remarks", "createdAt", "updatedAt"})
    private MrmPlan mrmPlan;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "certification_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "scope", "applicableClauses",
            "certificatePath", "createdAt", "updatedAt"})
    private Certification certification;

    private LocalDate reviewDate;

    @Column(length = 30)
    private String financialYear;

    // Audit dashboard (snapshot at time of review)
    private int totalAuditsConducted;
    private int totalClausesAudited;
    private int totalConformance;
    private int totalObservations;
    private int totalOfi;
    private int totalNc;
    private int openNc;
    private int closedNc;
    private int overdueNc;
    private int totalObs;
    private int openCar;
    private int closedCar;

    // Management review
    @Column(columnDefinition = "TEXT")
    private String managementComments;

    @Enumerated(EnumType.STRING)
    @Column(length = 40)
    private ReviewDecision reviewDecision;

    @Column(length = 100)
    private String responsiblePerson;

    private LocalDate targetCompletionDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ReviewStatus reviewStatus = ReviewStatus.DRAFT;

    @Column(length = 100)
    private String reviewedBy;

    @Column(length = 100)
    private String approvedBy;

    private LocalDate approvalDate;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum ReviewDecision {
        CONTINUE, IMPROVE, CORRECTIVE_ACTION_REQUIRED, MONITOR, ESCALATE
    }

    public enum ReviewStatus {
        DRAFT, REVIEWED, APPROVED, CLOSED
    }
}
