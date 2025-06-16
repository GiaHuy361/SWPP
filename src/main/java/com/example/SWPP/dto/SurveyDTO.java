package com.example.SWPP.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SurveyDTO {
    private Long id;
    private String title;
    private String description;
    private Long surveyTypeId;
    private LocalDateTime createdAt;
    private List<SurveyQuestionDTO> questions; // Thêm trường questions

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getSurveyTypeId() { return surveyTypeId; }
    public void setSurveyTypeId(Long surveyTypeId) { this.surveyTypeId = surveyTypeId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<SurveyQuestionDTO> getQuestions() { return questions; }
    public void setQuestions(List<SurveyQuestionDTO> questions) { this.questions = questions; }
}