package com.example.SWPP.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class UserLessonProgressDTO {
    private Long id;

    private Long userId;

    private Long lessonId;

    private LocalDateTime completedAt;

    @NotNull(message = "Completed flag is mandatory")
    private Boolean completedFlag;

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

    public Long getLessonId() {
        return lessonId;
    }

    public void setLessonId(Long lessonId) {
        this.lessonId = lessonId;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Boolean getCompletedFlag() {
        return completedFlag;
    }

    public void setCompletedFlag(Boolean completedFlag) {
        this.completedFlag = completedFlag;
    }
}