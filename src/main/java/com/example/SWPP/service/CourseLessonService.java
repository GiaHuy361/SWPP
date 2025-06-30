package com.example.SWPP.service;

import com.example.SWPP.entity.CourseLesson;
import com.example.SWPP.entity.CourseModule;
import com.example.SWPP.repository.CourseLessonRepository;
import com.example.SWPP.repository.CourseModuleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseLessonService {
    private static final Logger logger = LoggerFactory.getLogger(CourseLessonService.class);

    private final CourseLessonRepository lessonRepository;
    private final CourseModuleRepository moduleRepository;

    public CourseLessonService(CourseLessonRepository lessonRepository, CourseModuleRepository moduleRepository) {
        this.lessonRepository = lessonRepository;
        this.moduleRepository = moduleRepository;
    }

    public List<CourseLesson> getLessonsByModuleId(Long moduleId) {
        logger.info("Retrieving lessons for moduleId={}", moduleId);
        moduleRepository.findById(moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Module not found: " + moduleId));
        return lessonRepository.findByModuleId(moduleId);
    }

    @Transactional
    public CourseLesson createLesson(Long moduleId, CourseLesson lesson) {
        logger.info("Creating lesson for moduleId={}", moduleId);
        CourseModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Module not found: " + moduleId));
        lesson.setModule(module);
        return lessonRepository.save(lesson);
    }

    @Transactional
    public CourseLesson updateLesson(Long id, CourseLesson updatedLesson) {
        logger.info("Updating lesson with id={}", id);
        CourseLesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found: " + id));
        lesson.setTitle(updatedLesson.getTitle());
        lesson.setContent(updatedLesson.getContent());
        lesson.setVideoUrl(updatedLesson.getVideoUrl());
        lesson.setPosition(updatedLesson.getPosition());
        return lessonRepository.save(lesson);
    }

    @Transactional
    public void deleteLesson(Long id) {
        logger.info("Deleting lesson with id={}", id);
        CourseLesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found: " + id));
        lessonRepository.delete(lesson);
    }
    public long countLessons() {
        return lessonRepository.count();
    }
}