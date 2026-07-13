package com.ERP.QMS.service;

import com.ERP.QMS.repository.ActionTrackerRepository;
import com.ERP.QMS.repository.AuditPlanRepository;
import com.ERP.QMS.repository.AuditorRepository;
import com.ERP.QMS.repository.CarRepository;
import com.ERP.QMS.repository.ClauseMasterRepository;
import com.ERP.QMS.repository.DepartmentRepository;
import com.ERP.QMS.repository.DocumentRepository;
import com.ERP.QMS.repository.EmployeeRepository;
import com.ERP.QMS.repository.InternalAuditReviewRepository;
import com.ERP.QMS.repository.IssueRegisterRepository;
import com.ERP.QMS.repository.KpiMasterRepository;
import com.ERP.QMS.repository.MrmKpiReviewRepository;
import com.ERP.QMS.repository.KpiReviewRepository;
import com.ERP.QMS.repository.MrmPlanRepository;
import com.ERP.QMS.repository.NcTrackingRepository;
import com.ERP.QMS.repository.ProcessReviewPlanRepository;
import com.ERP.QMS.repository.ProcessReviewSheetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Year;

@Service
@RequiredArgsConstructor
public class SequenceService {

    private final AuditPlanRepository auditPlanRepository;
    private final NcTrackingRepository ncTrackingRepository;
    private final CarRepository carRepository;
    private final MrmPlanRepository mrmPlanRepository;
    private final IssueRegisterRepository issueRegisterRepository;
    private final KpiMasterRepository kpiMasterRepository;
    private final MrmKpiReviewRepository mrmKpiReviewRepository;
    private final KpiReviewRepository kpiReviewRepository;
    private final InternalAuditReviewRepository internalAuditReviewRepository;
    private final ProcessReviewPlanRepository processReviewPlanRepository;
    private final ProcessReviewSheetRepository processReviewSheetRepository;
    private final ActionTrackerRepository actionTrackerRepository;
    private final DocumentRepository documentRepository;
    private final DepartmentRepository departmentRepository;
    private final AuditorRepository auditorRepository;
    private final EmployeeRepository employeeRepository;
    private final ClauseMasterRepository clauseMasterRepository;

    private int currentYear() {
        return Year.now().getValue();
    }

    public String nextAuditRefNo(String certCode) {
        long seq = auditPlanRepository.count() + 1;
        return String.format("IA-%s-%d-%03d", certCode, currentYear(), seq);
    }

    public String nextNcNumber(String certCode) {
        long seq = ncTrackingRepository.count() + 1;
        return String.format("NC-%s-%d-%03d", certCode, currentYear(), seq);
    }

    public String nextCarNumber(String certCode) {
        long seq = carRepository.count() + 1;
        return String.format("CAR-%s-%d-%03d", certCode, currentYear(), seq);
    }

    public String nextKpiReviewId(String certCode) {
        long seq = mrmKpiReviewRepository.count() + 1;
        return String.format("KR-%s-%d-%03d", certCode, currentYear(), seq);
    }

    public String nextKpiEntryReviewNo() {
        long seq = kpiReviewRepository.count() + 1;
        return String.format("REV-%d-%04d", currentYear(), seq);
    }

    public String nextAuditReviewId(String certCode) {
        long seq = internalAuditReviewRepository.count() + 1;
        return String.format("AR-%s-%d-%03d", certCode, currentYear(), seq);
    }

    public String nextPrpRefNo(String certCode) {
        long seq = processReviewPlanRepository.count() + 1;
        return String.format("PRP-%s-%d-%03d", certCode, currentYear(), seq);
    }

    public String nextPrsRefNo(String certCode) {
        long seq = processReviewSheetRepository.count() + 1;
        return String.format("PRS-%s-%d-%03d", certCode, currentYear(), seq);
    }

    public String nextActionNo() {
        long seq = actionTrackerRepository.count() + 1;
        return String.format("ACT-%d-%04d", currentYear(), seq);
    }

    public String nextMrmRefNo(String certCode) {
        long seq = mrmPlanRepository.count() + 1;
        return String.format("MRM-%s-%d-%03d", certCode, currentYear(), seq);
    }

    public String nextIssueId(String certCode) {
        long seq = issueRegisterRepository.count() + 1;
        return String.format("ISS-%s-%d-%04d", certCode, currentYear(), seq);
    }

    public String nextKpiCode(String certCode) {
        long seq = kpiMasterRepository.count() + 1;
        return String.format("KPI-%s-%03d", certCode, seq);
    }

    public String nextObservationId(String certCode) {
        return String.format("OBS-%s-%d-%04d", certCode, currentYear(), System.currentTimeMillis() % 10000);
    }

    /** Generate document number: {CompanyCode}-{DeptCode}-{DocType}-{Seq} */
    public String nextDocumentNumber(String companyCode, String deptCode, String docType) {
        long total = documentRepository.count() + 1;
        String prefix = (companyCode != null && !companyCode.isBlank() ? companyCode : "QMS")
                + "-" + (deptCode != null ? deptCode : "XX")
                + "-" + (docType != null ? docType : "WI");
        return String.format("%s-%03d", prefix, total);
    }

    /** Generate copy number for document issue: {Prefix}-{DeptCode}-{Seq} */
    public String nextCopyNumber(String copyTypeCode, String deptCode) {
        long seq = issueRegisterRepository.count() + 1;
        return String.format("%s-%s-%03d",
                copyTypeCode != null ? copyTypeCode : "CC",
                deptCode != null ? deptCode : "XX",
                seq);
    }

    /** Generate department ID: DEP001, DEP002, ... */
    public String nextDepartmentId() {
        long seq = departmentRepository.count() + 1;
        return String.format("DEP%03d", seq);
    }

    /** Generate auditor code: AUD001, AUD002, ... */
    public String nextAuditorCode() {
        long seq = auditorRepository.count() + 1;
        return String.format("AUD%03d", seq);
    }

    /** Generate employee ID: EMP001, EMP002, ... */
    
       public String nextEmployeeId() {
        // Get the count of existing employees
        long seq = employeeRepository.count() + 1;
        return String.format("EMP%03d", seq);
    }

    
    /** Generate clause ID: CLA-0001, CLA-0002, ... */
    public String nextClauseId() {
        long seq = clauseMasterRepository.count() + 1;
        return String.format("CLA-%04d", seq);
    }

    /** Generate department ID with DEPT- prefix: DEPT-001, DEPT-002, ... */
    public String nextDepartmentIdFormatted() {
        long seq = departmentRepository.count() + 1;
        return String.format("DEPT-%03d", seq);
    }
}
