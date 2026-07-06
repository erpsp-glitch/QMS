package com.ERP.QMS.service;

import com.ERP.QMS.dto.DashboardStats;
import com.ERP.QMS.model.*;
import com.ERP.QMS.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final CertificationRepository certificationRepository;
    private final DocumentRepository documentRepository;
    private final KpiMasterRepository kpiMasterRepository;
    private final KpiEntryRepository kpiEntryRepository;
    private final AuditPlanRepository auditPlanRepository;
    private final NcTrackingRepository ncTrackingRepository;
    private final MrmPlanRepository mrmPlanRepository;
    private final UserRepository userRepository;

    public DashboardStats getStats() {
        long openNc = ncTrackingRepository.countByStatus(NcTracking.NcStatus.OPEN)
            + ncTrackingRepository.countByStatus(NcTracking.NcStatus.ACTION_INITIATED)
            + ncTrackingRepository.countByStatus(NcTracking.NcStatus.PENDING_VERIFICATION);

        Map<String, Long> ncCounts = new HashMap<>();
        for (NcTracking.NcStatus s : NcTracking.NcStatus.values()) {
            ncCounts.put(s.name(), ncTrackingRepository.countByStatus(s));
        }

        Map<String, Long> kpiCounts = new HashMap<>();
        for (KpiEntry.KpiStatus s : KpiEntry.KpiStatus.values()) {
            kpiCounts.put(s.name(), 0L);
        }

        List<Certification> certs = certificationRepository.findAll();
        List<DashboardStats.CertBreakdown> breakdowns = certs.stream()
            .map(cert -> DashboardStats.CertBreakdown.builder()
                .certId(cert.getId())
                .certCode(cert.getCode())
                .certName(cert.getName())
                .documentCount(documentRepository.countByCertificationId(cert.getId()))
                .kpiCount(kpiMasterRepository.countByCertificationId(cert.getId()))
                .auditCount(auditPlanRepository.countByCertificationId(cert.getId()))
                .openNcCount(ncTrackingRepository.countByCertificationIdAndStatus(cert.getId(), NcTracking.NcStatus.OPEN))
                .mrmCount(mrmPlanRepository.countByCertificationId(cert.getId()))
                .build()
            ).collect(Collectors.toList());

        return DashboardStats.builder()
            .totalCertifications(certificationRepository.count())
            .totalDocuments(documentRepository.count())
            .totalKpis(kpiMasterRepository.count())
            .totalAudits(auditPlanRepository.count())
            .openNc(openNc)
            .pendingActions(0L)
            .upcomingMrm(mrmPlanRepository.findByStatus(MrmPlan.MrmStatus.PLANNED).size())
            .activeUsers(userRepository.findByActiveTrue().size())
            .certBreakdowns(breakdowns)
            .kpiStatusCounts(kpiCounts)
            .ncStatusCounts(ncCounts)
            .build();
    }
}
