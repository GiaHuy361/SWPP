package com.example.SWPP.service;

import com.example.SWPP.entity.Course;
import com.example.SWPP.entity.CourseModule;
import com.example.SWPP.repository.CourseModuleRepository;
import com.example.SWPP.repository.CourseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseModuleService {
    private static final Logger logger = LoggerFactory.getLogger(CourseModuleService.class);

    private final CourseModuleRepository moduleRepository;
    private final CourseRepository courseRepository;

    public CourseModuleService(CourseModuleRepository moduleRepository, CourseRepository courseRepository) {
        this.moduleRepository = moduleRepository;
        this.courseRepository = courseRepository;
    }

    public List<CourseModule> getModulesByCourseId(Long courseId) {
        logger.info("Retrieving modules for courseId={}", courseId);
        courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + courseId));
        return moduleRepository.findByCourseId(courseId);
    }

    @Transactional
    public CourseModule createModule(Long courseId, CourseModule module) {
        logger.info("Creating module for courseId={}", courseId);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + courseId));
        module.setCourse(course);
        return moduleRepository.save(module);
    }

    @Transactional
    public CourseModule updateModule(Long id, CourseModule updatedModule) {
        logger.info("Updating module with id={}", id);
        CourseModule module = moduleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Module not found: " + id));
        module.setTitle(updatedModule.getTitle());
        module.setDescription(updatedModule.getDescription());
        module.setPosition(updatedModule.getPosition());
        return moduleRepository.save(module);
    }

    @Transactional
    public void deleteModule(Long id) {
        logger.info("Deleting module with id={}", id);
        CourseModule module = moduleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Module not found: " + id));
        moduleRepository.delete(module);
    }
}