package com.example.SWPP.service;

import com.example.SWPP.entity.Course;
import com.example.SWPP.entity.Enrollment;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.CourseRepository;
import com.example.SWPP.repository.EnrollmentRepository;
import com.example.SWPP.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EnrollmentService {
    private static final Logger logger = LoggerFactory.getLogger(EnrollmentService.class);

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository, UserRepository userRepository, CourseRepository courseRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    @Transactional
    public Enrollment enrollUser(Long userId, Long courseId) {
        logger.info("Enrolling userId={} in courseId={}", userId, courseId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + courseId));
        Optional<Enrollment> existingEnrollment = enrollmentRepository.findByUserAndCourse(user, course);
        if (existingEnrollment.isPresent()) {
            throw new IllegalStateException("User is already enrolled in this course");
        }
        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setCourse(course);
        enrollment.setEnrolledAt(LocalDateTime.now());
        return enrollmentRepository.save(enrollment);
    }

    public List<Enrollment> getEnrollmentsByUser(Long userId) {
        logger.info("Retrieving enrollments for userId={}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        return enrollmentRepository.findAll().stream()
                .filter(enrollment -> enrollment.getUser().getUserId().equals(userId))
                .toList();
    }
}