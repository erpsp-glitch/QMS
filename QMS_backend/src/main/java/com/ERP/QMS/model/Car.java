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
    name = "cars",
    indexes = {
        @Index(name = "idx_car_nc",   columnList = "nc_tracking_id"),
        @Index(name = "idx_car_cert", columnList = "certification_id"),
        @Index(name = "idx_car_status", columnList = "status")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String carNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "nc_tracking_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "createdAt", "updatedAt"})
    private NcTracking ncTracking;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "certification_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "scope", "applicableClauses",
            "certificatePath", "createdAt", "updatedAt"})
    private Certification certification;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "audit_plan_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "scope", "auditCriteria",
            "objective", "createdAt", "updatedAt"})
    private AuditPlan auditPlan;

    // Auto-filled from NC
    @Column(length = 100)
    private String department;

    @Column(length = 30)
    private String clause;

    @Column(length = 30)
    private String ncType;

    @Column(length = 30)
    private String priority;

    @Column(columnDefinition = "TEXT")
    private String ncDescription;

    @Column(columnDefinition = "TEXT")
    private String containmentAction;

    @Column(length = 100)
    private String responsiblePerson;

    private LocalDate targetDate;

    // User fills these
    @Column(length = 50)
    private String rcaMethod;

    @Column(columnDefinition = "TEXT")
    private String rootCause;

    @Column(columnDefinition = "TEXT")
    private String correctiveAction;

    // Verification
    @Column(length = 100)
    private String verificationBy;

    private LocalDate verificationDate;

    @Column(columnDefinition = "TEXT")
    private String verificationRemarks;

    @Column(length = 200)
    private String evidenceReference;

    private LocalDate closureDate;

    @Column(columnDefinition = "TEXT")
    private String closureRemarks;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private CarStatus status = CarStatus.OPEN;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum CarStatus {
        OPEN, IN_PROGRESS, PENDING_VERIFICATION, VERIFIED, CLOSED
    }
}
