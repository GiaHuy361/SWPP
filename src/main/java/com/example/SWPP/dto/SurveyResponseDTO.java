package com.example.SWPP.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SurveyResponseDTO {
    private Long id;
    private Long userId;
    private Long surveyId;
    private LocalDateTime submittedAt;
    private Integer totalScore;
    private String riskLevel;
    private List<SurveyAnswerDTO> answers;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getSurveyId() { return surveyId; }
    public void setSurveyId(Long surveyId) { this.surveyId = surveyId; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public Integer getTotalScore() { return totalScore; }
    public void setTotalScore(Integer totalScore) { this.totalScore = totalScore; }
    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public List<SurveyAnswerDTO> getAnswers() { return answers; }
    public void setAnswers(List<SurveyAnswerDTO> answers) { this.answers = answers; }
}