package com.ERP.QMS.service;

import com.ERP.QMS.model.*;
import com.ERP.QMS.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MrmService {

    private final MrmPlanRepository mrmPlanRepository;
    private final MrmAgendaRepository mrmAgendaRepository;
    private final MrmMinutesRepository mrmMinutesRepository;
    private final SequenceService sequenceService;

    public List<MrmPlan> getAllPlans() {
        return mrmPlanRepository.findAll();
    }

    public List<MrmPlan> getPlansByCertification(Long certId) {
        return mrmPlanRepository.findByCertificationId(certId);
    }

    public MrmPlan getPlanById(Long id) {
        return mrmPlanRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("MRM Plan not found: " + id));
    }

    @Transactional
    public MrmPlan createPlan(MrmPlan plan) {
        String refNo = sequenceService.nextMrmRefNo(plan.getCertification().getCode());
        plan.setMrmRefNo(refNo);
        return mrmPlanRepository.save(plan);
    }

    @Transactional
    public MrmPlan updatePlan(Long id, MrmPlan updated) {
        MrmPlan existing = getPlanById(id);
        if (updated.getMrmType()        != null) existing.setMrmType(updated.getMrmType());
        if (updated.getMeetingDate()    != null) existing.setMeetingDate(updated.getMeetingDate());
        if (updated.getMeetingTime()    != null) existing.setMeetingTime(updated.getMeetingTime());
        if (updated.getMeetingLocation()!= null) existing.setMeetingLocation(updated.getMeetingLocation());
        if (updated.getFinancialYear()  != null) existing.setFinancialYear(updated.getFinancialYear());
        if (updated.getChairman()       != null) existing.setChairman(updated.getChairman());
        if (updated.getMrRepresentative()!=null) existing.setMrRepresentative(updated.getMrRepresentative());
        if (updated.getCoordinator()    != null) existing.setCoordinator(updated.getCoordinator());
        if (updated.getAttendees()      != null) existing.setAttendees(updated.getAttendees());
        if (updated.getInvitees()       != null) existing.setInvitees(updated.getInvitees());
        if (updated.getScope()          != null) existing.setScope(updated.getScope());
        if (updated.getStatus()         != null) existing.setStatus(updated.getStatus());
        if (updated.getRemarks()        != null) existing.setRemarks(updated.getRemarks());
        if (updated.getApprovalStatus() != null) existing.setApprovalStatus(updated.getApprovalStatus());
        if (updated.getApprovedBy()     != null) existing.setApprovedBy(updated.getApprovedBy());
        if (updated.getApprovalDate()   != null) existing.setApprovalDate(updated.getApprovalDate());
        return mrmPlanRepository.save(existing);
    }

    @Transactional
    public MrmPlan submitPlan(Long id) {
        MrmPlan plan = getPlanById(id);
        plan.setApprovalStatus(MrmPlan.ApprovalStatus.PENDING);
        plan.setStatus(MrmPlan.MrmStatus.PLANNED);
        return mrmPlanRepository.save(plan);
    }

    @Transactional
    public MrmPlan approvePlan(Long id, String approvedBy) {
        MrmPlan plan = getPlanById(id);
        plan.setApprovalStatus(MrmPlan.ApprovalStatus.APPROVED);
        plan.setApprovedBy(approvedBy);
        plan.setApprovalDate(LocalDate.now());
        plan.setStatus(MrmPlan.MrmStatus.APPROVED);
        return mrmPlanRepository.save(plan);
    }

    @Transactional
    public MrmPlan rejectPlan(Long id, String rejectedBy) {
        MrmPlan plan = getPlanById(id);
        plan.setApprovalStatus(MrmPlan.ApprovalStatus.REJECTED);
        plan.setApprovedBy(rejectedBy);
        plan.setApprovalDate(LocalDate.now());
        return mrmPlanRepository.save(plan);
    }

    @Transactional
    public MrmPlan updateMom(Long id, MrmPlan update) {
        MrmPlan plan = getPlanById(id);
        if (update.getMeetingConclusion()    != null) plan.setMeetingConclusion(update.getMeetingConclusion());
        if (update.getOverallEffectiveness() != null) plan.setOverallEffectiveness(update.getOverallEffectiveness());
        if (update.getPreparedBy()           != null) plan.setPreparedBy(update.getPreparedBy());
        if (update.getMomReviewedBy()        != null) plan.setMomReviewedBy(update.getMomReviewedBy());
        if (update.getMomApprovedBy()        != null) plan.setMomApprovedBy(update.getMomApprovedBy());
        if (update.getMomApprovalDate()      != null) plan.setMomApprovalDate(update.getMomApprovalDate());
        if (update.getMomStatus()            != null) plan.setMomStatus(update.getMomStatus());
        return mrmPlanRepository.save(plan);
    }

    @Transactional
    public void deletePlan(Long id) {
        mrmPlanRepository.deleteById(id);
    }

    // Agenda
   public List<MrmAgenda> getAgendaByPlan(Long planId) {
   return mrmAgendaRepository.findByMrmPlan_IdOrderBySerialNo(planId);
}

   @Transactional
public MrmAgenda saveAgenda(MrmAgenda agenda) {

    if (agenda.getMrmPlan() == null ||
        agenda.getMrmPlan().getId() == null) {
        throw new RuntimeException("MRM Plan is required");
    }

    MrmPlan plan = mrmPlanRepository.findById(
            agenda.getMrmPlan().getId()
    ).orElseThrow(() ->
            new RuntimeException("MRM Plan not found"));

    agenda.setMrmPlan(plan);

    return mrmAgendaRepository.save(agenda);
}

    @Transactional
    public void deleteAgenda(Long id) {
        mrmAgendaRepository.deleteById(id);
    }

    // Minutes
    public List<MrmMinutes> getMinutesByPlan(Long planId) {
        return mrmMinutesRepository.findByMrmPlan_Id(planId);
    }

    public List<MrmMinutes> getPendingActions() {
        return mrmMinutesRepository.findByActionRequiredTrue();
    }

    @Transactional
    public MrmMinutes saveMinutes(MrmMinutes minutes) {
        return mrmMinutesRepository.save(minutes);
    }

    @Transactional
    public MrmMinutes updateMinutesStatus(Long id, MrmMinutes.MinutesStatus status) {
        MrmMinutes m = mrmMinutesRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Minutes not found: " + id));
        m.setStatus(status);
        return mrmMinutesRepository.save(m);
    }

    @Transactional
    public MrmMinutes updateMinutes(Long id, MrmMinutes updated) {
        MrmMinutes existing = mrmMinutesRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Minutes not found: " + id));
        if (updated.getAgendaTopic()       != null) existing.setAgendaTopic(updated.getAgendaTopic());
        if (updated.getInputDetails()      != null) existing.setInputDetails(updated.getInputDetails());
        if (updated.getDiscussionDetails() != null) existing.setDiscussionDetails(updated.getDiscussionDetails());
        if (updated.getDecisionTaken()     != null) existing.setDecisionTaken(updated.getDecisionTaken());
        existing.setActionRequired(updated.isActionRequired());
        if (updated.getResponsiblePerson() != null) existing.setResponsiblePerson(updated.getResponsiblePerson());
        if (updated.getTargetDate()        != null) existing.setTargetDate(updated.getTargetDate());
        if (updated.getRemarks()           != null) existing.setRemarks(updated.getRemarks());
        if (updated.getClosureDate()       != null) existing.setClosureDate(updated.getClosureDate());
        if (updated.getClosureRemarks()    != null) existing.setClosureRemarks(updated.getClosureRemarks());
        if (updated.getPriority()          != null) existing.setPriority(updated.getPriority());
        if (updated.getStatus()            != null) existing.setStatus(updated.getStatus());
        return mrmMinutesRepository.save(existing);
    }

    @Transactional
    public void deleteMinutes(Long id) {
        mrmMinutesRepository.deleteById(id);
    }
}
