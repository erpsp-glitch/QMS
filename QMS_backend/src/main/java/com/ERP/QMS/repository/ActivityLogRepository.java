package com.ERP.QMS.repository;

import com.ERP.QMS.model.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByUserId(Long userId);
    List<ActivityLog> findByModule(String module);
    Page<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
