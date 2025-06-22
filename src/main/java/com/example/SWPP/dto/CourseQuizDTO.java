package com.example.SWPP.dto;

import jakarta.validation.constraints.NotNull;

public class CourseQuizDTO {
    private Long id;

    private Long courseId;

    @NotNull(message = "Duration minutes is mandatory")
    private Integer durationMinutes;

    @NotNull(message = "Shuffle questions flag is mandatory")
    private Boolean shuffleQuestions;

    @NotNull(message = "Shuffle answers flag is mandatory")
    private Boolean shuffleAnswers;

    @NotNull(message = "Passing percentage is mandatory")
    private Integer passingPercentage;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Boolean getShuffleQuestions() {
        return shuffleQuestions;
    }

    public void setShuffleQuestions(Boolean shuffleQuestions) {
        this.shuffleQuestions = shuffleQuestions;
    }

    public Boolean getShuffleAnswers() {
        return shuffleAnswers;
    }

    public void setShuffleAnswers(Boolean shuffleAnswers) {
        this.shuffleAnswers = shuffleAnswers;
    }

    public Integer getPassingPercentage() {
        return passingPercentage;
    }

    public void setPassingPercentage(Integer passingPercentage) {
        this.passingPercentage = passingPercentage;
    }
}