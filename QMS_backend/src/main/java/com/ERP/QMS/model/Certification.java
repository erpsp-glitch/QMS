package com.ERP.QMS.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "certifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Certification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;              // e.g. ISO9001, AS9100, ISO27001

    @Column(nullable = false, length = 100)
    private String name;             // e.g. ISO 9001:2015

    @Column(length = 100)
    private String standardName;     // e.g. ISO 9001

    @Column(length = 20)
    private String standardVersion;  // e.g. 2015, Rev D

    @Column(length = 50)
    private String standardType;     // Quality/Environment/Safety/Aerospace/Information Security

    @Column(length = 100)
    private String industrySector;   // Aerospace/Automotive/Medical/General

    @Column(length = 100)
    private String certificationBody; // e.g. Bureau Veritas

    @Column(length = 50)
    private String certificateNumber;

    @Column(columnDefinition = "TEXT")
    private String scope;

    @Column(columnDefinition = "TEXT")
    private String applicableClauses; // Comma-separated: "Clause 4,Clause 5,Clause 6"

    @Column(length = 20)
    private String reminderSettings;  // 30/60/90 days

    private LocalDate issueDate;
    private LocalDate expiryDate;
    private LocalDate renewalDate;
    private LocalDate surveillanceDate;

    private String certificatePath;  // uploaded file path

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CertificationStatus status = CertificationStatus.ACTIVE;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum CertificationStatus {
        ACTIVE, EXPIRED, SUSPENDED, INACTIVE
    }
}
