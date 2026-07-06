package com.ERP.QMS.repository;

import com.ERP.QMS.model.IssueRegister;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface IssueRegisterRepository extends JpaRepository<IssueRegister, Long> {
    Optional<IssueRegister> findByIssueId(String issueId);
    List<IssueRegister> findByCertificationId(Long certId);
    List<IssueRegister> findByDocumentId(Long docId);
    long countByCertificationId(Long certId);

    @org.springframework.data.jpa.repository.Query(
        "SELECT COUNT(ir) FROM IssueRegister ir WHERE ir.department.departmentCode = :deptCode")
    long countByDeptCode(String deptCode);
}
