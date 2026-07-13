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
    name = "mrm_kpi_reviews",
    indexes = {
        @Index(name = "idx_mkpir_mrm",  columnList = "mrm_plan_id"),
        @Index(name = "idx_mkpir_cert", columnList = "certification_id")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MrmKpiReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String kpiReviewId;

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

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "mrm_kpi_review_items", joinColumns = @JoinColumn(name = "mrm_kpi_review_id"))
    @Builder.Default
    private List<KpiReviewItem> kpiPerformanceItems = new ArrayList<>();

    // Summary (auto-calculated)
    private int totalKpiReviewed;
    private int achieved;
    private int partiallyAchieved;
    private int notAchieved;

    // Management review
    @Enumerated(EnumType.STRING)
    @Column(length = 40)
    private ReviewDecision reviewDecision;

    @Column(columnDefinition = "TEXT")
    private String managementComments;

    @Column(length = 100)
    private String responsiblePerson;

    private LocalDate targetCompletionDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ReviewStatus reviewStatus = ReviewStatus.DRAFT;

    @Column(length = 100)
    private String reviewedBy;

    private LocalDate reviewedDate;

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

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KpiReviewItem {
        @Column(length = 30)
        private String kpiCode;

        @Column(length = 200)
        private String kpiName;

        @Column(length = 100)
        private String department;

        @Column(length = 30)
        private String frequency;

        private double target;

        @Column(length = 20)
        private String unit;

        private Double actualValue;

        private Double achievementPercent;

        @Column(length = 30)
        private String achievementStatus;

        @Column(columnDefinition = "TEXT")
        private String remarks;
    }
}
