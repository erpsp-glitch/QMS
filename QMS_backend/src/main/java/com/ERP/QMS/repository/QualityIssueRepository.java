package com.ERP.QMS.repository;

import com.ERP.QMS.model.QualityIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QualityIssueRepository extends JpaRepository<QualityIssue, Long> {

    List<QualityIssue> findByCertificationIdOrderByCreatedAtDesc(Long certificationId);

    List<QualityIssue> findByDepartmentIdOrderByCreatedAtDesc(Long departmentId);

    List<QualityIssue> findByStatusOrderByCreatedAtDesc(QualityIssue.IssueStatus status);

    List<QualityIssue> findBySeverityOrderByCreatedAtDesc(QualityIssue.IssueSeverity severity);

    List<QualityIssue> findAllByOrderByCreatedAtDesc();

    Optional<QualityIssue> findByIssueNumber(String issueNumber);

    @Query("SELECT COUNT(q) FROM QualityIssue q WHERE q.status = 'OPEN'")
    long countOpenIssues();

    @Query("SELECT COUNT(q) FROM QualityIssue q WHERE q.severity = 'CRITICAL'")
    long countCriticalIssues();
}
