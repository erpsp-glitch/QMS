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
    name = "process_review_sheets",
    indexes = {
        @Index(name = "idx_prs_plan", columnList = "process_review_plan_id"),
        @Index(name = "idx_prs_status", columnList = "status")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessReviewSheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String prsRefNo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "process_review_plan_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "reviewScope", "reviewObjective",
            "reviewCriteria", "remarks", "createdAt", "updatedAt"})
    private ProcessReviewPlan processReviewPlan;

    @Column(length = 100)
    private String department;

    @Column(length = 200)
    private String processName;

    @Column(length = 100)
    private String processOwner;

    @Column(length = 100)
    private String processReviewedBy;

    private LocalDate lastReviewDate;

    private LocalDate currentReviewDate;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "prs_checklist_items", joinColumns = @JoinColumn(name = "prs_id"))
    @Builder.Default
    private List<ReviewChecklistItem> reviewChecklist = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ProcessEffectiveness processEffectiveness;

    @Column(length = 200)
    private String kpiAchievement;

    @Column(length = 200)
    private String auditFindingsImpact;

    @Column(length = 200)
    private String customerFeedbackImpact;

    @Column(columnDefinition = "TEXT")
    private String risksIdentified;

    @Column(columnDefinition = "TEXT")
    private String opportunitiesForImprovement;

    @Column(columnDefinition = "TEXT")
    private String overallComments;

    @Column(columnDefinition = "TEXT")
    private String recommendation;

    private boolean actionRequired = false;

    @Column(length = 100)
    private String actionResponsiblePerson;

    private LocalDate actionTargetDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private SheetStatus status = SheetStatus.DRAFT;

    @Column(length = 100)
    private String reviewedBy;

    private LocalDate reviewDate;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum ProcessEffectiveness {
        EFFECTIVE, PARTIALLY_EFFECTIVE, INEFFECTIVE
    }

    public enum SheetStatus {
        DRAFT, REVIEWED, APPROVED, CLOSED
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewChecklistItem {
        private int serialNo;

        @Column(length = 300)
        private String reviewPoint;

        @Column(columnDefinition = "TEXT")
        private String description;

        @Column(length = 30)
        private String status;

        @Column(columnDefinition = "TEXT")
        private String remarks;
    }
}
