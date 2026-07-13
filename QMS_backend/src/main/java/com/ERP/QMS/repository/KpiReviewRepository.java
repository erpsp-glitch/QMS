package com.ERP.QMS.repository;

import com.ERP.QMS.model.KpiReview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface KpiReviewRepository extends JpaRepository<KpiReview, Long> {
    Optional<KpiReview> findByReviewNo(String reviewNo);
    List<KpiReview> findByKpiEntryIdOrderByCreatedDateDesc(Long kpiEntryId);
    List<KpiReview> findByKpiEntryId(Long kpiEntryId);
}
