package com.example.SWPP.controller;

import com.example.SWPP.dto.CourseModuleDTO;
import com.example.SWPP.entity.CourseModule;
import com.example.SWPP.mapper.CourseModuleMapper;
import com.example.SWPP.service.CourseModuleService;
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
@RequestMapping("/api/courses/{courseId}/modules")
public class CourseModuleController {
    private static final Logger logger = LoggerFactory.getLogger(CourseModuleController.class);

    private final CourseModuleService moduleService;

    public CourseModuleController(CourseModuleService moduleService) {
        this.moduleService = moduleService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_COURSES')")
    public ResponseEntity<?> getModulesByCourseId(@PathVariable("courseId") Long courseId) {
        logger.info("Fetching modules for courseId={}", courseId);
        try {
            List<CourseModuleDTO> modules = moduleService.getModulesByCourseId(courseId).stream()
                    .map(CourseModuleMapper::toDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(modules);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to fetch modules: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_COURSES')")
    public ResponseEntity<?> createModule(@PathVariable("courseId") Long courseId, @Valid @RequestBody CourseModuleDTO moduleDTO) {
        logger.info("Creating new module for courseId={}", courseId);
        try {
            CourseModule module = CourseModuleMapper.toEntity(moduleDTO);
            CourseModule savedModule = moduleService.createModule(courseId, module);
            return ResponseEntity.status(HttpStatus.CREATED).body(CourseModuleMapper.toDto(savedModule));
        } catch (IllegalArgumentException e) {
            logger.error("Failed to create module: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_COURSES')")
    public ResponseEntity<?> updateModule(@PathVariable("courseId") Long courseId, @PathVariable("id") Long id, @Valid @RequestBody CourseModuleDTO moduleDTO) {
        logger.info("Updating module with id={} for courseId={}", id, courseId);
        try {
            CourseModule updatedModule = CourseModuleMapper.toEntity(moduleDTO);
            CourseModule module = moduleService.updateModule(id, updatedModule);
            return ResponseEntity.ok(CourseModuleMapper.toDto(module));
        } catch (IllegalArgumentException e) {
            logger.error("Failed to update module: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_COURSES')")
    public ResponseEntity<?> deleteModule(@PathVariable("courseId") Long courseId, @PathVariable("id") Long id) {
        logger.info("Deleting module with id={} for courseId={}", id, courseId);
        try {
            moduleService.deleteModule(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            logger.error("Failed to delete module: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}