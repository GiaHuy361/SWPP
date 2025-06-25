package com.example.SWPP.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public class CourseQuizSubmissionDTO {
    private Long id;

    private Long userId;

    private Long quizId;

    private LocalDateTime submittedAt;

    private Integer percentageScore;

    private Boolean passed;

    @NotNull(message = "Duration taken is mandatory")
    private Integer durationTaken;

    @NotNull(message = "Answers are mandatory")
    @Valid
    private List<CourseQuizSubmissionAnswerDTO> answers;

    // --- GETTERS & SETTERS ---
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

    public List<CourseQuizSubmissionAnswerDTO> getAnswers() {
        return answers;
    }

    public void setAnswers(List<CourseQuizSubmissionAnswerDTO> answers) {
        this.answers = answers;
    }
}
