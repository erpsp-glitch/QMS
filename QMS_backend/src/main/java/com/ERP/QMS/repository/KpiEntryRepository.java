package com.ERP.QMS.repository;

import com.ERP.QMS.model.KpiEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface KpiEntryRepository extends JpaRepository<KpiEntry, Long> {
    List<KpiEntry> findByKpiMasterId(Long kpiMasterId);
    List<KpiEntry> findByKpiMasterIdAndYear(Long kpiMasterId, Integer year);
    Optional<KpiEntry> findByKpiMasterIdAndYearAndMonth(Long kpiMasterId, Integer year, String month);
    @Query("SELECT e FROM KpiEntry e WHERE e.kpiMaster.certification.id = :certId AND e.year = :year")
    List<KpiEntry> findByCertificationIdAndYear(Long certId, Integer year);
    @Query("SELECT e FROM KpiEntry e WHERE e.kpiMaster.certification.id = :certId AND e.year = :year AND e.month = :month")
    List<KpiEntry> findByCertificationIdAndYearAndMonth(Long certId, Integer year, String month);
    long countByKpiMasterIdAndStatus(Long kpiMasterId, KpiEntry.KpiStatus status);
}
