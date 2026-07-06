package com.ERP.QMS.repository;

import com.ERP.QMS.model.ActionTracker;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ActionTrackerRepository extends JpaRepository<ActionTracker, Long> {
    Optional<ActionTracker> findByActionNo(String actionNo);
    List<ActionTracker> findByStatus(ActionTracker.ActionStatus status);
    List<ActionTracker> findBySourceModule(ActionTracker.SourceModule module);
    List<ActionTracker> findBySourceReferenceNo(String refNo);
    List<ActionTracker> findByResponsiblePerson(String person);
    long countByStatus(ActionTracker.ActionStatus status);
}
