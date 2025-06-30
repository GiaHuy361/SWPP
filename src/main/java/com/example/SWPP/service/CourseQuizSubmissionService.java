package com.example.SWPP.service;

import com.example.SWPP.entity.CourseQuiz;
import com.example.SWPP.entity.CourseQuizAnswer;
import com.example.SWPP.entity.CourseQuizSubmission;
import com.example.SWPP.entity.CourseQuizSubmissionAnswer;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.CourseQuizAnswerRepository;
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
    private final CourseQuizAnswerRepository answerRepository;

    public CourseQuizSubmissionService(CourseQuizSubmissionRepository submissionRepository,
                                       CourseQuizRepository quizRepository,
                                       UserRepository userRepository,
                                       CourseQuizAnswerRepository answerRepository) {
        this.submissionRepository = submissionRepository;
        this.quizRepository = quizRepository;
        this.userRepository = userRepository;
        this.answerRepository = answerRepository;
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

        List<CourseQuizSubmissionAnswer> answers = submission.getAnswers();
        if (answers == null || answers.isEmpty()) {
            throw new IllegalArgumentException("No answers provided in the submission");
        }

        int totalQuestions = answers.size();
        int correctAnswers = 0;

        for (CourseQuizSubmissionAnswer answer : answers) {
            if (answer.getSelectedAnswer() == null || answer.getSelectedAnswer().getId() == null) {
                throw new IllegalArgumentException("Selected answer is missing or invalid");
            }

            // Load lại selectedAnswer từ DB để đảm bảo có isCorrect
            CourseQuizAnswer selectedAnswer = answerRepository.findById(answer.getSelectedAnswer().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Answer not found: " + answer.getSelectedAnswer().getId()));
            answer.setSelectedAnswer(selectedAnswer);

            // Gắn mối quan hệ submission → answer
            answer.setSubmission(submission);

            if (Boolean.TRUE.equals(selectedAnswer.getIsCorrect())) {
                correctAnswers++;
            }
        }

        double percentage = (double) correctAnswers / totalQuestions * 100;
        submission.setPercentageScore((int) percentage);

        int passingPercentage = quiz.getPassingPercentage();
        submission.setPassed(percentage >= passingPercentage);

        return submissionRepository.save(submission);
    }

    public List<CourseQuizSubmission> getSubmissionsByUserAndQuiz(Long userId, Long quizId) {
        logger.info("Retrieving submissions for userId={} and quizId={}", userId, quizId);
        return submissionRepository.findByUser_UserIdAndQuizId(userId, quizId);
    }
}