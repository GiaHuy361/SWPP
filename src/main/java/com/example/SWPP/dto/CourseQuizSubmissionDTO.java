package com.example.SWPP.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public class CourseQuizSubmissionDTO {
    private Long id;

    private Long userId;

    private Long quizId;

    private LocalDateTime submittedAt;

    @NotNull(message = "Percentage score is mandatory")
    private Integer percentageScore;

    @NotNull(message = "Passed flag is mandatory")
    private Boolean passed;

    @NotNull(message = "Duration taken is mandatory")
    private Integer durationTaken;

    @NotNull(message = "Answer IDs are mandatory")
    private List<Long> answerIds;

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

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Integer getPercentageScore() {
        return percentageScore;
    }

    public void setPercentageScore(Integer percentageScore) {
        this.percentageScore = percentageScore;
    }

    public Boolean getPassed() {
        return passed;
    }

    public void setPassed(Boolean passed) {
        this.passed = passed;
    }

    public Integer getDurationTaken() {
        return durationTaken;
    }

    public void setDurationTaken(Integer durationTaken) {
        this.durationTaken = durationTaken;
    }

    public List<Long> getAnswerIds() {
        return answerIds;
    }

    public void setAnswerIds(List<Long> answerIds) {
        this.answerIds = answerIds;
    }
}