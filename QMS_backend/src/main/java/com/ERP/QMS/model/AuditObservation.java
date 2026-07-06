package com.ERP.QMS.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_observations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditObservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String observationId;     // Auto-generated

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "audit_plan_id", nullable = false)
    private AuditPlan auditPlan;

    @Column(name = "department")
    private String department;

    @Column(length = 100)
    private String auditee;

    private java.time.LocalDate auditDate;

    @Column(length = 30)
    private String clauseNo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FindingType findingType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String observationDescription;

    @Column(columnDefinition = "TEXT")
    private String objectiveEvidence;

    @Column(length = 20)
    private String riskLevel;

    @Column(length = 20)
    private String severity;

    private String attachmentPath;

    @Enumerated(EnumType.STRING)
    private ObservationStatus status = ObservationStatus.OPEN;

    private Long ncId;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum FindingType {
        POSITIVE_OBSERVATION, NEGATIVE_OBSERVATION, NC, NC_MINOR, NC_MAJOR, OFI
    }

    public enum ObservationStatus {
        OPEN, NC_RAISED, CLOSED
    }
}
