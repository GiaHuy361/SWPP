package com.example.SWPP.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateConsultantRequest {
    private String qualification;
    private Integer experienceYears;
    private Boolean isActive;
    @NotBlank(message = "Full name không được để trống")
    private String fullName; // Từ User
    @NotBlank(message = "Email không được để trống")
    private String email;   // Từ User
    private String phone;   // Từ User

    // Getters and Setters
    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }
    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}