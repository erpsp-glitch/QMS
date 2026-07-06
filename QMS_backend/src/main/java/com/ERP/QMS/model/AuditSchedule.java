package com.ERP.QMS.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "audit_schedules")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "audit_plan_id", nullable = false)
    private AuditPlan auditPlan;

    @Column(name = "department", length = 100)
    private String department;

    @Column(length = 100)
    private String location;

    private LocalDate auditDate;
    private LocalTime startTime;
    private LocalTime endTime;

    @Column(length = 100)
    private String auditor;

    @Column(length = 100)
    private String auditee;

    @Column(columnDefinition = "TEXT")
    private String agendaTopics;

    @Enumerated(EnumType.STRING)
    private ScheduleStatus status = ScheduleStatus.PLANNED;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum ScheduleStatus {
        PLANNED, CONFIRMED, COMPLETED, RESCHEDULED, CANCELLED
    }
}
