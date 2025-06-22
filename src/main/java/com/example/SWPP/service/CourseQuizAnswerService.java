package com.example.SWPP.service;

import com.example.SWPP.entity.CourseQuizAnswer;
import com.example.SWPP.entity.CourseQuizQuestion;
import com.example.SWPP.repository.CourseQuizAnswerRepository;
import com.example.SWPP.repository.CourseQuizQuestionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseQuizAnswerService {
    private static final Logger logger = LoggerFactory.getLogger(CourseQuizAnswerService.class);

    private final CourseQuizAnswerRepository answerRepository;
    private final CourseQuizQuestionRepository questionRepository;

    public CourseQuizAnswerService(CourseQuizAnswerRepository answerRepository, CourseQuizQuestionRepository questionRepository) {
        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
    }

    public List<CourseQuizAnswer> getAnswersByQuestionId(Long questionId) {
        logger.info("Retrieving answers for questionId={}", questionId);
        questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + questionId));
        return answerRepository.findByQuestionId(questionId);
    }

    @Transactional
    public CourseQuizAnswer createAnswer(Long questionId, CourseQuizAnswer answer) {
        logger.info("Creating answer for questionId={}", questionId);
        CourseQuizQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + questionId));
        answer.setQuestion(question);
        return answerRepository.save(answer);
    }

    @Transactional
    public CourseQuizAnswer updateAnswer(Long id, CourseQuizAnswer updatedAnswer) {
        logger.info("Updating answer with id={}", id);
        CourseQuizAnswer answer = answerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Answer not found: " + id));
        answer.setAnswerText(updatedAnswer.getAnswerText());
        answer.setIsCorrect(updatedAnswer.getIsCorrect());
        return answerRepository.save(answer);
    }

    @Transactional
    public void deleteAnswer(Long id) {
        logger.info("Deleting answer with id={}", id);
        CourseQuizAnswer answer = answerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Answer not found: " + id));
        answerRepository.delete(answer);
    }
}