package com.example.SWPP.controller;

import com.example.SWPP.dto.CourseLessonDTO;
import com.example.SWPP.entity.CourseLesson;
import com.example.SWPP.mapper.CourseLessonMapper;
import com.example.SWPP.service.CourseLessonService;
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
@RequestMapping("/api/modules/{moduleId}/lessons")
public class CourseLessonController {
    private static final Logger logger = LoggerFactory.getLogger(CourseLessonController.class);

    private final CourseLessonService lessonService;

    public CourseLessonController(CourseLessonService lessonService) {
        this.lessonService = lessonService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_COURSES')")
    public ResponseEntity<?> getLessonsByModuleId(@PathVariable("moduleId") Long moduleId) {
        logger.info("Fetching lessons for moduleId={}", moduleId);
        try {
            List<CourseLessonDTO> lessons = lessonService.getLessonsByModuleId(moduleId).stream()
                    .map(CourseLessonMapper::toDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(lessons);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to fetch lessons: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }
    @GetMapping("/lessons/count")
    public ResponseEntity<?> countLessons() {
        logger.info("Counting total lessons");
        long count = lessonService.countLessons();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_COURSES')")
    public ResponseEntity<?> createLesson(@PathVariable("moduleId") Long moduleId, @Valid @RequestBody CourseLessonDTO lessonDTO) {
        logger.info("Creating new lesson for moduleId={}", moduleId);
        try {
            CourseLesson lesson = CourseLessonMapper.toEntity(lessonDTO);
            CourseLesson savedLesson = lessonService.createLesson(moduleId, lesson);
            return ResponseEntity.status(HttpStatus.CREATED).body(CourseLessonMapper.toDto(savedLesson));
        } catch (IllegalArgumentException e) {
            logger.error("Failed to create lesson: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_COURSES')")
    public ResponseEntity<?> updateLesson(@PathVariable("moduleId") Long moduleId, @PathVariable("id") Long id, @Valid @RequestBody CourseLessonDTO lessonDTO) {
        logger.info("Updating lesson with id={} for moduleId={}", id, moduleId);
        try {
            CourseLesson updatedLesson = CourseLessonMapper.toEntity(lessonDTO);
            CourseLesson lesson = lessonService.updateLesson(id, updatedLesson);
            return ResponseEntity.ok(CourseLessonMapper.toDto(lesson));
        } catch (IllegalArgumentException e) {
            logger.error("Failed to update lesson: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_COURSES')")
    public ResponseEntity<?> deleteLesson(@PathVariable("moduleId") Long moduleId, @PathVariable("id") Long id) {
        logger.info("Deleting lesson with id={} for moduleId={}", id, moduleId);
        try {
            lessonService.deleteLesson(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            logger.error("Failed to delete lesson: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}