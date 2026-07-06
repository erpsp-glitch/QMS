package com.ERP.QMS.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "action_trackers",
    indexes = {
        @Index(name = "idx_act_status", columnList = "status"),
        @Index(name = "idx_act_target", columnList = "targetCompletionDate"),
        @Index(name = "idx_act_source", columnList = "sourceModule")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActionTracker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String actionNo;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private SourceModule sourceModule;

    @Column(length = 50)
    private String sourceReferenceNo;

    private LocalDate actionDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ActionPriority priority = ActionPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ActionStatus status = ActionStatus.OPEN;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String actionDescription;

    @Column(length = 100)
    private String responsiblePerson;

    @Column(length = 100)
    private String department;

    private LocalDate targetCompletionDate;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    // Reminder settings
    private boolean reminderRequired = true;

    @Column(length = 20)
    private String reminderFrequency;

    private int reminderDaysBeforeDue = 7;

    private boolean escalationRequired = false;

    // Progress
    @Column(columnDefinition = "TEXT")
    private String progressUpdate;

    private int completionPercent;

    @Column(length = 100)
    private String updatedBy;

    private LocalDate updateDate;

    // Verification
    private boolean verificationRequired = true;

    @Column(length = 100)
    private String verifiedBy;

    private LocalDate verificationDate;

    @Column(columnDefinition = "TEXT")
    private String verificationRemarks;

    // Closure
    @Column(columnDefinition = "TEXT")
    private String closureEvidence;

    private LocalDate closureDate;

    @Column(columnDefinition = "TEXT")
    private String closureRemarks;

    // Approval
    @Column(length = 100)
    private String reviewedBy;

    @Column(length = 100)
    private String approvedBy;

    private LocalDate approvalDate;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum SourceModule {
        MOM, KPI_REVIEW, AUDIT_REVIEW, PROCESS_REVIEW, CAR, NC, MANUAL
    }

    public enum ActionPriority {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum ActionStatus {
        OPEN, IN_PROGRESS, PENDING_VERIFICATION, VERIFIED, CLOSED, OVERDUE
    }
}
