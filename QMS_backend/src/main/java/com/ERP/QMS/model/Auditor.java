package com.ERP.QMS.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "auditors")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Auditor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 30)
    private String auditorCode;        // AUD001

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuditorType type = AuditorType.INTERNAL;

    @Column(length = 200)
    private String organization;       // Company name for External auditors

    @Column(length = 200)
    private String qualification;      // B.E, MBA, IRCA LA

    @Column(length = 100)
    private String certificationNumber; // Lead Auditor cert number (deprecated, use leadAuditorCertNo)

    @Column(length = 100)
    private String leadAuditorCertNo;  // IRCA-LA-2025-001

    private LocalDate certIssueDate;
    private LocalDate certExpiryDate;

    private Integer experienceYears;
    private Integer auditHours;        // Total audit hours completed

    @Column(length = 100)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(length = 150)
    private String department;         // Department name (denormalized for simplicity)

    @Column(length = 50)
    private String competencyLevel;    // BEGINNER / INTERMEDIATE / EXPERIENCED / EXPERT / LEAD

    @Column(length = 50)
    private String branch;             // Branch or city (for External auditors)

    @Column(length = 255)
    private String assignedStandards;  // ISO 9001, AS9100D, ...

    @Column(columnDefinition = "TEXT")
    private String auditScope;         // Areas/processes audited

    @Column(length = 255)
    private String organizationType;   // INTERNAL / EXTERNAL (mirror of type for legacy compat)

    @Column(columnDefinition = "TEXT")
    private String areaOfExpertise;   // Comma-sep: Quality Management,Production,Aerospace

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "auditor_certifications", joinColumns = @JoinColumn(name = "auditor_id"))
    @Column(name = "certification_name", length = 100)
    @Builder.Default
    private List<String> certifications = new ArrayList<>(); // ISO 9001:2015 LA, AS9100D LA

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuditorStatus status = AuditorStatus.ACTIVE;

    private String resumePath;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum AuditorType { INTERNAL, EXTERNAL }
    public enum AuditorStatus { ACTIVE, INACTIVE }
}
