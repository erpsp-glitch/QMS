package com.ERP.QMS.repository;

import com.ERP.QMS.model.Auditor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditorRepository extends JpaRepository<Auditor, Long> {
    List<Auditor> findByType(Auditor.AuditorType type);
    List<Auditor> findByStatus(Auditor.AuditorStatus status);
}
