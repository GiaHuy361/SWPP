package com.example.SWPP.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class CertificateDTO {
    private Long id;

    private Long enrollmentId;

    @NotNull(message = "Issued at is mandatory")
    private LocalDateTime issuedAt;

    @NotNull(message = "Certificate URL is mandatory")
    private String certificateUrl;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEnrollmentId() {
        return enrollmentId;
    }

    public void setEnrollmentId(Long enrollmentId) {
        this.enrollmentId = enrollmentId;
    }

    public LocalDateTime getIssuedAt() {
        return issuedAt;
    }

    public void setIssuedAt(LocalDateTime issuedAt) {
        this.issuedAt = issuedAt;
    }

    public String getCertificateUrl() {
        return certificateUrl;
    }

    public void setCertificateUrl(String certificateUrl) {
        this.certificateUrl = certificateUrl;
    }
}