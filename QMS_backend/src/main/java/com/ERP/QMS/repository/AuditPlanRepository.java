package com.ERP.QMS.repository;

import com.ERP.QMS.model.AuditPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AuditPlanRepository extends JpaRepository<AuditPlan, Long> {
    Optional<AuditPlan> findByAuditRefNo(String auditRefNo);
    List<AuditPlan> findByCertificationId(Long certId);
    List<AuditPlan> findByCertificationIdAndAuditYear(Long certId, Integer year);
    List<AuditPlan> findByStatus(AuditPlan.AuditStatus status);
    long countByCertificationId(Long certId);
    long countByCertificationIdAndStatus(Long certId, AuditPlan.AuditStatus status);
}
