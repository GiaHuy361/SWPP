package com.example.SWPP.mapper;

import com.example.SWPP.dto.CertificateDTO;
import com.example.SWPP.entity.Certificate;

public class CertificateMapper {
    public static CertificateDTO toDto(Certificate certificate) {
        CertificateDTO dto = new CertificateDTO();
        dto.setId(certificate.getId());
        dto.setEnrollmentId(certificate.getEnrollment().getId());
        dto.setIssuedAt(certificate.getIssuedAt());
        dto.setCertificateUrl(certificate.getCertificateUrl());
        return dto;
    }

    public static Certificate toEntity(CertificateDTO dto) {
        Certificate certificate = new Certificate();
        certificate.setIssuedAt(dto.getIssuedAt());
        certificate.setCertificateUrl(dto.getCertificateUrl());
        return certificate;
    }
}