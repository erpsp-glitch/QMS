package com.ERP.QMS.repository;

import com.ERP.QMS.model.KpiMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface KpiMasterRepository extends JpaRepository<KpiMaster, Long> {
    Optional<KpiMaster> findByKpiCode(String kpiCode);
    List<KpiMaster> findByCertificationId(Long certId);
    List<KpiMaster> findByCertificationIdAndDepartmentId(Long certId, Long deptId);
    List<KpiMaster> findByActiveTrue();
    long countByCertificationId(Long certId);
}
