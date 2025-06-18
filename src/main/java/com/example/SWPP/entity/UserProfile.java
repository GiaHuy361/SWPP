
package com.example.SWPP.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import java.time.LocalDate;

@Entity
@Table(name = "user_profiles", indexes = {@Index(name = "idx_user_id", columnList = "user_id")})
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_id")
    private Long profileId;

    @Column(name = "user_id", nullable = false, unique = true, insertable = false, updatable = false)
    private Long userId;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    @MapsId
    private User user;

    @NotNull
    @PastOrPresent
    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 20)
    private Gender gender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_survey_id", referencedColumnName = "id")
    private Survey lastSurvey;

    @Column(name = "last_survey_score")
    private Integer lastSurveyScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "last_survey_risk_level", length = 20)
    private RiskLevel lastSurveyRiskLevel;

    @Column(name = "last_survey_date")
    private LocalDate lastSurveyDate;

    public enum Gender {
        MALE, FEMALE, OTHER
    }

    public enum RiskLevel {
        LOW_RISK, MODERATE_RISK, HIGH_RISK
    }

    public UserProfile() {}

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
    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }
    public Survey getLastSurvey() { return lastSurvey; }
    public void setLastSurvey(Survey lastSurvey) { this.lastSurvey = lastSurvey; }
    public Integer getLastSurveyScore() { return lastSurveyScore; }
    public void setLastSurveyScore(Integer lastSurveyScore) { this.lastSurveyScore = lastSurveyScore; }
    public RiskLevel getLastSurveyRiskLevel() { return lastSurveyRiskLevel; }
    public void setLastSurveyRiskLevel(RiskLevel lastSurveyRiskLevel) { this.lastSurveyRiskLevel = lastSurveyRiskLevel; }
    public LocalDate getLastSurveyDate() { return lastSurveyDate; }
    public void setLastSurveyDate(LocalDate lastSurveyDate) { this.lastSurveyDate = lastSurveyDate; }
}
