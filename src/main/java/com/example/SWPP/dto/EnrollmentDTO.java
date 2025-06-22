package com.example.SWPP.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class EnrollmentDTO {
    private Long id;

    private Long userId;

    private Long courseId;

    @NotNull(message = "Enrolled at is mandatory")
    private LocalDateTime enrolledAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public LocalDateTime getEnrolledAt() {
        return enrolledAt;
    }

    public void setEnrolledAt(LocalDateTime enrolledAt) {
        this.enrolledAt = enrolledAt;
    }
}