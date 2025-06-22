package com.example.SWPP.service;

import com.example.SWPP.entity.CourseQuiz;
import com.example.SWPP.entity.CourseQuizQuestion;
import com.example.SWPP.repository.CourseQuizQuestionRepository;
import com.example.SWPP.repository.CourseQuizRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseQuizQuestionService {
    private static final Logger logger = LoggerFactory.getLogger(CourseQuizQuestionService.class);

    private final CourseQuizQuestionRepository questionRepository;
    private final CourseQuizRepository quizRepository;

    public CourseQuizQuestionService(CourseQuizQuestionRepository questionRepository, CourseQuizRepository quizRepository) {
        this.questionRepository = questionRepository;
        this.quizRepository = quizRepository;
    }

    public List<CourseQuizQuestion> getQuestionsByQuizId(Long quizId) {
        logger.info("Retrieving questions for quizId={}", quizId);
        quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found: " + quizId));
        return questionRepository.findByQuizId(quizId);
    }

    @Transactional
    public CourseQuizQuestion createQuestion(Long quizId, CourseQuizQuestion question) {
        logger.info("Creating question for quizId={}", quizId);
        CourseQuiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found: " + quizId));
        question.setQuiz(quiz);
        return questionRepository.save(question);
    }

    @Transactional
    public CourseQuizQuestion updateQuestion(Long id, CourseQuizQuestion updatedQuestion) {
        logger.info("Updating question with id={}", id);
        CourseQuizQuestion question = questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + id));
        question.setQuestionText(updatedQuestion.getQuestionText());
        question.setExplanation(updatedQuestion.getExplanation());
        question.setPosition(updatedQuestion.getPosition());
        question.setQuestionType(updatedQuestion.getQuestionType());
        return questionRepository.save(question);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        logger.info("Deleting question with id={}", id);
        CourseQuizQuestion question = questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + id));
        questionRepository.delete(question);
    }
}
