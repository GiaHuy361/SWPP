package com.example.SWPP.service;

import com.example.SWPP.entity.CourseQuiz;
import com.example.SWPP.entity.CourseQuizSubmission;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.CourseQuizRepository;
import com.example.SWPP.repository.CourseQuizSubmissionRepository;
import com.example.SWPP.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CourseQuizSubmissionService {
    private static final Logger logger = LoggerFactory.getLogger(CourseQuizSubmissionService.class);

    private final CourseQuizSubmissionRepository submissionRepository;
    private final CourseQuizRepository quizRepository;
    private final UserRepository userRepository;

    public CourseQuizSubmissionService(CourseQuizSubmissionRepository submissionRepository,
                                       CourseQuizRepository quizRepository,
                                       UserRepository userRepository) {
        this.submissionRepository = submissionRepository;
        this.quizRepository = quizRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CourseQuizSubmission submitQuiz(Long userId, Long quizId, CourseQuizSubmission submission) {
        logger.info("Submitting quizId={} for userId={}", quizId, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        CourseQuiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found: " + quizId));
        submission.setUser(user);
        submission.setQuiz(quiz);
        submission.setSubmittedAt(LocalDateTime.now());
        // Logic tính percentageScore, passed, durationTaken có thể được thêm tùy theo yêu cầu
        submission.setPercentageScore(0); // Placeholder, cần tính toán thực tế
        submission.setPassed(false);      // Placeholder, cần tính toán thực tế
        submission.setDurationTaken(0);   // Placeholder, cần tính toán thực tế
        return submissionRepository.save(submission);
    }

    public List<CourseQuizSubmission> getSubmissionsByUserAndQuiz(Long userId, Long quizId) {
        logger.info("Retrieving submissions for userId={} and quizId={}", userId, quizId);
        return submissionRepository.findByUser_UserIdAndQuizId(userId, quizId);
    }
}