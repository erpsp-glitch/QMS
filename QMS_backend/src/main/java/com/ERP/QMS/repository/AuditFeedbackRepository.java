package com.ERP.QMS.repository;

import com.ERP.QMS.model.AuditFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditFeedbackRepository extends JpaRepository<AuditFeedback, Long> {
    List<AuditFeedback> findByAuditPlanId(Long planId);
    List<AuditFeedback> findByAuditPlanCertificationId(Long certId);
}
