package com.example.SWPP.mapper;

import com.example.SWPP.dto.EnrollmentDTO;
import com.example.SWPP.entity.Enrollment;

public class EnrollmentMapper {
    public static EnrollmentDTO toDto(Enrollment enrollment) {
        EnrollmentDTO dto = new EnrollmentDTO();
        dto.setId(enrollment.getId());
        dto.setUserId(enrollment.getUser().getUserId());
        dto.setCourseId(enrollment.getCourse().getId());
        dto.setEnrolledAt(enrollment.getEnrolledAt());
        return dto;
    }

    public static Enrollment toEntity(EnrollmentDTO dto) {
        Enrollment enrollment = new Enrollment();
        enrollment.setEnrolledAt(dto.getEnrolledAt());
        return enrollment;
    }
}
