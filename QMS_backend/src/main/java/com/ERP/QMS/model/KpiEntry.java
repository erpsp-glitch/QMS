package com.ERP.QMS.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "kpi_entries",
    uniqueConstraints = @UniqueConstraint(columnNames = {"kpi_master_id", "year", "month"})
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "kpi_master_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "objective", "calculationFormula",
            "createdAt", "updatedAt"})
    private KpiMaster kpiMaster;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false, length = 3)
    private String month;             // e.g. "JAN", "FEB"

    private Double targetValue;
    private Double actualValue;
    private Double achievementPercent; // calculated

    private Double previousMonthValue; // for trend comparison
    private Double variance;           // actualValue - targetValue

    @Enumerated(EnumType.STRING)
    private KpiStatus status = KpiStatus.NOT_UPDATED;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    private String evidencePath;

    @Column(length = 100)
    private String enteredBy;

    @Column(length = 100)
    private String reviewedBy;

    @Enumerated(EnumType.STRING)
    private ReviewStatus reviewStatus = ReviewStatus.PENDING;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // GREEN = Achieved, YELLOW = Warning, RED = Failed
    public enum KpiStatus {
        NOT_UPDATED, ACHIEVED, WARNING, FAILED,
        PENDING, BELOW_TARGET  // kept for backward compat
    }

    public enum ReviewStatus {
        PENDING, APPROVED, REJECTED
    }
}
