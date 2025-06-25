package com.example.SWPP.service;

import com.example.SWPP.entity.*;
import com.example.SWPP.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
        validateCourseScores(course);
        return courseRepository.save(course);
    }

    @Transactional
    public Course updateCourse(Long id, Course updatedCourse) {
        logger.info("Updating course with id={}", id);
        Course course = getCourseById(id);
        validateCourseScores(updatedCourse);
        course.setTitle(updatedCourse.getTitle());
        course.setLevel(updatedCourse.getLevel());
        course.setDescription(updatedCourse.getDescription());
        course.setRecommendedMinScore(updatedCourse.getRecommendedMinScore());
        course.setRecommendedMaxScore(updatedCourse.getRecommendedMaxScore());
        course.setAgeGroup(updatedCourse.getAgeGroup());
        return courseRepository.save(course);
    }

    private void validateCourseScores(Course course) {
        if (course.getRecommendedMaxScore() < course.getRecommendedMinScore()) {
            logger.error("Invalid course scores: recommendedMaxScore={} is less than recommendedMinScore={}",
                    course.getRecommendedMaxScore(), course.getRecommendedMinScore());
            throw new IllegalArgumentException("recommendedMaxScore must be greater than or equal to recommendedMinScore");
        }
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
        String riskLevel = response.getRiskLevel();
        String courseLevel = mapRiskLevelToCourseLevel(riskLevel);

        logger.debug("UserId: {}, TotalScore: {}, RiskLevel: {}, CourseLevel: {}",
                userId, totalScore, riskLevel, courseLevel);

        List<Course> courses = courseRepository.findByRecommendedMinScoreLessThanEqualAndRecommendedMaxScoreGreaterThanEqualAndLevel(
                totalScore, totalScore, courseLevel);

        if (courses.isEmpty()) {
            logger.warn("No courses found for score={}, level={}", totalScore, courseLevel);
        } else {
            logger.info("Found {} courses for score={}, level={}", courses.size(), totalScore, courseLevel);
        }

        return courses;
    }

    private String mapRiskLevelToCourseLevel(String riskLevel) {
        if (riskLevel == null) {
            logger.warn("RiskLevel is null, defaulting to Beginner");
            return "Beginner";
        }
        switch (riskLevel) {
            case "Low Risk":
                return "Beginner";
            case "Moderate Risk":
                return "Intermediate";
            case "High Risk":
                return "Advanced";
            default:
                logger.warn("Unknown riskLevel: {}, defaulting to Beginner", riskLevel);
                return "Beginner";
        }
    }
}