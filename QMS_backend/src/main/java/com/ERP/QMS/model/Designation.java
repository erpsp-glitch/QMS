package com.ERP.QMS.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "designations",
    indexes = {
        @Index(name = "idx_desig_dept",   columnList = "department_id"),
        @Index(name = "idx_desig_active", columnList = "active")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Designation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 200)
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name = "department_id")
@JsonIgnoreProperties({
    "hibernateLazyInitializer",
    "handler"
})
private Department department;

    @Column(nullable = false)
    private boolean active = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
