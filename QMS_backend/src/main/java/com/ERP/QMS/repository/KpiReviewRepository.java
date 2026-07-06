package com.ERP.QMS.repository;

import com.ERP.QMS.model.KpiReview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface KpiReviewRepository extends JpaRepository<KpiReview, Long> {
    Optional<KpiReview> findByKpiReviewId(String kpiReviewId);
    Optional<KpiReview> findByMrmPlanId(Long mrmPlanId);
    List<KpiReview> findByCertificationId(Long certId);
}
