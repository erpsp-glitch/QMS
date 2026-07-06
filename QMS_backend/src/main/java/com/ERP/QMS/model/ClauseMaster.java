package com.ERP.QMS.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "clause_masters",
    indexes = {
        @Index(name = "idx_clause_cert",   columnList = "certification_id"),
        @Index(name = "idx_clause_dept",   columnList = "department_id"),
        @Index(name = "idx_clause_status", columnList = "status")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClauseMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 20)
    private String clauseId;            // CLA-0001, CLA-0002 (auto-generated)

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "certification_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "scope", "applicableClauses",
            "certificatePath", "createdAt", "updatedAt"})
    private Certification certification;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "description", "processDescription",
            "objectives", "createdAt", "updatedAt"})
    private Department department;

    @Column(length = 20)
    private String mainClauseNumber;    // 4, 5, 6, 7, 8, 9, 10

    @Column(length = 200)
    private String mainClauseTitle;     // Context of Organization, Leadership, etc.

    @Column(length = 30)
    private String subClauseReference;  // 7.1.2, 8.5.1

    @Column(length = 200)
    private String subClauseTitle;      // Competence, Production, etc.

    @Column(columnDefinition = "TEXT")
    private String requirement;         // Requirement / Check Point (long text)

    @Column(columnDefinition = "TEXT")
    private String auditQuestion;       // Audit Question / Guideline (long text)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClauseStatus status = ClauseStatus.ACTIVE;

    @Column(length = 100)
    private String createdBy;

    @Column(length = 100)
    private String updatedBy;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum ClauseStatus {
        ACTIVE, INACTIVE
    }
}
