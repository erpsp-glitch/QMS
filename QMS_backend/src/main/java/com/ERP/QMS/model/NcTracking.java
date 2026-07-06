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
    name = "nc_trackings",
    indexes = {
        @Index(name = "idx_nc_cert",   columnList = "certification_id"),
        @Index(name = "idx_nc_plan",   columnList = "audit_plan_id"),
        @Index(name = "idx_nc_status", columnList = "status"),
        @Index(name = "idx_nc_target", columnList = "targetDate")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NcTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String ncNumber;           // e.g. NC-AS9100-2026-001

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "certification_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "scope", "applicableClauses",
            "certificatePath", "createdAt", "updatedAt"})
    private Certification certification;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "audit_plan_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "scope", "auditCriteria",
            "objective", "createdAt", "updatedAt"})
    private AuditPlan auditPlan;

    @Column(name = "department")
    private String department;

    @Column(length = 100)
    private String auditorName;

    @Column(length = 100)
    private String auditeeName;

    private LocalDate auditDate;

    @Enumerated(EnumType.STRING)
    private NcType ncType;             // MINOR or MAJOR

    @Column(length = 30)
    private String clauseNo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String ncDescription;

    @Column(columnDefinition = "TEXT")
    private String containmentAction;  // Immediate correction taken

    private String containmentAttachmentPath;

    @Column(length = 30)
    private String rootCauseMethod;    // 5_WHY, FISHBONE, WHY_WHY

    @Column(columnDefinition = "TEXT")
    private String rootCause;

    @Column(columnDefinition = "TEXT")
    private String immediateCorrection; // kept for compat

    @Column(columnDefinition = "TEXT")
    private String correctiveAction;

    @Column(length = 100)
    private String responsiblePerson;

    private LocalDate targetDate;

    @Enumerated(EnumType.STRING)
    private NcPriority priority = NcPriority.MEDIUM;

    @Column(length = 100)
    private String verificationBy;

    private LocalDate verificationDate;

    @Column(columnDefinition = "TEXT")
    private String verificationRemarks;

    private String evidencePath;

    private Long observationId;

    @Enumerated(EnumType.STRING)
    private NcStatus status = NcStatus.OPEN;

    private LocalDate closureDate;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum NcType {
        MINOR, MAJOR
    }

    public enum NcPriority {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum NcStatus {
        OPEN, CONTAINMENT_DONE, ROOT_CAUSE_SUBMITTED, ACTION_INITIATED,
        PENDING_VERIFICATION, VERIFIED, CLOSED
    }
}
