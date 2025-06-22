package com.example.SWPP.service;

import com.example.SWPP.entity.*;
import com.example.SWPP.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {
    private static final Logger logger = LoggerFactory.getLogger(CourseService.class);

    private final CourseRepository courseRepository;
    private final SurveyResponseRepository surveyResponseRepository;
    private final UserRepository userRepository;

    public CourseService(CourseRepository courseRepository, SurveyResponseRepository surveyResponseRepository,
                         UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.surveyResponseRepository = surveyResponseRepository;
        this.userRepository = userRepository;
    }

    public List<Course> getAllCourses() {
        logger.info("Retrieving all courses");
        return courseRepository.findAll();
    }

    public Course getCourseById(Long id) {
        logger.info("Retrieving course with id={}", id);
        return courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + id));
    }

    @Transactional
    public Course createCourse(Course course) {
        logger.info("Creating new course: {}", course.getTitle());
        return courseRepository.save(course);
    }

    @Transactional
    public Course updateCourse(Long id, Course updatedCourse) {
        logger.info("Updating course with id={}", id);
        Course course = getCourseById(id);
        course.setTitle(updatedCourse.getTitle());
        course.setLevel(updatedCourse.getLevel());
        course.setDescription(updatedCourse.getDescription());
        course.setRecommendedMinScore(updatedCourse.getRecommendedMinScore());
        course.setRecommendedMaxScore(updatedCourse.getRecommendedMaxScore());
        course.setAgeGroup(updatedCourse.getAgeGroup());
        return courseRepository.save(course);
    }

    @Transactional
    public void deleteCourse(Long id) {
        logger.info("Deleting course with id={}", id);
        Course course = getCourseById(id);
        courseRepository.delete(course);
    }

    public List<Course> suggestCourses(Long userId, Long surveyResponseId) {
        logger.info("Suggesting courses for userId={} with surveyResponseId={}", userId, surveyResponseId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        SurveyResponse response = surveyResponseRepository.findById(surveyResponseId)
                .orElseThrow(() -> new IllegalArgumentException("Survey response not found: " + surveyResponseId));
        if (!response.getUser().getUserId().equals(userId)) {
            throw new IllegalArgumentException("Survey response does not belong to the user");
        }
        int totalScore = response.getTotalScore();
        String userAgeGroup = calculateAgeGroup(user.getProfile() != null ? user.getProfile().getDateOfBirth() : null);
        return courseRepository.findAll().stream()
                .filter(course -> totalScore >= course.getRecommendedMinScore()
                        && totalScore <= course.getRecommendedMaxScore()
                        && course.getAgeGroup().equals(userAgeGroup))
                .collect(Collectors.toList());
    }

    private String calculateAgeGroup(LocalDate dateOfBirth) {
        if (dateOfBirth == null) {
            return "Unknown";
        }
        LocalDate today = LocalDate.now();
        int age = Period.between(dateOfBirth, today).getYears();
        if (age >= 12 && age <= 15) {
            return "12-15";
        } else if (age >= 16 && age <= 18) {
            return "16-18";
        } else {
            return "Other";
        }
    }
}