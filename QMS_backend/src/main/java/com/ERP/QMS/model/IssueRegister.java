package com.ERP.QMS.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "issue_registers",
    indexes = {
        @Index(name = "idx_ir_cert", columnList = "certification_id"),
        @Index(name = "idx_ir_doc", columnList = "document_id"),
        @Index(name = "idx_ir_dept", columnList = "department_id"),
        @Index(name = "idx_ir_status", columnList = "status")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueRegister {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String issueId;

    @Column(length = 20)
    private String copyNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "certification_id", nullable = false)
    @JsonIgnoreProperties({
            "hibernateLazyInitializer",
            "handler",
            "scope",
            "applicableClauses",
            "certificatePath",
            "createdAt",
            "updatedAt"
    })
    private Certification certification;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "document_id", nullable = false)
    @JsonIgnoreProperties({
            "hibernateLazyInitializer",
            "handler",
            "description",
            "keywords",
            "changeLog",
            "createdAt",
            "updatedAt"
    })
    private Document document;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    @JsonIgnoreProperties({
            "hibernateLazyInitializer",
            "handler",
            "processDescription",
            "objectives",
            "description",
            "createdAt",
            "updatedAt"
    })
    private Department department;

    @Column(length = 10)
    private String revisionNumber;

    @Enumerated(EnumType.STRING)
    private CopyType copyType;

    @Column(name = "employee_id_ref")
    private Long employeeIdRef;

    @Column(length = 100)
    private String issuedTo;

    @Column(length = 100)
    private String designation;

    @Column(length = 100)
    private String controllerName;

    private LocalDate issueDate;

    private LocalDate expectedReturnDate;

    private LocalDate returnDate;

    @Enumerated(EnumType.STRING)
    private AcknowledgementStatus acknowledgementStatus =
            AcknowledgementStatus.PENDING;

    private LocalDateTime acknowledgementDate;

    @Enumerated(EnumType.STRING)
    private IssueStatus status = IssueStatus.ISSUED;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // =========================
    // ENUMS
    // =========================

    public enum CopyType {

        MASTER_COPY("Master Copy"),
        CONTROLLED_COPY("Controlled Copy"),
        REFERENCE_COPY("Reference Copy"),
        UNCONTROLLED_COPY("Uncontrolled Copy"),
        OBSOLETE_COPY("Obsolete Copy");

        private final String label;

        CopyType(String label) {
            this.label = label;
        }

        @JsonValue
        public String getLabel() {
            return label;
        }

        @JsonCreator
        public static CopyType fromValue(String value) {

            if (value == null) {
                return null;
            }

            for (CopyType type : CopyType.values()) {
                if (type.name().equalsIgnoreCase(value)
                        || type.label.equalsIgnoreCase(value)) {
                    return type;
                }
            }

            throw new IllegalArgumentException(
                    "Invalid CopyType: " + value
            );
        }
    }

    public enum IssueStatus {
        ISSUED,
        RETURNED,
        OVERDUE,
        CANCELLED
    }

    public enum AcknowledgementStatus {
        PENDING,
        ACKNOWLEDGED
    }
}