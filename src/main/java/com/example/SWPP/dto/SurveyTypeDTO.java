package com.example.SWPP.dto;

public class SurveyTypeDTO {
    private Long id;
    private String name;
    private String description;
    private Integer maxScore;
    private String riskThresholds;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getMaxScore() { return maxScore; }
    public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }
    public String getRiskThresholds() { return riskThresholds; }
    public void setRiskThresholds(String riskThresholds) { this.riskThresholds = riskThresholds; }
}