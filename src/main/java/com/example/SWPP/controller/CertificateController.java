package com.example.SWPP.controller;

import com.example.SWPP.dto.CertificateDTO;
import com.example.SWPP.entity.Certificate;
import com.example.SWPP.entity.Enrollment;
import com.example.SWPP.mapper.CertificateMapper;
import com.example.SWPP.repository.EnrollmentRepository;
import com.example.SWPP.service.CertificateService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {
    private static final Logger logger = LoggerFactory.getLogger(CertificateController.class);

    private final CertificateService certificateService;
    private final EnrollmentRepository enrollmentRepository;

    public CertificateController(CertificateService certificateService, EnrollmentRepository enrollmentRepository) {
        this.certificateService = certificateService;
        this.enrollmentRepository = enrollmentRepository;
    }

    // ✅ GET: Đếm số lượng chứng chỉ
    @GetMapping("/count")
    public ResponseEntity<?> countCertificates() {
        long count = certificateService.countCertificates();
        return ResponseEntity.ok(Map.of("count", count));
    }

    // ✅ POST: Cấp chứng chỉ dựa trên enrollmentId
    @PostMapping("/enrollments/{enrollmentId}")
    @PreAuthorize("hasAuthority('MANAGE_COURSES')")
    public ResponseEntity<?> issueCertificate(@PathVariable Long enrollmentId, Authentication authentication) {
        logger.info("Issuing certificate for enrollmentId={}", enrollmentId);
        try {
            Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                    .orElseThrow(() -> new IllegalArgumentException("Enrollment not found: " + enrollmentId));
            Certificate certificate = certificateService.issueCertificate(enrollmentId);
            return ResponseEntity.status(HttpStatus.CREATED).body(CertificateMapper.toDto(certificate));
        } catch (IllegalArgumentException e) {
            logger.error("Failed to issue certificate: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // ✅ GET: Lấy chứng chỉ theo enrollmentId
    @GetMapping("/enrollments/{enrollmentId}")
    @PreAuthorize("hasAuthority('VIEW_CERTIFICATES')")
    public ResponseEntity<?> getCertificateByEnrollmentId(@PathVariable Long enrollmentId, Authentication authentication) {
        logger.info("Retrieving certificate for enrollmentId={}", enrollmentId);
        try {
            Certificate certificate = certificateService.getCertificateByEnrollmentId(enrollmentId);
            return ResponseEntity.ok(CertificateMapper.toDto(certificate));
        } catch (IllegalArgumentException e) {
            logger.error("Failed to retrieve certificate: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
