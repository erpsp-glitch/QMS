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
    name = "kpi_review",
    indexes = {
        @Index(name = "idx_kr_kpi_entry", columnList = "kpi_entry_id"),
        @Index(name = "idx_kr_cert", columnList = "certification_id"),
        @Index(name = "idx_kr_dept", columnList = "department_id")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Long id;

    @Column(name = "review_no", nullable = false, unique = true, length = 30)
    private String reviewNo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "kpi_entry_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private KpiEntry kpiEntry;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "certification_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Certification certification;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Department department;

    @Column(name = "reviewer_id", length = 100)
    private String reviewerId;

    @Column(name = "review_date")
    private LocalDate reviewDate;

    @Column(name = "performance_rating", length = 50)
    private String performanceRating;

    @Column(name = "achievement_percentage")
    private Double achievementPercentage;

    @Column(name = "review_status", length = 30)
    private String reviewStatus; // e.g. "PENDING_REVIEW", "UNDER_REVIEW", "COMPLETED", "APPROVED", "REJECTED", "ESCALATED"

    @Column(name = "review_decision", length = 50)
    private String reviewDecision; // APPROVED, NEEDS_IMPROVEMENT, UNDER_MONITORING, ESCALATED

    @Column(name = "management_comment", columnDefinition = "TEXT")
    private String managementComment;

    @Column(name = "strengths", columnDefinition = "TEXT")
    private String strengths;

    @Column(name = "weaknesses", columnDefinition = "TEXT")
    private String weaknesses;

    @Column(name = "root_cause", columnDefinition = "TEXT")
    private String rootCause;

    @Column(name = "improvement_opportunity", columnDefinition = "TEXT")
    private String improvementOpportunity;

    @Column(name = "corrective_action", columnDefinition = "TEXT")
    private String correctiveAction;

    @Column(name = "preventive_action", columnDefinition = "TEXT")
    private String preventiveAction;

    @Column(name = "responsible_person", length = 100)
    private String responsiblePerson;

    @Column(name = "target_completion_date")
    private LocalDate targetCompletionDate;

    @Column(name = "priority", length = 20)
    private String priority; // HIGH, MEDIUM, LOW

    @Column(name = "next_review_date")
    private LocalDate nextReviewDate;

    @Column(name = "attachment_path", length = 255)
    private String attachmentPath;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @UpdateTimestamp
    @Column(name = "updated_date")
    private LocalDateTime updatedDate;
}
