package com.ERP.QMS.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_feedbacks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "audit_plan_id", nullable = false)
    private AuditPlan auditPlan;

    @Column(length = 100)
    private String auditorName;

    @Column(length = 100)
    private String auditeeName;

    @Column(length = 100)
    private String process;

    private LocalDate auditDate;

    // Rating fields (1=Poor, 2=Average, 3=Good, 4=Excellent)
    private Integer auditorKnowledge;
    private Integer technicalCompetency;
    private Integer auditCoverage;
    private Integer auditorQualities;
    private Integer employeeInteraction;
    private Integer clarityInCommunication;
    private Integer timeManagement;
    private Integer consistencyApproach;
    private Integer queryResponse;
    private Integer observationComments;

    @Column(columnDefinition = "TEXT")
    private String incidentExplanation;

    @Column(columnDefinition = "TEXT")
    private String valueAdditions;

    @Column(columnDefinition = "TEXT")
    private String suggestions;

    @Enumerated(EnumType.STRING)
    private FeedbackStatus status = FeedbackStatus.SUBMITTED;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum FeedbackStatus {
        DRAFT, SUBMITTED
    }
}
