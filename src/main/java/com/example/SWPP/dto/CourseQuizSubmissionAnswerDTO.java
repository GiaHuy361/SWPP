package com.example.SWPP.dto;

import jakarta.validation.constraints.NotNull;

public class CourseQuizSubmissionAnswerDTO {
    private Long id;

    private Long submissionId;

    @NotNull(message = "Question ID is required")
    private Long questionId;

    @NotNull(message = "Selected answer ID is required")
    private Long selectedAnswerId;

    // ✅ Thêm trường để trả nội dung câu trả lời về cho client (tùy chọn)
    private String selectedAnswerText;

    // --- GETTERS & SETTERS ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(Long submissionId) {
        this.submissionId = submissionId;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public Long getSelectedAnswerId() {
        return selectedAnswerId;
    }

    public void setSelectedAnswerId(Long selectedAnswerId) {
        this.selectedAnswerId = selectedAnswerId;
    }

    public String getSelectedAnswerText() {
        return selectedAnswerText;
    }

    public void setSelectedAnswerText(String selectedAnswerText) {
        this.selectedAnswerText = selectedAnswerText;
    }
}
