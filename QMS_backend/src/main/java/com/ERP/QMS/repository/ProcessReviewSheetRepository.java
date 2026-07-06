package com.ERP.QMS.repository;

import com.ERP.QMS.model.ProcessReviewSheet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProcessReviewSheetRepository extends JpaRepository<ProcessReviewSheet, Long> {
    Optional<ProcessReviewSheet> findByPrsRefNo(String prsRefNo);
    List<ProcessReviewSheet> findByProcessReviewPlanId(Long planId);
    List<ProcessReviewSheet> findByProcessReviewPlanMrmPlanId(Long mrmPlanId);
}
