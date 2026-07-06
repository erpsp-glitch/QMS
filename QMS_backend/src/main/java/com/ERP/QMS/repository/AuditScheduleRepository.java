package com.ERP.QMS.repository;

import com.ERP.QMS.model.AuditSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditScheduleRepository extends JpaRepository<AuditSchedule, Long> {
    List<AuditSchedule> findByAuditPlanId(Long planId);
    List<AuditSchedule> findByAuditPlanCertificationId(Long certId);
    void deleteByAuditPlanId(Long planId);
}
