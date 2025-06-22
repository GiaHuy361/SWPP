package com.example.SWPP.controller;

import com.example.SWPP.dto.CourseQuizQuestionDTO;
import com.example.SWPP.entity.CourseQuizQuestion;
import com.example.SWPP.mapper.CourseQuizQuestionMapper;
import com.example.SWPP.service.CourseQuizQuestionService;
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
@RequestMapping("/api/quizzes/{quizId}/questions")
public class CourseQuizQuestionController {
    private static final Logger logger = LoggerFactory.getLogger(CourseQuizQuestionController.class);

    private final CourseQuizQuestionService questionService;

    public CourseQuizQuestionController(CourseQuizQuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_COURSES')")
    public ResponseEntity<?> getQuestionsByQuizId(@PathVariable("quizId") Long quizId) {
        logger.info("Fetching questions for quizId={}", quizId);
        try {
            List<CourseQuizQuestionDTO> questions = questionService.getQuestionsByQuizId(quizId).stream()
                    .map(CourseQuizQuestionMapper::toDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(questions);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to fetch questions: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_COURSES')")
    public ResponseEntity<?> createQuestion(@PathVariable("quizId") Long quizId, @Valid @RequestBody CourseQuizQuestionDTO questionDTO) {
        logger.info("Creating new question for quizId={}", quizId);
        try {
            CourseQuizQuestion question = CourseQuizQuestionMapper.toEntity(questionDTO);
            CourseQuizQuestion savedQuestion = questionService.createQuestion(quizId, question);
            return ResponseEntity.status(HttpStatus.CREATED).body(CourseQuizQuestionMapper.toDto(savedQuestion));
        } catch (IllegalArgumentException e) {
            logger.error("Failed to create question: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_COURSES')")
    public ResponseEntity<?> updateQuestion(@PathVariable("quizId") Long quizId, @PathVariable("id") Long id, @Valid @RequestBody CourseQuizQuestionDTO questionDTO) {
        logger.info("Updating question with id={} for quizId={}", id, quizId);
        try {
            CourseQuizQuestion updatedQuestion = CourseQuizQuestionMapper.toEntity(questionDTO);
            CourseQuizQuestion question = questionService.updateQuestion(id, updatedQuestion);
            return ResponseEntity.ok(CourseQuizQuestionMapper.toDto(question));
        } catch (IllegalArgumentException e) {
            logger.error("Failed to update question: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_COURSES')")
    public ResponseEntity<?> deleteQuestion(@PathVariable("quizId") Long quizId, @PathVariable("id") Long id) {
        logger.info("Deleting question with id={} for quizId={}", id, quizId);
        try {
            questionService.deleteQuestion(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            logger.error("Failed to delete question: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}