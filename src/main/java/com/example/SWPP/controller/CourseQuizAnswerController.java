package com.example.SWPP.controller;

import com.example.SWPP.dto.CourseQuizAnswerDTO;
import com.example.SWPP.entity.CourseQuizAnswer;
import com.example.SWPP.mapper.CourseQuizAnswerMapper;
import com.example.SWPP.service.CourseQuizAnswerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/questions/{questionId}/answers")
public class CourseQuizAnswerController {
    private static final Logger logger = LoggerFactory.getLogger(CourseQuizAnswerController.class);

    private final CourseQuizAnswerService answerService;

    public CourseQuizAnswerController(CourseQuizAnswerService answerService) {
        this.answerService = answerService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_COURSES')")
    public ResponseEntity<?> getAnswersByQuestionId(@PathVariable("questionId") Long questionId) {
        logger.info("Fetching answers for questionId={}", questionId);
        try {
            List<CourseQuizAnswerDTO> answers = answerService.getAnswersByQuestionId(questionId).stream()
                    .map(CourseQuizAnswerMapper::toDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(answers);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to fetch answers: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_COURSES')")
    public ResponseEntity<?> createAnswer(@PathVariable("questionId") Long questionId, @Valid @RequestBody CourseQuizAnswerDTO answerDTO) {
        logger.info("Creating new answer for questionId={}", questionId);
        try {
            CourseQuizAnswer answer = CourseQuizAnswerMapper.toEntity(answerDTO);
            CourseQuizAnswer savedAnswer = answerService.createAnswer(questionId, answer);
            return ResponseEntity.status(HttpStatus.CREATED).body(CourseQuizAnswerMapper.toDto(savedAnswer));
        } catch (IllegalArgumentException e) {
            logger.error("Failed to create answer: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_COURSES')")
    public ResponseEntity<?> updateAnswer(@PathVariable("questionId") Long questionId, @PathVariable("id") Long id, @Valid @RequestBody CourseQuizAnswerDTO answerDTO) {
        logger.info("Updating answer with id={} for questionId={}", id, questionId);
        try {
            CourseQuizAnswer updatedAnswer = CourseQuizAnswerMapper.toEntity(answerDTO);
            CourseQuizAnswer answer = answerService.updateAnswer(id, updatedAnswer);
            return ResponseEntity.ok(CourseQuizAnswerMapper.toDto(answer));
        } catch (IllegalArgumentException e) {
            logger.error("Failed to update answer: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_COURSES')")
    public ResponseEntity<?> deleteAnswer(@PathVariable("questionId") Long questionId, @PathVariable("id") Long id) {
        logger.info("Deleting answer with id={} for questionId={}", id, questionId);
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