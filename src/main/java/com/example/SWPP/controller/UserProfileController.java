package com.example.SWPP.controller;

import com.example.SWPP.dto.CreateUserProfileRequest;
import com.example.SWPP.dto.UpdateUserProfileRequest;
import com.example.SWPP.entity.UserProfile;
import com.example.SWPP.repository.UserRepository;
import com.example.SWPP.service.UserProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profiles")
public class UserProfileController {

    private static final Logger logger = LoggerFactory.getLogger(UserProfileController.class);

    private final UserProfileService userProfileService;
    private final UserRepository userRepository;

    public UserProfileController(UserProfileService userProfileService, UserRepository userRepository) {
        this.userProfileService = userProfileService;
        this.userRepository = userRepository;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<?> createUserProfile(@PathVariable Long userId, @Valid @RequestBody CreateUserProfileRequest request, BindingResult bindingResult, Authentication authentication) {
        logger.info("Creating profile for userId={}", userId);
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Create profile failed: validation error - {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_Admin"));
            String currentUserEmail = authentication.getName();
            Long authenticatedUserId = userRepository.findByEmail(currentUserEmail)
                    .map(user -> user.getUserId())
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));
            if (!isAdmin && !userId.equals(authenticatedUserId)) {
                logger.warn("Unauthorized attempt: user={} trying to create profile for userId={}", currentUserEmail, userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Bạn không có quyền tạo hồ sơ này"));
            }
            UserProfile userProfile = new UserProfile();
            userProfile.setDateOfBirth(request.getDateOfBirth());
            userProfile.setGender(request.getGender());
            UserProfile savedProfile = userProfileService.createUserProfile(userId, userProfile);
            logger.info("Profile created successfully: userId={}", userId);
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("profileId", savedProfile.getProfileId());
            response.put("userId", savedProfile.getUserId());
            response.put("dateOfBirth", savedProfile.getDateOfBirth());
            response.put("gender", savedProfile.getGender() != null ? savedProfile.getGender().name() : "");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to create profile for userId={}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Tạo hồ sơ thất bại: " + e.getMessage()));
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long userId, Authentication authentication) {
        logger.info("Fetching profile for userId={}", userId);
        try {
            boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_Admin"));
            String currentUserEmail = authentication.getName();
            Long authenticatedUserId = userRepository.findByEmail(currentUserEmail)
                    .map(user -> user.getUserId())
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));
            if (!isAdmin && !userId.equals(authenticatedUserId)) {
                logger.warn("Unauthorized attempt: user={} trying to access profile for userId={}", currentUserEmail, userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Bạn không có quyền xem hồ sơ này"));
            }
            UserProfile profile = userProfileService.getUserProfile(userId);
            logger.info("Profile fetched successfully: userId={}", userId);
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("profileId", profile.getProfileId());
            response.put("userId", profile.getUserId());
            response.put("username", profile.getUser().getUsername());
            response.put("email", profile.getUser().getEmail());
            response.put("fullName", profile.getUser().getFullName());
            response.put("phone", profile.getUser().getPhone() != null ? profile.getUser().getPhone() : "");
            response.put("dateOfBirth", profile.getDateOfBirth());
            response.put("gender", profile.getGender() != null ? profile.getGender().name() : "");
            response.put("lastSurveyScore", profile.getLastSurveyScore() != null ? profile.getLastSurveyScore() : 0);
            response.put("lastSurveyRiskLevel", profile.getLastSurveyRiskLevel() != null ? profile.getLastSurveyRiskLevel().name() : "");
            response.put("lastSurveyDate", profile.getLastSurveyDate() != null ? profile.getLastSurveyDate().toString() : "");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to fetch profile for userId={}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy hồ sơ"));
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUserProfile(@PathVariable Long userId, @Valid @RequestBody UpdateUserProfileRequest request, BindingResult bindingResult, Authentication authentication) {
        logger.info("Updating profile for userId={}", userId);
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Update profile failed: validation error - {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_Admin"));
            String currentUserEmail = authentication.getName();
            Long authenticatedUserId = userRepository.findByEmail(currentUserEmail)
                    .map(user -> user.getUserId())
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));
            if (!isAdmin && !userId.equals(authenticatedUserId)) {
                logger.warn("Unauthorized attempt: user={} trying to update profile for userId={}", currentUserEmail, userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Bạn không có quyền cập nhật hồ sơ này"));
            }
            UserProfile userProfile = new UserProfile();
            userProfile.setDateOfBirth(request.getDateOfBirth());
            userProfile.setGender(request.getGender());
            UserProfile updatedProfile = userProfileService.updateUserProfile(
                    userId,
                    userProfile,
                    request.getUsername(),
                    request.getEmail(),
                    request.getFullName(),
                    request.getPhone()
            );
            logger.info("Profile updated successfully: userId={}", userId);
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("profileId", updatedProfile.getProfileId());
            response.put("userId", updatedProfile.getUserId());
            response.put("username", updatedProfile.getUser().getUsername());
            response.put("email", updatedProfile.getUser().getEmail());
            response.put("fullName", updatedProfile.getUser().getFullName());
            response.put("phone", updatedProfile.getUser().getPhone() != null ? updatedProfile.getUser().getPhone() : "");
            response.put("dateOfBirth", updatedProfile.getDateOfBirth());
            response.put("gender", updatedProfile.getGender() != null ? updatedProfile.getGender().name() : "");
            response.put("lastSurveyScore", updatedProfile.getLastSurveyScore() != null ? updatedProfile.getLastSurveyScore() : 0);
            response.put("lastSurveyRiskLevel", updatedProfile.getLastSurveyRiskLevel() != null ? updatedProfile.getLastSurveyRiskLevel().name() : "");
            response.put("lastSurveyDate", updatedProfile.getLastSurveyDate() != null ? updatedProfile.getLastSurveyDate().toString() : "");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to update profile for userId={}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Cập nhật hồ sơ thất bại: " + e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('Admin')")
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUserProfile(@PathVariable Long userId) {
        logger.info("Deleting profile for userId={}", userId);
        try {
            userProfileService.deleteUserProfile(userId);
            logger.info("Profile deleted successfully: userId={}", userId);
            return ResponseEntity.ok(Map.of("message", "Xóa hồ sơ thành công"));
        } catch (Exception e) {
            logger.error("Failed to delete profile for userId={}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Xóa hồ sơ thất bại"));
        }
    }
}