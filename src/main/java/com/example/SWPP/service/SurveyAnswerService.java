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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Arrays;

@Service
public class SurveyAnswerService {

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
                    Long[] optionIds = objectMapper.readValue(answer.getOptionIds(), Long[].class);
                    score = Arrays.stream(optionIds)
                            .map(id -> surveyOptionRepository.findById(id)
                                    .orElseThrow(() -> new RuntimeException("Lựa chọn không tồn tại")))
                            .mapToInt(SurveyOption::getScore)
                            .sum();
                } catch (Exception e) {
                    throw new RuntimeException("Lỗi phân tích optionIds: " + e.getMessage());
                }
            }
        } else {
            score = answer.getScore();
        }

        answer.setScore(score);
        Integer currentScore = response.getTotalScore() != null ? response.getTotalScore() : 0;
        response.setTotalScore(currentScore + score);
        surveyResponseRepository.save(response);
        return surveyAnswerRepository.save(answer);
    }

    public List<SurveyAnswer> getAllSurveyAnswers() {
        return surveyAnswerRepository.findAll();
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
                    Long[] optionIds = objectMapper.readValue(answer.getOptionIds(), Long[].class);
                    newScore = Arrays.stream(optionIds)
                            .map(optId -> surveyOptionRepository.findById(optId)
                                    .orElseThrow(() -> new RuntimeException("Lựa chọn không tồn tại")))
                            .mapToInt(SurveyOption::getScore)
                            .sum();
                    existingAnswer.setOptionIds(answer.getOptionIds());
                } catch (Exception e) {
                    throw new RuntimeException("Lỗi phân tích optionIds: " + e.getMessage());
                }
            }
        } else {
            existingAnswer.setOption(answer.getOption());
            newScore = answer.getScore();
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