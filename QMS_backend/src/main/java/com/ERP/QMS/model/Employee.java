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
    name = "employees",
    indexes = {
        @Index(name = "idx_emp_dept",   columnList = "department_id"),
        @Index(name = "idx_emp_status", columnList = "status"),
        @Index(name = "idx_emp_email",  columnList = "email"),
        @Index(name = "idx_emp_role",   columnList = "role")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 30)
    private String employeeId;         // EMP001

    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(nullable = false, length = 100)
    private String lastName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "processDescription",
            "objectives", "createdAt", "updatedAt"})
    private Department department;

    @Column(length = 150)
    private String designation;

    @Column(name = "reporting_to_id")
    private Long reportingToId;        // FK to employee.id

    @Column(length = 100)
    private String reportingToName;    // Denormalized for display

    @Column(length = 100)
    private String email;

    @Column(length = 100)
    private String personalEmail;

    @Column(length = 30)
    private String phone;

    @Column(length = 30)
    private String alternativeNumber;

    private LocalDate joiningDate;
    private LocalDate dateOfBirth;

    @Column(length = 200)
    private String highestQualification; // B.E. Mechanical, MBA

    @Column(columnDefinition = "TEXT")
    private String professionalCertifications; // Lead Auditor, Six Sigma Green Belt

    @Column(columnDefinition = "TEXT")
    private String skills;             // QA, Audit, Process Improvement

    private Integer yearsOfExperience;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EmployeeStatus status = EmployeeStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private EmployeeRole role = EmployeeRole.USER;

    private String profilePhotoPath;
    private String digitalSignaturePath;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum EmployeeStatus { ACTIVE, INACTIVE, RESIGNED }

    public enum EmployeeRole {
        SUPER_ADMIN, MR, QMS_COORDINATOR, DEPARTMENT_HEAD, AUDITOR, USER, VIEWER, TOP_MANAGEMENT
    }
}
