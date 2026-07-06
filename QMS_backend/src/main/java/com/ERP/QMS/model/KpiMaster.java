package com.ERP.QMS.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "kpi_masters",
    indexes = {
        @Index(name = "idx_kpi_cert",   columnList = "certification_id"),
        @Index(name = "idx_kpi_dept",   columnList = "department_id"),
        @Index(name = "idx_kpi_code",   columnList = "kpiCode"),
        @Index(name = "idx_kpi_active", columnList = "active")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String kpiCode;           // Auto-generated e.g. KPI-ISO9001-001

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "certification_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "scope", "applicableClauses",
            "certificatePath", "createdAt", "updatedAt"})
    private Certification certification;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "processDescription",
            "objectives", "description", "createdAt", "updatedAt"})
    private Department department;

    @Column(nullable = false, length = 200)
    private String title;             // KPI Objective title (kept for compat)

    @Column(length = 200)
    private String kpiObjective;      // Same as title, per spec

    @Column(columnDefinition = "TEXT")
    private String objective;         // Description

    @Column(length = 50)
    private String kpiCategory;       // QUALITY, DELIVERY, PRODUCTION, HR, PURCHASE, MAINTENANCE, SAFETY, SALES

    @Enumerated(EnumType.STRING)
    private KpiType type;             // PERCENTAGE, NUMBER, RATIO, DAYS, COST

    @Column(length = 20)
    private String kpiType;           // Text alias for type (frontend compat)

    private Double targetValue;

    @Column(length = 50)
    private String unit;              // %, PPM, Nos, Days, Rs

    @Column(length = 20)
    private String direction;         // HIGHER_IS_BETTER, LOWER_IS_BETTER, EQUAL

    private Double warningLimit;      // Yellow threshold
    private Double criticalLimit;     // Red threshold

    @Enumerated(EnumType.STRING)
    private Frequency frequency;

    @Column(length = 30)
    private String financialYear;     // 2025-2026

    @Column(length = 50)
    private String dataSource;        // MANUAL, SYSTEM, IMPORT

    @Column(columnDefinition = "TEXT")
    private String calculationFormula; // (Total Rejected / Total Inspected) × 100

    @Column(length = 100)
    private String responsibility;

    @Column(length = 100)
    private String responsiblePerson;

    @Column(length = 100)
    private String monitoringPerson;

    @Column(length = 100)
    private String departmentHead;    // Auto from Department

    private boolean active = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum KpiType {
        PERCENTAGE, NUMBER, RATIO, DAYS, COST
    }

    public enum Frequency {
        MONTHLY, QUARTERLY, HALF_YEARLY, ANNUALLY
    }
}
