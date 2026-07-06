package com.ERP.QMS.repository;

import com.ERP.QMS.model.Certification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CertificationRepository extends JpaRepository<Certification, Long> {
    Optional<Certification> findByCode(String code);
    boolean existsByCode(String code);
    List<Certification> findByStatus(Certification.CertificationStatus status);
}
