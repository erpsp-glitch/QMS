package com.ERP.QMS.repository;

import com.ERP.QMS.model.AuditObservation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditObservationRepository extends JpaRepository<AuditObservation, Long> {
    List<AuditObservation> findByAuditPlanId(Long auditPlanId);
    List<AuditObservation> findByAuditPlanCertificationId(Long certId);
    List<AuditObservation> findByFindingType(AuditObservation.FindingType findingType);
    long countByAuditPlanCertificationIdAndFindingType(Long certId, AuditObservation.FindingType findingType);
}
