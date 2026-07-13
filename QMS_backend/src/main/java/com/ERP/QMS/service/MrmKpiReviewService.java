package com.ERP.QMS.service;

import com.ERP.QMS.model.Certification;
import com.ERP.QMS.model.MrmKpiReview;
import com.ERP.QMS.model.MrmPlan;
import com.ERP.QMS.repository.CertificationRepository;
import com.ERP.QMS.repository.MrmKpiReviewRepository;
import com.ERP.QMS.repository.MrmPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MrmKpiReviewService {

    private final MrmKpiReviewRepository mrmKpiReviewRepository;
    private final MrmPlanRepository mrmPlanRepository;
    private final CertificationRepository certificationRepository;
    private final SequenceService sequenceService;

    public List<MrmKpiReview> getByCertification(Long certId) {
        return mrmKpiReviewRepository.findByCertificationId(certId);
    }

    public Optional<MrmKpiReview> getByPlan(Long planId) {
        return mrmKpiReviewRepository.findByMrmPlanId(planId);
    }

    public MrmKpiReview getById(Long id) {
        return mrmKpiReviewRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("MRM KPI Review not found: " + id));
    }

    @Transactional
    public MrmKpiReview save(MrmKpiReview review) {
        if (review.getMrmPlan() == null || review.getMrmPlan().getId() == null) {
            throw new RuntimeException("MRM Plan is required for a KPI Review");
        }
        MrmPlan plan = mrmPlanRepository.findById(review.getMrmPlan().getId())
            .orElseThrow(() -> new RuntimeException("MRM Plan not found"));
        review.setMrmPlan(plan);

        if (review.getCertification() != null && review.getCertification().getId() != null) {
            Certification cert = certificationRepository.findById(review.getCertification().getId())
                .orElse(null);
            review.setCertification(cert);
        }

        // Only auto-generate an ID for brand-new reviews (id == null means insert, not update)
        if (review.getId() == null && (review.getKpiReviewId() == null || review.getKpiReviewId().isBlank())) {
            // SequenceService#nextKpiReviewId requires a String argument (e.g. prefix);
            // pass an empty string to use default behavior.
            review.setKpiReviewId(sequenceService.nextKpiReviewId(""));
        }

        recalcSummary(review);
        return mrmKpiReviewRepository.save(review);
    }

    @Transactional
    public MrmKpiReview update(Long id, MrmKpiReview updated) {
        MrmKpiReview existing = getById(id);

        if (updated.getReviewDate()            != null) existing.setReviewDate(updated.getReviewDate());
        if (updated.getFinancialYear()          != null) existing.setFinancialYear(updated.getFinancialYear());
        if (updated.getKpiPerformanceItems()    != null) existing.setKpiPerformanceItems(updated.getKpiPerformanceItems());
        if (updated.getReviewDecision()         != null) existing.setReviewDecision(updated.getReviewDecision());
        if (updated.getManagementComments()     != null) existing.setManagementComments(updated.getManagementComments());
        if (updated.getResponsiblePerson()      != null) existing.setResponsiblePerson(updated.getResponsiblePerson());
        if (updated.getTargetCompletionDate()   != null) existing.setTargetCompletionDate(updated.getTargetCompletionDate());
        if (updated.getReviewStatus()           != null) existing.setReviewStatus(updated.getReviewStatus());
        if (updated.getReviewedBy()             != null) existing.setReviewedBy(updated.getReviewedBy());
        if (updated.getReviewedDate()           != null) existing.setReviewedDate(updated.getReviewedDate());

        recalcSummary(existing);
        return mrmKpiReviewRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        mrmKpiReviewRepository.deleteById(id);
    }

    // Keep achieved/partiallyAchieved/notAchieved/totalKpiReviewed in sync with the line items,
    // instead of trusting whatever the client sends (or forgets to send).
    private void recalcSummary(MrmKpiReview review) {
        var items = review.getKpiPerformanceItems();
        if (items == null) return;

        int achieved = 0, partial = 0, notAchieved = 0;
        for (var item : items) {
            String status = item.getAchievementStatus();
            if (status == null) continue;
            switch (status.toUpperCase()) {
                case "ACHIEVED" -> achieved++;
                case "PARTIALLY_ACHIEVED", "PARTIAL" -> partial++;
                case "NOT_ACHIEVED" -> notAchieved++;
                default -> { /* unknown status, don't count */ }
            }
        }
        review.setTotalKpiReviewed(items.size());
        review.setAchieved(achieved);
        review.setPartiallyAchieved(partial);
        review.setNotAchieved(notAchieved);
    }
}
