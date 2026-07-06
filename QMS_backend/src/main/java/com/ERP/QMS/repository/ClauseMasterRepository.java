package com.ERP.QMS.repository;

import com.ERP.QMS.model.ClauseMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClauseMasterRepository extends JpaRepository<ClauseMaster, Long> {

    List<ClauseMaster> findByCertificationId(Long certificationId);

    List<ClauseMaster> findByDepartmentId(Long departmentId);

    List<ClauseMaster> findByCertificationIdAndDepartmentId(Long certificationId, Long departmentId);

    List<ClauseMaster> findByCertificationIdAndDepartmentIdAndStatus(
            Long certificationId, Long departmentId, ClauseMaster.ClauseStatus status);

    List<ClauseMaster> findByStatus(ClauseMaster.ClauseStatus status);

    Optional<ClauseMaster> findByClauseId(String clauseId);

    boolean existsByClauseId(String clauseId);
}
