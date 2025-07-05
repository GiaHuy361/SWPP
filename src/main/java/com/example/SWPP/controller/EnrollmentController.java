package com.example.SWPP.controller;

import com.example.SWPP.dto.EnrollmentDTO;
import com.example.SWPP.entity.Enrollment;
import com.example.SWPP.entity.User;
import com.example.SWPP.mapper.EnrollmentMapper;
import com.example.SWPP.repository.UserRepository;
import com.example.SWPP.service.EnrollmentService;
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
@RequestMapping("/api/enrollments")
public class EnrollmentController {
    private static final Logger logger = LoggerFactory.getLogger(EnrollmentController.class);

    private final EnrollmentService enrollmentService;
    private final UserRepository userRepository;

    public EnrollmentController(EnrollmentService enrollmentService, UserRepository userRepository) {
        this.enrollmentService = enrollmentService;
        this.userRepository = userRepository;
    }

    @GetMapping("/count")
    @PreAuthorize("hasAuthority('MANAGE_ENROLLMENTS')")
    public ResponseEntity<?> getUniqueEnrolledUsersCount() {
        long count = enrollmentService.countUniqueEnrolledUsers();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PostMapping("/courses/{courseId}")
    @PreAuthorize("hasAuthority('ENROLL_COURSES')")
    public ResponseEntity<?> enrollUser(@PathVariable Long courseId, Authentication authentication) {
        logger.info("Enrolling user in courseId={}", courseId);
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
            Enrollment enrollment = enrollmentService.enrollUser(user.getUserId(), courseId);
            return ResponseEntity.status(HttpStatus.CREATED).body(EnrollmentMapper.toDto(enrollment));
        } catch (IllegalArgumentException | IllegalStateException e) {
            logger.error("Failed to enroll user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/user")
    @PreAuthorize("hasAuthority('VIEW_COURSES')")
    public ResponseEntity<?> getEnrollmentsByUser(Authentication authentication) {
        logger.info("Retrieving enrollments for user");
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
            List<EnrollmentDTO> enrollments = enrollmentService.getEnrollmentsByUser(user.getUserId()).stream()
                    .map(EnrollmentMapper::toDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(enrollments);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to retrieve enrollments: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}