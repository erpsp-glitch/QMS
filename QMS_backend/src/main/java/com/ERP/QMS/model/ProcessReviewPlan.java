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
    name = "process_review_plans",
    indexes = {
        @Index(name = "idx_prp_mrm",  columnList = "mrm_plan_id"),
        @Index(name = "idx_prp_cert", columnList = "certification_id"),
        @Index(name = "idx_prp_dept", columnList = "department_id")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessReviewPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String prpRefNo;

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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "createdAt", "updatedAt"})
    private Department department;

    @Column(length = 200)
    private String processName;

    @Column(length = 100)
    private String departmentHead;

    @Column(length = 100)
    private String reviewer;

    private LocalDate plannedReviewDate;

    @Column(columnDefinition = "TEXT")
    private String reviewScope;

    @Column(columnDefinition = "TEXT")
    private String reviewObjective;

    @Column(columnDefinition = "TEXT")
    private String reviewCriteria;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private PrpStatus status = PrpStatus.PLANNED;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum PrpStatus {
        PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
    }
}
