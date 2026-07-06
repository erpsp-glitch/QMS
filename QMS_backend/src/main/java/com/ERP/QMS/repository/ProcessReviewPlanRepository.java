package com.ERP.QMS.repository;

import com.ERP.QMS.model.ProcessReviewPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProcessReviewPlanRepository extends JpaRepository<ProcessReviewPlan, Long> {
    Optional<ProcessReviewPlan> findByPrpRefNo(String prpRefNo);
    List<ProcessReviewPlan> findByMrmPlanId(Long mrmPlanId);
    List<ProcessReviewPlan> findByCertificationId(Long certId);
    List<ProcessReviewPlan> findByDepartmentId(Long deptId);
}
