package com.ERP.QMS.service;

import com.ERP.QMS.model.KpiEntry;
import com.ERP.QMS.model.KpiMaster;
import com.ERP.QMS.repository.CertificationRepository;
import com.ERP.QMS.repository.KpiEntryRepository;
import com.ERP.QMS.repository.KpiMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class KpiService {

    private final KpiMasterRepository kpiMasterRepository;
    private final KpiEntryRepository kpiEntryRepository;
    private final CertificationRepository certificationRepository;
    private final SequenceService sequenceService;

    // ===== KPI Master =====

    public List<KpiMaster> getAllMasters() {
        return kpiMasterRepository.findAll();
    }

    public List<KpiMaster> getMastersByCertification(Long certId) {
        return kpiMasterRepository.findByCertificationId(certId);
    }

    public KpiMaster getMasterById(Long id) {
        return kpiMasterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("KPI not found: " + id));
    }

    @Transactional
    public KpiMaster createMaster(KpiMaster kpi) {
        // Load full Certification so getCode() is populated (frontend only sends { id })
        if (kpi.getCertification() != null && kpi.getCertification().getId() != null) {
            certificationRepository.findById(kpi.getCertification().getId())
                .ifPresent(kpi::setCertification);
        }
        String certCode = (kpi.getCertification() != null && kpi.getCertification().getCode() != null)
            ? kpi.getCertification().getCode() : "GEN";
        String code = sequenceService.nextKpiCode(certCode);
        kpi.setKpiCode(code);
        // Sync kpiObjective <-> title
        if (kpi.getKpiObjective() != null && kpi.getTitle() == null) {
            kpi.setTitle(kpi.getKpiObjective());
        } else if (kpi.getTitle() != null && kpi.getKpiObjective() == null) {
            kpi.setKpiObjective(kpi.getTitle());
        }
        // Sync kpiType string <-> type enum
        syncKpiTypeFields(kpi);
        return kpiMasterRepository.save(kpi);
    }

    @Transactional
    public KpiMaster updateMaster(Long id, KpiMaster updated) {
        KpiMaster existing = getMasterById(id);
        existing.setTitle(updated.getTitle() != null ? updated.getTitle() : updated.getKpiObjective());
        existing.setKpiObjective(updated.getKpiObjective() != null ? updated.getKpiObjective() : updated.getTitle());
        existing.setObjective(updated.getObjective());
        existing.setKpiCategory(updated.getKpiCategory());
        existing.setType(updated.getType());
        existing.setKpiType(updated.getKpiType());
        existing.setTargetValue(updated.getTargetValue());
        existing.setUnit(updated.getUnit());
        existing.setDirection(updated.getDirection());
        existing.setWarningLimit(updated.getWarningLimit());
        existing.setCriticalLimit(updated.getCriticalLimit());
        existing.setFrequency(updated.getFrequency());
        existing.setFinancialYear(updated.getFinancialYear());
        existing.setDataSource(updated.getDataSource());
        existing.setCalculationFormula(updated.getCalculationFormula());
        existing.setResponsibility(updated.getResponsibility());
        existing.setResponsiblePerson(updated.getResponsiblePerson());
        existing.setMonitoringPerson(updated.getMonitoringPerson());
        existing.setDepartmentHead(updated.getDepartmentHead());
        existing.setActive(updated.isActive());
        syncKpiTypeFields(existing);
        return kpiMasterRepository.save(existing);
    }

    @Transactional
    public void deleteMaster(Long id) {
        kpiMasterRepository.deleteById(id);
    }

    // ===== KPI Entry =====

    public List<KpiEntry> getEntriesByKpi(Long kpiId) {
        return kpiEntryRepository.findByKpiMasterId(kpiId);
    }

    public List<KpiEntry> getEntriesByCertification(Long certId, Integer year) {
        return kpiEntryRepository.findByCertificationIdAndYear(certId, year);
    }

    public List<KpiEntry> getEntriesByCertificationAndMonth(Long certId, Integer year, String month) {
        return kpiEntryRepository.findByCertificationIdAndYearAndMonth(certId, year, month);
    }

    @Transactional
    public KpiEntry saveEntry(KpiEntry entry) {
        // Resolve the full KpiMaster first so targetValue and direction are available
        KpiMaster master = null;
        if (entry.getKpiMaster() != null && entry.getKpiMaster().getId() != null) {
            master = kpiMasterRepository.findById(entry.getKpiMaster().getId()).orElse(null);
        }
        if (master != null) {
            entry.setKpiMaster(master);
            // If frontend didn't send targetValue, inherit from master
            if (entry.getTargetValue() == null) {
                entry.setTargetValue(master.getTargetValue());
            }
        }

        if (entry.getActualValue() != null && entry.getTargetValue() != null) {
            double actual = entry.getActualValue();
            double target = entry.getTargetValue();
            String direction = (master != null && master.getDirection() != null)
                ? master.getDirection() : "HIGHER_IS_BETTER";

            entry.setVariance(actual - target);

            double pct;
            if (target == 0) {
                pct = (actual == 0) ? 100.0 : 0.0;
            } else if ("LOWER_IS_BETTER".equals(direction)) {
                pct = actual == 0 ? 0.0 : (target / actual) * 100.0;
            } else {
                pct = (actual / target) * 100.0;
            }
            entry.setAchievementPercent(Math.round(pct * 100.0) / 100.0);

            Double warningLimit  = master != null ? master.getWarningLimit()  : null;
            Double criticalLimit = master != null ? master.getCriticalLimit() : null;
            entry.setStatus(calculateStatus(actual, target, direction, warningLimit, criticalLimit));
        } else {
            entry.setStatus(KpiEntry.KpiStatus.NOT_UPDATED);
        }

        // Upsert by kpiMasterId + year + month
        return kpiEntryRepository.findByKpiMasterIdAndYearAndMonth(
            entry.getKpiMaster().getId(), entry.getYear(), entry.getMonth()
        ).map(existing -> {
            existing.setActualValue(entry.getActualValue());
            existing.setAchievementPercent(entry.getAchievementPercent());
            existing.setVariance(entry.getVariance());
            existing.setStatus(entry.getStatus());
            existing.setRemarks(entry.getRemarks());
            existing.setEnteredBy(entry.getEnteredBy());
            return kpiEntryRepository.save(existing);
        }).orElseGet(() -> kpiEntryRepository.save(entry));
    }

    private KpiEntry.KpiStatus calculateStatus(double actual, double target, String direction,
                                                Double warningLimit, Double criticalLimit) {
        if ("LOWER_IS_BETTER".equals(direction)) {
            if (actual <= target) return KpiEntry.KpiStatus.ACHIEVED;
            if (warningLimit != null && actual <= warningLimit) return KpiEntry.KpiStatus.WARNING;
            return KpiEntry.KpiStatus.FAILED;
        } else if ("EQUAL".equals(direction)) {
            if (actual == target) return KpiEntry.KpiStatus.ACHIEVED;
            double diff = Math.abs(actual - target);
            if (warningLimit != null && diff <= warningLimit) return KpiEntry.KpiStatus.WARNING;
            return KpiEntry.KpiStatus.FAILED;
        } else { // HIGHER_IS_BETTER (default)
            if (actual >= target) return KpiEntry.KpiStatus.ACHIEVED;
            if (warningLimit != null && actual >= warningLimit) return KpiEntry.KpiStatus.WARNING;
            return KpiEntry.KpiStatus.FAILED;
        }
    }

    @Transactional
    public KpiEntry approveEntry(Long id, String reviewedBy) {
        KpiEntry entry = kpiEntryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("KPI Entry not found: " + id));
        entry.setReviewedBy(reviewedBy);
        entry.setReviewStatus(KpiEntry.ReviewStatus.APPROVED);
        return kpiEntryRepository.save(entry);
    }

    private void syncKpiTypeFields(KpiMaster kpi) {
        if (kpi.getKpiType() != null && kpi.getType() == null) {
            try { kpi.setType(KpiMaster.KpiType.valueOf(kpi.getKpiType())); } catch (Exception ignored) {}
        } else if (kpi.getType() != null && kpi.getKpiType() == null) {
            kpi.setKpiType(kpi.getType().name());
        }
    }
}
