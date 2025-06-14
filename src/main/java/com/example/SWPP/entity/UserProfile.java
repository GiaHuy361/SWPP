package com.example.SWPP.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "user_profiles")
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_id")
    private Long profileId;

    @Column(name = "user_id", nullable = false, unique = true, insertable = false, updatable = false)
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    @MapsId
    private User user;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "gender", length = 20, nullable = false)
    private String gender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_survey_id", referencedColumnName = "id")
    private Survey lastSurvey;

    @Column(name = "last_survey_score", nullable = false)
    private Integer lastSurveyScore;

    @Column(name = "last_survey_risk_level", length = 50, nullable = false)
    private String lastSurveyRiskLevel;

    @Column(name = "last_survey_date", nullable = false)
    private LocalDate lastSurveyDate;

    // Constructors
    public UserProfile() {}

    // Getters and Setters
    public Long getProfileId() { return profileId; }
    public void setProfileId(Long profileId) { this.profileId = profileId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public User getUser() { return user; }
    public void setUser(User user) {
        this.user = user;
        if (user != null) {
            this.userId = user.getUserId();
        }
    }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public Survey getLastSurvey() { return lastSurvey; }
    public void setLastSurvey(Survey lastSurvey) { this.lastSurvey = lastSurvey; }
    public Integer getLastSurveyScore() { return lastSurveyScore; }
    public void setLastSurveyScore(Integer lastSurveyScore) { this.lastSurveyScore = lastSurveyScore; }
    public String getLastSurveyRiskLevel() { return lastSurveyRiskLevel; }
    public void setLastSurveyRiskLevel(String lastSurveyRiskLevel) { this.lastSurveyRiskLevel = lastSurveyRiskLevel; }
    public LocalDate getLastSurveyDate() { return lastSurveyDate; }
    public void setLastSurveyDate(LocalDate lastSurveyDate) { this.lastSurveyDate = lastSurveyDate; }
}