package com.example.SWPP.service;

import com.example.SWPP.entity.Certificate;
import com.example.SWPP.entity.Enrollment;
import com.example.SWPP.repository.CertificateRepository;
import com.example.SWPP.repository.EnrollmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class CertificateService {
    private static final Logger logger = LoggerFactory.getLogger(CertificateService.class);

    private final CertificateRepository certificateRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CertificateService(CertificateRepository certificateRepository, EnrollmentRepository enrollmentRepository) {
        this.certificateRepository = certificateRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Transactional
    public Certificate issueCertificate(Long enrollmentId) {
        logger.info("Issuing certificate for enrollmentId={}", enrollmentId);
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new IllegalArgumentException("Enrollment not found: " + enrollmentId));
        Certificate certificate = new Certificate();
        certificate.setEnrollment(enrollment);
        certificate.setIssuedAt(LocalDateTime.now());
        certificate.setCertificateUrl("http://example.com/certificate/" + enrollmentId);
        return certificateRepository.save(certificate);
    }

    public Certificate getCertificateByEnrollmentId(Long enrollmentId) {
        logger.info("Retrieving certificate for enrollmentId={}", enrollmentId);
        return certificateRepository.findById(enrollmentId)
                .orElseThrow(() -> new IllegalArgumentException("Certificate not found for enrollment: " + enrollmentId));
    }
    public long countCertificates() {
        return certificateRepository.count();
    }
}