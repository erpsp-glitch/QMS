package com.ERP.QMS.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Column(length = 100)
    private String username;

    @Column(length = 50)
    private String module;

    @Column(length = 100)
    private String action;

    @Column(length = 50)
    private String entityType;

    private Long entityId;

    @Column(columnDefinition = "TEXT")
    private String oldValue;

    @Column(columnDefinition = "TEXT")
    private String newValue;

    @Column(length = 50)
    private String ipAddress;

    @Column(length = 200)
    private String userAgent;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
