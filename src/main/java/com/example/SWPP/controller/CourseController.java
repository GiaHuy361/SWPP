package com.example.SWPP.controller;

import com.example.SWPP.dto.CourseDTO;
import com.example.SWPP.entity.Course;
import com.example.SWPP.entity.User;
import com.example.SWPP.mapper.CourseMapper;
import com.example.SWPP.repository.UserRepository;
import com.example.SWPP.service.CourseService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
    private static final Logger logger = LoggerFactory.getLogger(CourseController.class);

    private final CourseService courseService;
    private final UserRepository userRepository;

    public CourseController(CourseService courseService, UserRepository userRepository) {
        this.courseService = courseService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_COURSES')")
    public ResponseEntity<?> getAllCourses() {
        logger.info("Fetching all courses");
        try {
            List<CourseDTO> courses = courseService.getAllCourses().stream()
                    .map(CourseMapper::toDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            logger.error("Failed to fetch courses: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch courses"));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_COURSES')")
    public ResponseEntity<?> getCourseById(@PathVariable Long id) {
        logger.info("Fetching course with id={}", id);
        try {
            Course course = courseService.getCourseById(id);
            return ResponseEntity.ok(CourseMapper.toDto(course));
        } catch (IllegalArgumentException e) {
            logger.error("Course not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Course not found"));
        }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_COURSES')")
    public ResponseEntity<?> createCourse(@Valid @RequestBody CourseDTO courseDTO) {
        logger.info("Creating new course: {}", courseDTO.getTitle());
        try {
            Course course = CourseMapper.toEntity(courseDTO);
            Course savedCourse = courseService.createCourse(course);
            return ResponseEntity.status(HttpStatus.CREATED).body(CourseMapper.toDto(savedCourse));
        } catch (Exception e) {
            logger.error("Failed to create course: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Failed to create course"));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_COURSES')")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseDTO courseDTO) {
        logger.info("Updating course with id={}", id);
        try {
            Course updatedCourse = CourseMapper.toEntity(courseDTO);
            Course course = courseService.updateCourse(id, updatedCourse);
            return ResponseEntity.ok(CourseMapper.toDto(course));
        } catch (IllegalArgumentException e) {
            logger.error("Course not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Course not found"));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_COURSES')")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        logger.info("Deleting course with id={}", id);
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            logger.error("Course not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Course not found"));
        }
    }

    @GetMapping("/recommendations")
    @PreAuthorize("hasAuthority('VIEW_COURSES')")
    public ResponseEntity<?> getRecommendedCourses(@RequestParam Long surveyResponseId, Authentication authentication) {
        logger.info("Fetching recommended courses for surveyResponseId={}", surveyResponseId);
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
            List<Course> recommendedCourses = courseService.suggestCourses(user.getUserId(), surveyResponseId);
            if (recommendedCourses.isEmpty()) {
                logger.warn("No recommended courses found for surveyResponseId={}", surveyResponseId);
                return ResponseEntity.ok(Map.of("message", "No suitable courses found", "courses", new ArrayList<>()));
            }
            List<CourseDTO> courses = recommendedCourses.stream()
                    .map(CourseMapper::toDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(courses);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to fetch recommended courses: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error fetching recommended courses: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred"));
        }
    }
}