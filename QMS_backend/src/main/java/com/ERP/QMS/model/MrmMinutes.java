package com.ERP.QMS.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "mrm_minutes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MrmMinutes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name = "mrm_plan_id", nullable = false)
private MrmPlan mrmPlan;

   @ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name = "mrm_agenda_id")
private MrmAgenda mrmAgenda;

    @Column(length = 200)
    private String agendaTopic;

    @Column(columnDefinition = "TEXT")
    private String inputDetails;

    @Column(columnDefinition = "TEXT")
    private String discussionDetails;

    @Column(columnDefinition = "TEXT")
    private String decisionTaken;

    private boolean actionRequired = false;

    @Column(length = 100)
    private String responsiblePerson;

    private LocalDate targetDate;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    private LocalDate closureDate;

    @Column(columnDefinition = "TEXT")
    private String closureRemarks;

    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.MEDIUM;

    @Enumerated(EnumType.STRING)
    private MinutesStatus status = MinutesStatus.OPEN;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum Priority {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum MinutesStatus {
        OPEN, IN_PROGRESS, COMPLETED, CANCELLED, CLOSED
    }
}
