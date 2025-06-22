package com.example.SWPP.controller;

import com.example.SWPP.dto.UserLessonProgressDTO;
import com.example.SWPP.entity.User;
import com.example.SWPP.entity.UserLessonProgress;
import com.example.SWPP.mapper.UserLessonProgressMapper;
import com.example.SWPP.repository.UserRepository;
import com.example.SWPP.service.UserLessonProgressService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/progress")
public class UserLessonProgressController {
    private static final Logger logger = LoggerFactory.getLogger(UserLessonProgressController.class);

    private final UserLessonProgressService progressService;
    private final UserRepository userRepository;

    public UserLessonProgressController(UserLessonProgressService progressService, UserRepository userRepository) {
        this.progressService = progressService;
        this.userRepository = userRepository;
    }

    @PostMapping("/lessons/{lessonId}/complete")
    @PreAuthorize("hasAuthority('COMPLETE_LESSON')")
    public ResponseEntity<?> completeLesson(@PathVariable Long lessonId, Authentication authentication) {
        logger.info("Completing lessonId={} for user", lessonId);
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
            UserLessonProgress progress = progressService.completeLesson(user.getUserId(), lessonId);
            return ResponseEntity.ok(UserLessonProgressMapper.toDto(progress));
        } catch (IllegalArgumentException | IllegalStateException e) {
            logger.error("Failed to complete lesson: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/courses/{courseId}")
    @PreAuthorize("hasAuthority('VIEW_PROGRESS')")
    public ResponseEntity<?> getProgressForCourse(@PathVariable Long courseId, Authentication authentication) {
        logger.info("Retrieving progress for courseId={}", courseId);
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
            List<UserLessonProgressDTO> progress = progressService.getProgressForCourse(user.getUserId(), courseId).stream()
                    .map(UserLessonProgressMapper::toDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(progress);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to retrieve progress: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}