package com.example.SWPP.controller;

import com.example.SWPP.dto.CourseQuizSubmissionDTO;
import com.example.SWPP.entity.CourseQuizSubmission;
import com.example.SWPP.entity.User;
import com.example.SWPP.mapper.CourseQuizSubmissionMapper;
import com.example.SWPP.repository.UserRepository;
import com.example.SWPP.service.CourseQuizSubmissionService;
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
@RequestMapping("/api/quizzes/{quizId}/submissions")
public class CourseQuizSubmissionController {
    private static final Logger logger = LoggerFactory.getLogger(CourseQuizSubmissionController.class);

    private final CourseQuizSubmissionService submissionService;
    private final UserRepository userRepository;

    public CourseQuizSubmissionController(CourseQuizSubmissionService submissionService, UserRepository userRepository) {
        this.submissionService = submissionService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SUBMIT_QUIZ')")
    public ResponseEntity<?> submitQuiz(@PathVariable Long quizId, @Valid @RequestBody CourseQuizSubmissionDTO submissionDTO, Authentication authentication) {
        logger.info("Submitting quizId={} for user", quizId);
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
            CourseQuizSubmission submission = CourseQuizSubmissionMapper.toEntity(submissionDTO);
            CourseQuizSubmission savedSubmission = submissionService.submitQuiz(user.getUserId(), quizId, submission);
            return ResponseEntity.status(HttpStatus.CREATED).body(CourseQuizSubmissionMapper.toDto(savedSubmission));
        } catch (IllegalArgumentException e) {
            logger.error("Failed to submit quiz: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_PROGRESS')")
    public ResponseEntity<?> getSubmissionsByUserAndQuiz(@PathVariable Long quizId, Authentication authentication) {
        logger.info("Retrieving submissions for quizId={}", quizId);
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
            List<CourseQuizSubmissionDTO> submissions = submissionService.getSubmissionsByUserAndQuiz(user.getUserId(), quizId).stream()
                    .map(CourseQuizSubmissionMapper::toDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(submissions);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to retrieve submissions: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}