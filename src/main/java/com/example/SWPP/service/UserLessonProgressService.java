package com.example.SWPP.service;

import com.example.SWPP.entity.Course;
import com.example.SWPP.entity.CourseLesson;
import com.example.SWPP.entity.Enrollment;
import com.example.SWPP.entity.User;
import com.example.SWPP.entity.UserLessonProgress;
import com.example.SWPP.repository.CourseLessonRepository;
import com.example.SWPP.repository.CourseRepository;
import com.example.SWPP.repository.EnrollmentRepository;
import com.example.SWPP.repository.UserLessonProgressRepository;
import com.example.SWPP.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserLessonProgressService {
    private static final Logger logger = LoggerFactory.getLogger(UserLessonProgressService.class);

    private final UserLessonProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final CourseLessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;

    public UserLessonProgressService(UserLessonProgressRepository progressRepository,
                                     UserRepository userRepository,
                                     CourseRepository courseRepository,
                                     CourseLessonRepository lessonRepository,
                                     EnrollmentRepository enrollmentRepository) {
        this.progressRepository = progressRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Transactional
    public UserLessonProgress completeLesson(Long userId, Long lessonId) {
        logger.info("Completing lessonId={} for userId={}", lessonId, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        CourseLesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found: " + lessonId));
        Course course = courseRepository.findById(lesson.getModule().getCourse().getId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found for lesson: " + lessonId));
        Enrollment enrollment = enrollmentRepository.findByUserAndCourse(user, course)
                .orElseThrow(() -> new IllegalStateException("User not enrolled in course: " + course.getId()));

        UserLessonProgress progress = progressRepository.findById(userId + lessonId)
                .orElse(new UserLessonProgress());
        progress.setUser(user);
        progress.setLesson(lesson);
        progress.setCompletedAt(LocalDateTime.now());
        progress.setCompletedFlag(true);

        return progressRepository.save(progress);
    }

    public List<UserLessonProgress> getProgressForCourse(Long userId, Long courseId) {
        logger.info("Retrieving progress for userId={} and courseId={}", userId, courseId);
        return progressRepository.findByUser_UserIdAndCourseId(userId, courseId);
    }
}