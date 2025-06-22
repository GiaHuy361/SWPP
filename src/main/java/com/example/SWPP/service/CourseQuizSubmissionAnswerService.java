package com.example.SWPP.service;

import com.example.SWPP.entity.CourseQuizAnswer;
import com.example.SWPP.entity.CourseQuizQuestion;
import com.example.SWPP.entity.CourseQuizSubmission;
import com.example.SWPP.entity.CourseQuizSubmissionAnswer;
import com.example.SWPP.repository.CourseQuizAnswerRepository;
import com.example.SWPP.repository.CourseQuizQuestionRepository;
import com.example.SWPP.repository.CourseQuizSubmissionAnswerRepository;
import com.example.SWPP.repository.CourseQuizSubmissionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CourseQuizSubmissionAnswerService {
    private static final Logger logger = LoggerFactory.getLogger(CourseQuizSubmissionAnswerService.class);

    private final CourseQuizSubmissionAnswerRepository submissionAnswerRepository;
    private final CourseQuizSubmissionRepository submissionRepository;
    private final CourseQuizQuestionRepository questionRepository;
    private final CourseQuizAnswerRepository answerRepository;

    public CourseQuizSubmissionAnswerService(CourseQuizSubmissionAnswerRepository submissionAnswerRepository,
                                             CourseQuizSubmissionRepository submissionRepository,
                                             CourseQuizQuestionRepository questionRepository,
                                             CourseQuizAnswerRepository answerRepository) {
        this.submissionAnswerRepository = submissionAnswerRepository;
        this.submissionRepository = submissionRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
    }

    @Transactional
    public CourseQuizSubmissionAnswer saveAnswer(Long submissionId, Long questionId, Long answerId, CourseQuizSubmissionAnswer submissionAnswer) {
        logger.info("Saving answer for submissionId={}, questionId={}, answerId={}", submissionId, questionId, answerId);
        CourseQuizSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found: " + submissionId));
        CourseQuizQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + questionId));
        CourseQuizAnswer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new IllegalArgumentException("Answer not found: " + answerId));
        submissionAnswer.setSubmission(submission);
        submissionAnswer.setQuestion(question);
        submissionAnswer.setSelectedAnswer(answer);
        return submissionAnswerRepository.save(submissionAnswer);
    }

    @Transactional
    public void deleteAnswer(Long id) {
        logger.info("Deleting submission answer with id={}", id);
        CourseQuizSubmissionAnswer submissionAnswer = submissionAnswerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Submission answer not found: " + id));
        submissionAnswerRepository.delete(submissionAnswer);
    }
}