package com.example.SWPP.service;

import com.example.SWPP.entity.SurveyAnswer;
import com.example.SWPP.entity.SurveyOption;
import com.example.SWPP.entity.SurveyQuestion;
import com.example.SWPP.entity.SurveyResponse;
import com.example.SWPP.repository.SurveyAnswerRepository;
import com.example.SWPP.repository.SurveyOptionRepository;
import com.example.SWPP.repository.SurveyQuestionRepository;
import com.example.SWPP.repository.SurveyResponseRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Arrays;

@Service
public class SurveyAnswerService {

    private static final Logger logger = LoggerFactory.getLogger(SurveyAnswerService.class);

    private final SurveyAnswerRepository surveyAnswerRepository;
    private final SurveyQuestionRepository surveyQuestionRepository;
    private final SurveyResponseRepository surveyResponseRepository;
    private final SurveyOptionRepository surveyOptionRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public SurveyAnswerService(SurveyAnswerRepository surveyAnswerRepository,
                               SurveyQuestionRepository surveyQuestionRepository,
                               SurveyResponseRepository surveyResponseRepository,
                               SurveyOptionRepository surveyOptionRepository) {
        this.surveyAnswerRepository = surveyAnswerRepository;
        this.surveyQuestionRepository = surveyQuestionRepository;
        this.surveyResponseRepository = surveyResponseRepository;
        this.surveyOptionRepository = surveyOptionRepository;
        this.objectMapper = new ObjectMapper();
    }

    public SurveyAnswer createSurveyAnswer(SurveyAnswer answer) {
        SurveyQuestion question = surveyQuestionRepository.findById(answer.getQuestion().getId())
                .orElseThrow(() -> new RuntimeException("Câu hỏi không tồn tại"));
        SurveyResponse response = surveyResponseRepository.findById(answer.getResponse().getId())
                .orElseThrow(() -> new RuntimeException("Phản hồi không tồn tại"));

        Integer score = 0;
        if (question.getQuestionType() == SurveyQuestion.QuestionType.CHECKBOX_MULTIPLE) {
            if (answer.getOptionIds() != null) {
                try {
                    Long[] optionIds = parseOptionIds(answer.getOptionIds());
                    score = Arrays.stream(optionIds)
                            .map(id -> surveyOptionRepository.findById(id)
                                    .orElseThrow(() -> new RuntimeException("Lựa chọn không tồn tại với ID: " + id)))
                            .mapToInt(SurveyOption::getScore)
                            .sum();
                    logger.debug("CHECKBOX_MULTIPLE: questionId={}, optionIds={}, score={}", question.getId(), Arrays.toString(optionIds), score);
                } catch (Exception e) {
                    logger.error("Error parsing optionIds for answerId={}: {}", answer.getId(), e.getMessage());
                    score = 0;
                }
            }
        } else if (question.getQuestionType() == SurveyQuestion.QuestionType.TEXT) {
            score = answer.getScore() != null ? answer.getScore() : 0;
            logger.debug("TEXT: questionId={}, score={}", question.getId(), score);
        } else {
            if (answer.getOption() != null && answer.getOption().getId() != null) {
                SurveyOption option = surveyOptionRepository.findById(answer.getOption().getId())
                        .orElseThrow(() -> new RuntimeException("Lựa chọn không tồn tại với ID: " + answer.getOption().getId()));
                score = option.getScore();
                logger.debug("TRUE_FALSE/MULTIPLE_CHOICE: questionId={}, optionId={}, optionText={}, score={}",
                        question.getId(), answer.getOption().getId(), option.getOptionText(), score);
            } else {
                logger.warn("No valid option for questionId={}", question.getId());
                throw new IllegalArgumentException("Option không được null cho câu hỏi " + question.getId());
            }
        }

        answer.setScore(score);
        Integer currentScore = response.getTotalScore() != null ? response.getTotalScore() : 0;
        response.setTotalScore(currentScore + score);
        surveyResponseRepository.save(response);
        return surveyAnswerRepository.save(answer);
    }

    private Long[] parseOptionIds(String optionIds) {
        try {
            if (optionIds.startsWith("[")) {
                return objectMapper.readValue(optionIds, Long[].class);
            } else {
                return Arrays.stream(optionIds.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(Long::valueOf)
                        .toArray(Long[]::new);
            }
        } catch (Exception e) {
            logger.error("Failed to parse optionIds: {}", e.getMessage());
            return new Long[0];
        }
    }

    public List<SurveyAnswer> getAllSurveyAnswers() {
        return surveyAnswerRepository.findAll();
    }

    public List<SurveyAnswer> getSurveyAnswersByResponseId(Long responseId) {
        return surveyAnswerRepository.findByResponseId(responseId);
    }

    public SurveyAnswer getSurveyAnswerById(Long id) {
        return surveyAnswerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Câu trả lời không tồn tại"));
    }

    public SurveyAnswer updateSurveyAnswer(Long id, SurveyAnswer answer) {
        SurveyAnswer existingAnswer = getSurveyAnswerById(id);
        SurveyResponse response = existingAnswer.getResponse();
        Integer currentScore = response.getTotalScore() != null ? response.getTotalScore() : 0;
        response.setTotalScore(currentScore - existingAnswer.getScore());

        SurveyQuestion question = surveyQuestionRepository.findById(answer.getQuestion().getId())
                .orElseThrow(() -> new RuntimeException("Câu hỏi không tồn tại"));
        Integer newScore = 0;
        if (question.getQuestionType() == SurveyQuestion.QuestionType.CHECKBOX_MULTIPLE) {
            if (answer.getOptionIds() != null) {
                try {
                    Long[] optionIds = parseOptionIds(answer.getOptionIds());
                    newScore = Arrays.stream(optionIds)
                            .map(optId -> surveyOptionRepository.findById(optId)
                                    .orElseThrow(() -> new RuntimeException("Lựa chọn không tồn tại")))
                            .mapToInt(SurveyOption::getScore)
                            .sum();
                    existingAnswer.setOptionIds(answer.getOptionIds());
                    logger.debug("CHECKBOX_MULTIPLE: questionId={}, optionIds={}, newScore={}", question.getId(), Arrays.toString(optionIds), newScore);
                } catch (Exception e) {
                    logger.error("Error parsing optionIds: {}", e.getMessage());
                    newScore = 0;
                }
            }
        } else if (question.getQuestionType() == SurveyQuestion.QuestionType.TEXT) {
            existingAnswer.setOptionIds(answer.getOptionIds());
            newScore = answer.getScore() != null ? answer.getScore() : 0;
            logger.debug("TEXT: questionId={}, newScore={}", question.getId(), newScore);
        } else {
            if (answer.getOption() != null && answer.getOption().getId() != null) {
                SurveyOption option = surveyOptionRepository.findById(answer.getOption().getId())
                        .orElseThrow(() -> new RuntimeException("Lựa chọn không tồn tại với ID: " + answer.getOption().getId()));
                newScore = option.getScore();
                logger.debug("TRUE_FALSE/MULTIPLE_CHOICE: questionId={}, optionId={}, optionText={}, newScore={}",
                        question.getId(), answer.getOption().getId(), option.getOptionText(), newScore);
            } else {
                logger.warn("No valid option for questionId={}", question.getId());
                throw new IllegalArgumentException("Option không được null cho câu hỏi " + question.getId());
            }
        }

        existingAnswer.setScore(newScore);
        response.setTotalScore(response.getTotalScore() + newScore);
        surveyResponseRepository.save(response);
        return surveyAnswerRepository.save(existingAnswer);
    }

    public void deleteSurveyAnswer(Long id) {
        SurveyAnswer answer = getSurveyAnswerById(id);
        SurveyResponse response = answer.getResponse();
        Integer currentScore = response.getTotalScore() != null ? response.getTotalScore() : 0;
        response.setTotalScore(currentScore - answer.getScore());
        surveyResponseRepository.save(response);
        surveyAnswerRepository.deleteById(id);
    }
}