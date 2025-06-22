package com.example.SWPP.controller;

import com.example.SWPP.dto.CourseQuizSubmissionAnswerDTO;
import com.example.SWPP.entity.CourseQuizSubmissionAnswer;
import com.example.SWPP.mapper.CourseQuizSubmissionAnswerMapper;
import com.example.SWPP.service.CourseQuizSubmissionAnswerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions/{submissionId}/questions/{questionId}/answers/{answerId}")
public class CourseQuizSubmissionAnswerController {
    private static final Logger logger = LoggerFactory.getLogger(CourseQuizSubmissionAnswerController.class);

    private final CourseQuizSubmissionAnswerService answerService;

    public CourseQuizSubmissionAnswerController(CourseQuizSubmissionAnswerService answerService) {
        this.answerService = answerService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SUBMIT_QUIZ')")
    public ResponseEntity<?> saveAnswer(@PathVariable Long submissionId, @PathVariable Long questionId, @PathVariable Long answerId, @Valid @RequestBody CourseQuizSubmissionAnswerDTO answerDTO) {
        logger.info("Saving answer for submissionId={}, questionId={}, answerId={}", submissionId, questionId, answerId);
        try {
            CourseQuizSubmissionAnswer answer = CourseQuizSubmissionAnswerMapper.toEntity(answerDTO);
            CourseQuizSubmissionAnswer savedAnswer = answerService.saveAnswer(submissionId, questionId, answerId, answer);
            return ResponseEntity.status(HttpStatus.CREATED).body(CourseQuizSubmissionAnswerMapper.toDto(savedAnswer));
        } catch (IllegalArgumentException e) {
            logger.error("Failed to save answer: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_COURSES')")
    public ResponseEntity<?> deleteAnswer(@PathVariable Long submissionId, @PathVariable Long questionId, @PathVariable Long id) {
        logger.info("Deleting submission answer with id={} for submissionId={}, questionId={}", id, submissionId, questionId);
        try {
            answerService.deleteAnswer(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            logger.error("Failed to delete answer: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}