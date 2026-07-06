package com.ERP.QMS.repository;

import com.ERP.QMS.model.NcTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface NcTrackingRepository extends JpaRepository<NcTracking, Long> {
    Optional<NcTracking> findByNcNumber(String ncNumber);
    List<NcTracking> findByCertificationId(Long certId);
    List<NcTracking> findByCertificationIdAndStatus(Long certId, NcTracking.NcStatus status);
    List<NcTracking> findByStatus(NcTracking.NcStatus status);
    long countByCertificationId(Long certId);
    long countByCertificationIdAndStatus(Long certId, NcTracking.NcStatus status);
    long countByStatus(NcTracking.NcStatus status);
}
