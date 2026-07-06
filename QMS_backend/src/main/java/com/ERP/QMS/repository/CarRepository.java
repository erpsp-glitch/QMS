package com.ERP.QMS.repository;

import com.ERP.QMS.model.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CarRepository extends JpaRepository<Car, Long> {
    Optional<Car> findByCarNumber(String carNumber);
    List<Car> findByNcTrackingId(Long ncId);
    List<Car> findByCertificationId(Long certId);
    List<Car> findByStatus(Car.CarStatus status);
    long countByStatus(Car.CarStatus status);
    long countByCertificationId(Long certId);
}
