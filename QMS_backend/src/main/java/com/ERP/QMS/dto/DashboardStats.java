package com.ERP.QMS.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardStats {
    private long totalCertifications;
    private long totalDocuments;
    private long totalKpis;
    private long totalAudits;
    private long openNc;
    private long pendingActions;
    private long upcomingMrm;
    private long activeUsers;

    // Certification-wise breakdown
    private List<CertBreakdown> certBreakdowns;

    // KPI achievement summary
    private Map<String, Long> kpiStatusCounts;  // ACHIEVED, PENDING, NOT_UPDATED

    // NC by status
    private Map<String, Long> ncStatusCounts;

    @Data
    @Builder
    public static class CertBreakdown {
        private Long certId;
        private String certCode;
        private String certName;
        private long documentCount;
        private long kpiCount;
        private long auditCount;
        private long openNcCount;
        private long mrmCount;
    }
}
