package com.example.SWPP.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CourseDTO {
    private Long id;

    @NotBlank(message = "Title is mandatory")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @NotBlank(message = "Level is mandatory")
    @Size(max = 50, message = "Level must not exceed 50 characters")
    private String level;

    @NotBlank(message = "Description is mandatory")
    private String description;

    @NotNull(message = "Recommended minimum score is mandatory")
    private Integer recommendedMinScore;

    @NotNull(message = "Recommended maximum score is mandatory")
    private Integer recommendedMaxScore;

    @NotBlank(message = "Age group is mandatory")
    @Size(max = 50, message = "Age group must not exceed 50 characters")
    private String ageGroup;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getRecommendedMinScore() {
        return recommendedMinScore;
    }

    public void setRecommendedMinScore(Integer recommendedMinScore) {
        this.recommendedMinScore = recommendedMinScore;
    }

    public Integer getRecommendedMaxScore() {
        return recommendedMaxScore;
    }

    public void setRecommendedMaxScore(Integer recommendedMaxScore) {
        this.recommendedMaxScore = recommendedMaxScore;
    }

    public String getAgeGroup() {
        return ageGroup;
    }

    public void setAgeGroup(String ageGroup) {
        this.ageGroup = ageGroup;
    }
}