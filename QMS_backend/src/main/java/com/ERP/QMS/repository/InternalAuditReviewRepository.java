package com.ERP.QMS.repository;

import com.ERP.QMS.model.InternalAuditReview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InternalAuditReviewRepository extends JpaRepository<InternalAuditReview, Long> {
    Optional<InternalAuditReview> findByAuditReviewId(String auditReviewId);
    Optional<InternalAuditReview> findByMrmPlanId(Long mrmPlanId);
    List<InternalAuditReview> findByCertificationId(Long certId);
}
