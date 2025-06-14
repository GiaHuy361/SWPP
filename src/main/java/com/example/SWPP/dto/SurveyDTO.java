package com.example.SWPP.dto;

import java.time.LocalDateTime;

public class SurveyDTO {
    private Integer id;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private SurveyTypeDTO surveyType;

    public SurveyDTO() {}

    public SurveyDTO(Integer id, String title, String description, LocalDateTime createdAt, SurveyTypeDTO surveyType) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.createdAt = createdAt;
        this.surveyType = surveyType;
    }

    // getters/setters

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public SurveyTypeDTO getSurveyType() {
        return surveyType;
    }

    public void setSurveyType(SurveyTypeDTO surveyType) {
        this.surveyType = surveyType;
    }
}
