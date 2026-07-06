package com.ERP.QMS.repository;

import com.ERP.QMS.model.MrmPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MrmPlanRepository extends JpaRepository<MrmPlan, Long> {
    Optional<MrmPlan> findByMrmRefNo(String mrmRefNo);
    List<MrmPlan> findByCertificationId(Long certId);
    List<MrmPlan> findByStatus(MrmPlan.MrmStatus status);
    long countByCertificationId(Long certId);
}
