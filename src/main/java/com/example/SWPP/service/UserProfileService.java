
package com.example.SWPP.service;

import com.example.SWPP.entity.Survey;
import com.example.SWPP.entity.SurveyResponse;
import com.example.SWPP.entity.User;
import com.example.SWPP.entity.UserProfile;
import com.example.SWPP.repository.SurveyRepository;
import com.example.SWPP.repository.SurveyResponseRepository;
import com.example.SWPP.repository.UserProfileRepository;
import com.example.SWPP.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final SurveyRepository surveyRepository;
    private final SurveyResponseRepository surveyResponseRepository;

    public UserProfileService(UserProfileRepository userProfileRepository, UserRepository userRepository,
                              SurveyRepository surveyRepository, SurveyResponseRepository surveyResponseRepository) {
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
        this.surveyRepository = surveyRepository;
        this.surveyResponseRepository = surveyResponseRepository;
    }

    public UserProfile createUserProfile(Long userId, UserProfile userProfile) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        userProfile.setUser(user);
        userProfile.setUserId(userId);
        userProfile.setGender(userProfile.getGender());
        return userProfileRepository.save(userProfile);
    }

    public UserProfile getUserProfile(Long userId) {
        return userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Hồ sơ người dùng không tồn tại"));
    }

    public UserProfile updateUserProfile(Long userId, UserProfile updatedProfile, String username, String email, String fullName, String phone) {
        UserProfile existingProfile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Hồ sơ người dùng không tồn tại"));
        User user = existingProfile.getUser();

        // Cập nhật User
        if (username != null) {
            if (userRepository.findByUsername(username).filter(u -> !u.getUserId().equals(userId)).isPresent()) {
                throw new RuntimeException("Tên đăng nhập đã được sử dụng");
            }
            user.setUsername(username);
        }
        if (email != null) {
            if (userRepository.findByEmail(email).filter(u -> !u.getUserId().equals(userId)).isPresent()) {
                throw new RuntimeException("Email đã được sử dụng");
            }
            user.setEmail(email);
        }
        if (fullName != null) {
            user.setFullName(fullName);
        }
        if (phone != null) {
            user.setPhone(phone);
        }
        userRepository.save(user);

        // Cập nhật UserProfile
        if (updatedProfile.getDateOfBirth() != null) {
            existingProfile.setDateOfBirth(updatedProfile.getDateOfBirth());
        }
        existingProfile.setGender(updatedProfile.getGender());
        if (updatedProfile.getLastSurveyScore() != null) {
            existingProfile.setLastSurveyScore(updatedProfile.getLastSurveyScore());
        }
        if (updatedProfile.getLastSurveyRiskLevel() != null) {
            existingProfile.setLastSurveyRiskLevel(updatedProfile.getLastSurveyRiskLevel());
        }
        if (updatedProfile.getLastSurveyDate() != null) {
            existingProfile.setLastSurveyDate(updatedProfile.getLastSurveyDate());
        }
        if (updatedProfile.getLastSurvey() != null) {
            Survey survey = surveyRepository.findById(updatedProfile.getLastSurvey().getId())
                    .orElseThrow(() -> new RuntimeException("Khảo sát không tồn tại"));
            existingProfile.setLastSurvey(survey);
        }
        return userProfileRepository.save(existingProfile);
    }

    public void deleteUserProfile(Long userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Hồ sơ người dùng không tồn tại"));
        userProfileRepository.delete(profile);
    }

    public void updateSurveyResult(Long userId, SurveyResponse surveyResponse, Survey survey) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Hồ sơ người dùng không tồn tại"));
        profile.setLastSurvey(survey);
        profile.setLastSurveyScore(surveyResponse.getTotalScore());
        profile.setLastSurveyDate(surveyResponse.getSubmittedAt().toLocalDate());
        if (surveyResponse.getRiskLevel() != null) {
            String riskLevelStr = surveyResponse.getRiskLevel().toUpperCase().replace(" ", "_");
            try {
                UserProfile.RiskLevel riskLevel = UserProfile.RiskLevel.valueOf(riskLevelStr);
                profile.setLastSurveyRiskLevel(riskLevel);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Mức rủi ro không hợp lệ: " + surveyResponse.getRiskLevel());
            }
        }
        userProfileRepository.save(profile);
    }
}
