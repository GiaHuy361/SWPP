package com.example.SWPP.service;

import com.example.SWPP.entity.Course;
import com.example.SWPP.entity.CourseQuiz;
import com.example.SWPP.repository.CourseQuizRepository;
import com.example.SWPP.repository.CourseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseQuizService {
    private static final Logger logger = LoggerFactory.getLogger(CourseQuizService.class);

    private final CourseQuizRepository quizRepository;
    private final CourseRepository courseRepository;

    public CourseQuizService(CourseQuizRepository quizRepository, CourseRepository courseRepository) {
        this.quizRepository = quizRepository;
        this.courseRepository = courseRepository;
    }

    public List<CourseQuiz> getQuizzesByCourseId(Long courseId) {
        logger.info("Retrieving quizzes for courseId={}", courseId);
        courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + courseId));
        return quizRepository.findByCourseId(courseId);
    }

    @Transactional
    public CourseQuiz createQuiz(Long courseId, CourseQuiz quiz) {
        logger.info("Creating quiz for courseId={}", courseId);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found: " + courseId));
        quiz.setCourse(course);
        return quizRepository.save(quiz);
    }

    @Transactional
    public CourseQuiz updateQuiz(Long id, CourseQuiz updatedQuiz) {
        logger.info("Updating quiz with id={}", id);
        CourseQuiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found: " + id));
        quiz.setDurationMinutes(updatedQuiz.getDurationMinutes());
        quiz.setShuffleQuestions(updatedQuiz.getShuffleQuestions());
        quiz.setShuffleAnswers(updatedQuiz.getShuffleAnswers());
        quiz.setPassingPercentage(updatedQuiz.getPassingPercentage());
        return quizRepository.save(quiz);
    }

    @Transactional
    public void deleteQuiz(Long id) {
        logger.info("Deleting quiz with id={}", id);
        CourseQuiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found: " + id));
        quizRepository.delete(quiz);
    }
}