package com.ERP.QMS.controller;

import com.ERP.QMS.dto.ApiResponse;
import com.ERP.QMS.model.Car;
import com.ERP.QMS.model.Certification;
import com.ERP.QMS.model.NcTracking;
import com.ERP.QMS.repository.CarRepository;
import com.ERP.QMS.repository.CertificationRepository;
import com.ERP.QMS.repository.NcTrackingRepository;
import com.ERP.QMS.service.SequenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/cars")
@RequiredArgsConstructor
public class CarController {

    private final CarRepository carRepository;
    private final NcTrackingRepository ncTrackingRepository;
    private final CertificationRepository certificationRepository;
    private final SequenceService sequenceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Car>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(carRepository.findAll()));
    }

    @GetMapping("/certification/{certId}")
    public ResponseEntity<ApiResponse<List<Car>>> getByCert(@PathVariable Long certId) {
        return ResponseEntity.ok(ApiResponse.ok(carRepository.findByCertificationId(certId)));
    }

    @GetMapping("/nc/{ncId}")
    public ResponseEntity<ApiResponse<List<Car>>> getByNc(@PathVariable Long ncId) {
        return ResponseEntity.ok(ApiResponse.ok(carRepository.findByNcTrackingId(ncId)));
    }

    @GetMapping("/open")
    public ResponseEntity<ApiResponse<List<Car>>> getOpen() {
        return ResponseEntity.ok(ApiResponse.ok(carRepository.findByStatus(Car.CarStatus.OPEN)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Car>> getById(@PathVariable Long id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CAR not found: " + id));
        return ResponseEntity.ok(ApiResponse.ok(car));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Car>> create(@RequestBody Car car) {
        // Resolve certification
        if (car.getCertification() != null && car.getCertification().getId() != null) {
            Certification cert = certificationRepository.findById(car.getCertification().getId())
                    .orElseThrow(() -> new RuntimeException("Certification not found"));
            car.setCertification(cert);
            car.setCarNumber(sequenceService.nextCarNumber(cert.getCode()));
        } else {
            car.setCarNumber(sequenceService.nextCarNumber("QMS"));
        }

        // Auto-fill from NC if linked
        if (car.getNcTracking() != null && car.getNcTracking().getId() != null) {
            NcTracking nc = ncTrackingRepository.findById(car.getNcTracking().getId())
                    .orElseThrow(() -> new RuntimeException("NC not found"));
            car.setNcTracking(nc);
            // Only set if not already provided
            if (car.getDepartment() == null) car.setDepartment(nc.getDepartment());
            if (car.getClause() == null) car.setClause(nc.getClauseNo());
            if (car.getNcType() == null && nc.getNcType() != null) car.setNcType(nc.getNcType().name());
            if (car.getPriority() == null && nc.getPriority() != null) car.setPriority(nc.getPriority().name());
            if (car.getNcDescription() == null) car.setNcDescription(nc.getNcDescription());
            if (car.getContainmentAction() == null) car.setContainmentAction(nc.getContainmentAction());
            if (car.getResponsiblePerson() == null) car.setResponsiblePerson(nc.getResponsiblePerson());
            if (car.getTargetDate() == null) car.setTargetDate(nc.getTargetDate());
            if (car.getCertification() == null && nc.getCertification() != null) {
                car.setCertification(nc.getCertification());
                car.setCarNumber(sequenceService.nextCarNumber(nc.getCertification().getCode()));
            }
            if (car.getAuditPlan() == null) car.setAuditPlan(nc.getAuditPlan());
        }

        car.setStatus(Car.CarStatus.OPEN);
        return ResponseEntity.ok(ApiResponse.ok("CAR created", carRepository.save(car)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Car>> update(@PathVariable Long id, @RequestBody Car updated) {
        Car existing = carRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CAR not found: " + id));

        existing.setRcaMethod(updated.getRcaMethod());
        existing.setRootCause(updated.getRootCause());
        existing.setCorrectiveAction(updated.getCorrectiveAction());
        existing.setVerificationBy(updated.getVerificationBy());
        existing.setVerificationDate(updated.getVerificationDate());
        existing.setVerificationRemarks(updated.getVerificationRemarks());
        existing.setEvidenceReference(updated.getEvidenceReference());
        existing.setClosureDate(updated.getClosureDate());
        existing.setClosureRemarks(updated.getClosureRemarks());
        existing.setResponsiblePerson(updated.getResponsiblePerson());
        existing.setTargetDate(updated.getTargetDate());
        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());

        return ResponseEntity.ok(ApiResponse.ok("CAR updated", carRepository.save(existing)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Car>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CAR not found: " + id));
        car.setStatus(Car.CarStatus.valueOf(status));
        if (Car.CarStatus.CLOSED == Car.CarStatus.valueOf(status) && car.getClosureDate() == null) {
            car.setClosureDate(LocalDate.now());
        }
        return ResponseEntity.ok(ApiResponse.ok("Status updated", carRepository.save(car)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        carRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted"));
    }
}
