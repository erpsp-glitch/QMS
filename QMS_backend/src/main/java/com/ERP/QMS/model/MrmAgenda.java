package com.ERP.QMS.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "mrm_agendas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MrmAgenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

 @ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name = "mrm_plan_id", nullable = false)
private MrmPlan mrmPlan;

    private Integer serialNo;

    @Column(nullable = false, length = 200)
    private String agendaTopic;

    @Column(columnDefinition = "TEXT")
    private String inputDetails;

    @Column(length = 100)
    private String responsibility;

    private String attachmentPath;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public MrmPlan getMrmPlan() {
    return mrmPlan;
}

public void setMrmPlan(MrmPlan mrmPlan) {
    this.mrmPlan = mrmPlan;
}
}
