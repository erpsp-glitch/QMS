package com.ERP.QMS.repository;

import com.ERP.QMS.model.MrmKpiReview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MrmKpiReviewRepository extends JpaRepository<MrmKpiReview, Long> {
    Optional<MrmKpiReview> findByKpiReviewId(String kpiReviewId);
    Optional<MrmKpiReview> findByMrmPlanId(Long mrmPlanId);
    List<MrmKpiReview> findByCertificationId(Long certId);
}
