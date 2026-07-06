
package com.ERP.QMS.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "departments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Auto Generated Department ID (DEP001, DEP002...)
    @Column(unique = true, length = 20)
    private String departmentId;

    // Department Information
    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 20)
    private String departmentCode;

    @Column(length = 100)
    private String departmentHead;

    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 200)
    private String location;

    @Column(length = 200)
    private String processName;

    @Column(length = 100)
    private String processOwner;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    // Status
    @Builder.Default
    private boolean active = true;

    // Audit Fields
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}