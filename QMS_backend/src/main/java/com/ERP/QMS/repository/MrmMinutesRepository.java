package com.ERP.QMS.repository;

import com.ERP.QMS.model.MrmMinutes;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MrmMinutesRepository extends JpaRepository<MrmMinutes, Long> {
   List<MrmMinutes> findByMrmPlan_Id(Long mrmPlanId);
    List<MrmMinutes> findByStatus(MrmMinutes.MinutesStatus status);
    List<MrmMinutes> findByActionRequiredTrue();
    long countByMrmPlan_IdAndStatus(Long mrmPlanId,
                                MrmMinutes.MinutesStatus status);
}
