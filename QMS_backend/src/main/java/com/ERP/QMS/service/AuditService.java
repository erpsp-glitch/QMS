package com.ERP.QMS.service;

import com.ERP.QMS.model.*;
import com.ERP.QMS.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditPlanRepository auditPlanRepository;
    private final AuditObservationRepository observationRepository;
    private final NcTrackingRepository ncTrackingRepository;
    private final AuditScheduleRepository scheduleRepository;
    private final AuditFeedbackRepository feedbackRepository;
    private final CertificationRepository certificationRepository;
    private final ClauseMasterRepository clauseMasterRepository;
    private final DepartmentRepository departmentRepository;
    private final SequenceService sequenceService;

    // ===== Audit Plans =====

    public List<AuditPlan> getAllPlans() {
        return auditPlanRepository.findAll();
    }

    public List<AuditPlan> getPlansByCertification(Long certId) {
        return auditPlanRepository.findByCertificationId(certId);
    }

    public AuditPlan getPlanById(Long id) {
        return auditPlanRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Audit Plan not found: " + id));
    }

    @Transactional
    public AuditPlan createPlan(AuditPlan plan) {
        Certification cert = certificationRepository.findById(plan.getCertification().getId())
            .orElseThrow(() -> new RuntimeException("Certification not found"));
        plan.setCertification(cert);
        plan.setAuditYear(Year.now().getValue());
        String refNo = sequenceService.nextAuditRefNo(cert.getCode());
        plan.setAuditRefNo(refNo);
        return auditPlanRepository.save(plan);
    }

    @Transactional
    public AuditPlan updatePlan(Long id, AuditPlan updated) {
        AuditPlan existing = getPlanById(id);
        if (updated.getCertification() != null && updated.getCertification().getId() != null) {
            Certification cert = certificationRepository.findById(updated.getCertification().getId())
                .orElse(existing.getCertification());
            existing.setCertification(cert);
        }
        existing.setAuditType(updated.getAuditType());
        existing.setAuditTitle(updated.getAuditTitle());
        existing.setLeadAuditor(updated.getLeadAuditor());
        existing.setAuditorTeam(updated.getAuditorTeam());
        existing.setAuditCoordinator(updated.getAuditCoordinator());
        existing.setScope(updated.getScope());
        existing.setAuditCriteria(updated.getAuditCriteria());
        existing.setObjective(updated.getObjective());
        existing.setPlannedStartDate(updated.getPlannedStartDate());
        existing.setPlannedEndDate(updated.getPlannedEndDate());
        existing.setActualStartDate(updated.getActualStartDate());
        existing.setActualEndDate(updated.getActualEndDate());
        existing.setDurationDays(updated.getDurationDays());
        existing.setStatus(updated.getStatus());
        existing.setApprovalStatus(updated.getApprovalStatus());
        existing.setApprovedBy(updated.getApprovedBy());
        existing.setRemarks(updated.getRemarks());
        return auditPlanRepository.save(existing);
    }

    @Transactional
    public void deletePlan(Long id) {
        auditPlanRepository.deleteById(id);
    }

    @Transactional
    public AuditPlan approvePlan(Long id, String approvedBy) {
        AuditPlan plan = getPlanById(id);
        plan.setApprovalStatus(AuditPlan.ApprovalStatus.APPROVED);
        plan.setApprovedBy(approvedBy);
        if (plan.getStatus() == AuditPlan.AuditStatus.DRAFT || plan.getStatus() == AuditPlan.AuditStatus.PLANNED) {
            plan.setStatus(AuditPlan.AuditStatus.APPROVED);
        }
        return auditPlanRepository.save(plan);
    }

    // ===== Observations =====

    public List<AuditObservation> getObservationsByPlan(Long planId) {
        return observationRepository.findByAuditPlanId(planId);
    }

    public List<AuditObservation> getObservationsByCertification(Long certId) {
        return observationRepository.findByAuditPlanCertificationId(certId);
    }

    @Transactional
    public AuditObservation createObservation(AuditObservation obs) {
        AuditPlan plan = getPlanById(obs.getAuditPlan().getId());
        String obsId = sequenceService.nextObservationId(plan.getCertification().getCode());
        obs.setObservationId(obsId);
        AuditObservation saved = observationRepository.save(obs);

        if (obs.getFindingType() == AuditObservation.FindingType.NC_MINOR
            || obs.getFindingType() == AuditObservation.FindingType.NC_MAJOR
            || obs.getFindingType() == AuditObservation.FindingType.NC) {
            createNcFromObservation(saved, plan);
        }

        return saved;
    }

    @Transactional
    public AuditObservation updateObservation(Long id, AuditObservation updated) {
        AuditObservation existing = observationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Observation not found: " + id));
        existing.setClauseNo(updated.getClauseNo());
        existing.setFindingType(updated.getFindingType());
        existing.setObservationDescription(updated.getObservationDescription());
        existing.setObjectiveEvidence(updated.getObjectiveEvidence());
        existing.setRiskLevel(updated.getRiskLevel());
        existing.setSeverity(updated.getSeverity());
        existing.setDepartment(updated.getDepartment());
        existing.setAuditee(updated.getAuditee());
        existing.setAuditDate(updated.getAuditDate());
        existing.setStatus(updated.getStatus());
        return observationRepository.save(existing);
    }

    // ===== NC Tracking =====

    public List<NcTracking> getAllNcs() {
        return ncTrackingRepository.findAll();
    }

    public List<NcTracking> getNcsByCertification(Long certId) {
        return ncTrackingRepository.findByCertificationId(certId);
    }

    public List<NcTracking> getOpenNcs() {
        return ncTrackingRepository.findByStatus(NcTracking.NcStatus.OPEN);
    }

    public NcTracking getNcById(Long id) {
        return ncTrackingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("NC not found: " + id));
    }

    @Transactional
    public NcTracking createNc(NcTracking nc) {
        AuditPlan plan = getPlanById(nc.getAuditPlan().getId());
        nc.setCertification(plan.getCertification());
        String ncNo = sequenceService.nextNcNumber(plan.getCertification().getCode());
        nc.setNcNumber(ncNo);
        if (nc.getStatus() == null) nc.setStatus(NcTracking.NcStatus.OPEN);
        NcTracking saved = ncTrackingRepository.save(nc);
        if (nc.getObservationId() != null) {
            observationRepository.findById(nc.getObservationId()).ifPresent(obs -> {
                obs.setNcId(saved.getId());
                obs.setStatus(AuditObservation.ObservationStatus.NC_RAISED);
                observationRepository.save(obs);
            });
        }
        return saved;
    }

    @Transactional
    public NcTracking updateNc(Long id, NcTracking updated) {
        NcTracking existing = getNcById(id);
        existing.setRootCause(updated.getRootCause());
        existing.setImmediateCorrection(updated.getImmediateCorrection());
        existing.setCorrectiveAction(updated.getCorrectiveAction());
        existing.setResponsiblePerson(updated.getResponsiblePerson());
        existing.setTargetDate(updated.getTargetDate());
        existing.setVerificationBy(updated.getVerificationBy());
        existing.setVerificationDate(updated.getVerificationDate());
        existing.setVerificationRemarks(updated.getVerificationRemarks());
        existing.setStatus(updated.getStatus());
        return ncTrackingRepository.save(existing);
    }

    @Transactional
    public NcTracking closeNc(Long id) {
        NcTracking nc = getNcById(id);
        nc.setStatus(NcTracking.NcStatus.CLOSED);
        nc.setClosureDate(java.time.LocalDate.now());
        return ncTrackingRepository.save(nc);
    }

    private void createNcFromObservation(AuditObservation obs, AuditPlan plan) {
        NcTracking.NcType ncType = obs.getFindingType() == AuditObservation.FindingType.NC_MAJOR
            ? NcTracking.NcType.MAJOR : NcTracking.NcType.MINOR;

        String ncNo = sequenceService.nextNcNumber(plan.getCertification().getCode());

        NcTracking nc = NcTracking.builder()
            .ncNumber(ncNo)
            .certification(plan.getCertification())
            .auditPlan(plan)
            .ncType(ncType)
            .clauseNo(obs.getClauseNo())
            .ncDescription(obs.getObservationDescription())
            .department(obs.getDepartment())
            .status(NcTracking.NcStatus.OPEN)
            .build();

        NcTracking savedNc = ncTrackingRepository.save(nc);
        obs.setNcId(savedNc.getId());
        obs.setStatus(AuditObservation.ObservationStatus.NC_RAISED);
        observationRepository.save(obs);
    }

    // ===== Audit Schedules =====

    public List<AuditSchedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    public List<AuditSchedule> getSchedulesByPlan(Long planId) {
        return scheduleRepository.findByAuditPlanId(planId);
    }

    @Transactional
    public AuditSchedule createSchedule(AuditSchedule schedule) {
        AuditPlan plan = getPlanById(schedule.getAuditPlan().getId());
        schedule.setAuditPlan(plan);
        return scheduleRepository.save(schedule);
    }

    @Transactional
    public AuditSchedule updateSchedule(Long id, AuditSchedule updated) {
        AuditSchedule existing = scheduleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Schedule not found: " + id));
        existing.setDepartment(updated.getDepartment());
        existing.setLocation(updated.getLocation());
        existing.setAuditDate(updated.getAuditDate());
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());
        existing.setAuditor(updated.getAuditor());
        existing.setAuditee(updated.getAuditee());
        existing.setAgendaTopics(updated.getAgendaTopics());
        existing.setStatus(updated.getStatus());
        existing.setRemarks(updated.getRemarks());
        return scheduleRepository.save(existing);
    }

    @Transactional
    public void deleteSchedule(Long id) {
        scheduleRepository.deleteById(id);
    }

    // ===== Audit Feedback =====

    public List<AuditFeedback> getAllFeedback() {
        return feedbackRepository.findAll();
    }

    public List<AuditFeedback> getFeedbackByPlan(Long planId) {
        return feedbackRepository.findByAuditPlanId(planId);
    }

    @Transactional
    public AuditFeedback createFeedback(AuditFeedback feedback) {
        AuditPlan plan = getPlanById(feedback.getAuditPlan().getId());
        feedback.setAuditPlan(plan);
        if (feedback.getStatus() == null) feedback.setStatus(AuditFeedback.FeedbackStatus.SUBMITTED);
        return feedbackRepository.save(feedback);
    }

    @Transactional
    public AuditFeedback updateFeedback(Long id, AuditFeedback updated) {
        AuditFeedback existing = feedbackRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Feedback not found: " + id));
        existing.setAuditorName(updated.getAuditorName());
        existing.setAuditeeName(updated.getAuditeeName());
        existing.setProcess(updated.getProcess());
        existing.setAuditDate(updated.getAuditDate());
        existing.setAuditorKnowledge(updated.getAuditorKnowledge());
        existing.setTechnicalCompetency(updated.getTechnicalCompetency());
        existing.setAuditCoverage(updated.getAuditCoverage());
        existing.setAuditorQualities(updated.getAuditorQualities());
        existing.setEmployeeInteraction(updated.getEmployeeInteraction());
        existing.setClarityInCommunication(updated.getClarityInCommunication());
        existing.setTimeManagement(updated.getTimeManagement());
        existing.setConsistencyApproach(updated.getConsistencyApproach());
        existing.setQueryResponse(updated.getQueryResponse());
        existing.setObservationComments(updated.getObservationComments());
        existing.setIncidentExplanation(updated.getIncidentExplanation());
        existing.setValueAdditions(updated.getValueAdditions());
        existing.setSuggestions(updated.getSuggestions());
        existing.setStatus(updated.getStatus());
        return feedbackRepository.save(existing);
    }

    @Transactional
    public void deleteFeedback(Long id) {
        feedbackRepository.deleteById(id);
    }

    // ===== Clause Master =====

    public List<ClauseMaster> getAllClauses() {
        return clauseMasterRepository.findAll();
    }

    public List<ClauseMaster> getClausesByCertification(Long certId) {
        return clauseMasterRepository.findByCertificationId(certId);
    }

    public List<ClauseMaster> getClausesByDepartment(Long deptId) {
        return clauseMasterRepository.findByDepartmentId(deptId);
    }

    public List<ClauseMaster> getClausesForObservation(Long certId, Long deptId) {
        return clauseMasterRepository.findByCertificationIdAndDepartmentIdAndStatus(
                certId, deptId, ClauseMaster.ClauseStatus.ACTIVE);
    }

    public ClauseMaster getClauseById(Long id) {
        return clauseMasterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Clause not found: " + id));
    }

    @Transactional
    public ClauseMaster createClause(ClauseMaster clause) {
        Certification cert = certificationRepository.findById(clause.getCertification().getId())
            .orElseThrow(() -> new RuntimeException("Certification not found"));
        Department dept = departmentRepository.findById(clause.getDepartment().getId())
            .orElseThrow(() -> new RuntimeException("Department not found"));
        clause.setCertification(cert);
        clause.setDepartment(dept);
        if (clause.getClauseId() == null || clause.getClauseId().isBlank()) {
            clause.setClauseId(sequenceService.nextClauseId());
        }
        if (clause.getStatus() == null) {
            clause.setStatus(ClauseMaster.ClauseStatus.ACTIVE);
        }
        return clauseMasterRepository.save(clause);
    }

    @Transactional
    public ClauseMaster updateClause(Long id, ClauseMaster updated) {
        ClauseMaster existing = getClauseById(id);
        if (updated.getCertification() != null && updated.getCertification().getId() != null) {
            certificationRepository.findById(updated.getCertification().getId())
                .ifPresent(existing::setCertification);
        }
        if (updated.getDepartment() != null && updated.getDepartment().getId() != null) {
            departmentRepository.findById(updated.getDepartment().getId())
                .ifPresent(existing::setDepartment);
        }
        existing.setMainClauseNumber(updated.getMainClauseNumber());
        existing.setMainClauseTitle(updated.getMainClauseTitle());
        existing.setSubClauseReference(updated.getSubClauseReference());
        existing.setSubClauseTitle(updated.getSubClauseTitle());
        existing.setRequirement(updated.getRequirement());
        existing.setAuditQuestion(updated.getAuditQuestion());
        existing.setStatus(updated.getStatus());
        existing.setUpdatedBy(updated.getUpdatedBy());
        return clauseMasterRepository.save(existing);
    }

    @Transactional
    public void deleteClause(Long id) {
        clauseMasterRepository.deleteById(id);
    }
}
