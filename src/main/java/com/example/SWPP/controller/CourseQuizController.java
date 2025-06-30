package com.example.SWPP.controller;

import com.example.SWPP.dto.CourseQuizDTO;
import com.example.SWPP.entity.CourseQuiz;
import com.example.SWPP.mapper.CourseQuizMapper;
import com.example.SWPP.service.CourseQuizService;
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
@RequestMapping("/api/courses/{courseId}/quizzes")
public class CourseQuizController {
    private static final Logger logger = LoggerFactory.getLogger(CourseQuizController.class);

    private final CourseQuizService quizService;

    public CourseQuizController(CourseQuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_COURSES')")
    public ResponseEntity<?> getQuizzesByCourseId(@PathVariable("courseId") Long courseId) {
        logger.info("Fetching quizzes for courseId={}", courseId);
        try {
            List<CourseQuizDTO> quizzes = quizService.getQuizzesByCourseId(courseId).stream()
                    .map(CourseQuizMapper::toDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(quizzes);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to fetch quizzes: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }
    @GetMapping("/quizzes/count")
    public ResponseEntity<?> countAllQuizzes() {
        long count = quizService.countAllQuizzes();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_COURSES')")
    public ResponseEntity<?> createQuiz(@PathVariable("courseId") Long courseId, @Valid @RequestBody CourseQuizDTO quizDTO) {
        logger.info("Creating new quiz for courseId={}", courseId);
        try {
            CourseQuiz quiz = CourseQuizMapper.toEntity(quizDTO);
            CourseQuiz savedQuiz = quizService.createQuiz(courseId, quiz);
            return ResponseEntity.status(HttpStatus.CREATED).body(CourseQuizMapper.toDto(savedQuiz));
        } catch (IllegalArgumentException e) {
            logger.error("Failed to create quiz: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_COURSES')")
    public ResponseEntity<?> updateQuiz(@PathVariable("courseId") Long courseId, @PathVariable("id") Long id, @Valid @RequestBody CourseQuizDTO quizDTO) {
        logger.info("Updating quiz with id={} for courseId={}", id, courseId);
        try {
            CourseQuiz updatedQuiz = CourseQuizMapper.toEntity(quizDTO);
            CourseQuiz quiz = quizService.updateQuiz(id, updatedQuiz);
            return ResponseEntity.ok(CourseQuizMapper.toDto(quiz));
        } catch (IllegalArgumentException e) {
            logger.error("Failed to update quiz: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_COURSES')")
    public ResponseEntity<?> deleteQuiz(@PathVariable("courseId") Long courseId, @PathVariable("id") Long id) {
        logger.info("Deleting quiz with id={} for courseId={}", id, courseId);
        try {
            quizService.deleteQuiz(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            logger.error("Failed to delete quiz: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
