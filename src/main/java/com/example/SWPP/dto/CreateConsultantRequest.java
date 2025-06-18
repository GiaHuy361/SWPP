package com.example.SWPP.dto;

import jakarta.validation.constraints.NotNull;

public class CreateConsultantRequest {
    @NotNull
    private Long userId;
    private String qualification;
    private Integer experienceYears;

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }
    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }
}