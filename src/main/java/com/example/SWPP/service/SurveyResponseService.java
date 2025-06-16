package com.example.SWPP.service;

import com.example.SWPP.entity.*;
import com.example.SWPP.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Arrays;
import java.util.stream.Collectors;

@Service
public class SurveyResponseService {

    private final SurveyResponseRepository surveyResponseRepository;
    private final SurveyAnswerRepository surveyAnswerRepository;
    private final SurveyQuestionRepository surveyQuestionRepository;
    private final SurveyOptionRepository surveyOptionRepository;
    private final UserRepository userRepository;
    private final SurveyRepository surveyRepository; // Thêm dependency
    private final ObjectMapper objectMapper;

    public SurveyResponseService(SurveyResponseRepository surveyResponseRepository,
                                 SurveyAnswerRepository surveyAnswerRepository,
                                 SurveyQuestionRepository surveyQuestionRepository,
                                 SurveyOptionRepository surveyOptionRepository,
                                 UserRepository userRepository,
                                 SurveyRepository surveyRepository) { // Cập nhật constructor
        this.surveyResponseRepository = surveyResponseRepository;
        this.surveyAnswerRepository = surveyAnswerRepository;
        this.surveyQuestionRepository = surveyQuestionRepository;
        this.surveyOptionRepository = surveyOptionRepository;
        this.userRepository = userRepository;
        this.surveyRepository = surveyRepository; // Gán dependency
        this.objectMapper = new ObjectMapper();
    }

    public SurveyResponse createSurveyResponse(SurveyResponse response) {
        if (response == null) {
            throw new IllegalArgumentException("Phản hồi không được null");
        }
        if (response.getUser() == null || response.getUser().getUserId() == null) {
            throw new IllegalArgumentException("Người dùng không được null");
        }
        if (response.getSurvey() == null || response.getSurvey().getId() == null) {
            throw new IllegalArgumentException("Khảo sát không được null");
        }
        // Tra cứu user
        User user = userRepository.findById(response.getUser().getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại với ID: " + response.getUser().getUserId()));
        response.setUser(user);
        // Tra cứu survey
        Survey survey = surveyRepository.findById(response.getSurvey().getId())
                .orElseThrow(() -> new IllegalArgumentException("Khảo sát không tồn tại với ID: " + response.getSurvey().getId()));
        response.setSurvey(survey);
        return surveyResponseRepository.save(response);
    }

    public List<SurveyResponse> getAllSurveyResponses() {
        return surveyResponseRepository.findAll();
    }

    public SurveyResponse getSurveyResponseById(Long id) {
        return surveyResponseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Phản hồi không tồn tại"));
    }

    public SurveyResponse updateSurveyResponse(Long id, SurveyResponse response) {
        SurveyResponse existingResponse = getSurveyResponseById(id);
        existingResponse.setTotalScore(response.getTotalScore());
        existingResponse.setRiskLevel(response.getRiskLevel());
        return surveyResponseRepository.save(existingResponse);
    }

    public void deleteSurveyResponse(Long id) {
        surveyResponseRepository.deleteById(id);
    }

    public Map<String, Object> calculateScore(Long responseId) {
        SurveyResponse response = surveyResponseRepository.findById(responseId)
                .orElseThrow(() -> new RuntimeException("Phản hồi không tồn tại"));
        List<SurveyAnswer> answers = surveyAnswerRepository.findAll().stream()
                .filter(a -> a.getResponse().getId().equals(responseId))
                .toList();
        int totalScore = answers.stream().mapToInt(answer -> {
            SurveyQuestion question = surveyQuestionRepository.findById(answer.getQuestion().getId())
                    .orElseThrow(() -> new RuntimeException("Câu hỏi không tồn tại"));
            if (question.getQuestionType() == SurveyQuestion.QuestionType.CHECKBOX_MULTIPLE) {
                if (answer.getOptionIds() != null) {
                    try {
                        Long[] optionIds = objectMapper.readValue(answer.getOptionIds(), Long[].class);
                        return Arrays.stream(optionIds)
                                .map(id -> surveyOptionRepository.findById(id)
                                        .orElseThrow(() -> new RuntimeException("Lựa chọn không tồn tại")))
                                .mapToInt(SurveyOption::getScore)
                                .sum();
                    } catch (Exception e) {
                        throw new RuntimeException("Lỗi phân tích optionIds: " + e.getMessage());
                    }
                }
                return 0;
            }
            return answer.getScore();
        }).sum();

        SurveyType surveyType = response.getSurvey().getSurveyType();
        try {
            Map<String, Map<String, Integer>> thresholds = objectMapper.readValue(surveyType.getRiskThresholds(), Map.class);
            String riskLevel = totalScore <= thresholds.get("low").get("max") ? "Low Risk" :
                    totalScore <= thresholds.get("moderate").get("max") ? "Moderate Risk" : "High Risk";

            response.setTotalScore(totalScore);
            response.setRiskLevel(riskLevel);
            surveyResponseRepository.save(response);

            return Map.of("totalScore", totalScore, "maxScore", surveyType.getMaxScore(), "riskLevel", riskLevel);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi phân tích ngưỡng rủi ro: " + e.getMessage());
        }
    }

    public double calculateAccuracyPercentage(Long surveyId, User user, List<Long> questionIds) {
        List<SurveyResponse> responses = surveyResponseRepository.findBySurveyIdAndUserId(surveyId, user.getUserId());
        if (responses.isEmpty()) return 0.0;

        List<SurveyQuestion> questions = surveyQuestionRepository.findAll().stream()
                .filter(q -> q.getSurvey().getId().equals(surveyId))
                .toList();
        int totalQuestions = questions.size();
        if (totalQuestions == 0) return 0.0;

        int correctAnswers = 0;
        for (SurveyResponse response : responses) {
            List<SurveyAnswer> answers = surveyAnswerRepository.findAll().stream()
                    .filter(a -> a.getResponse().getId().equals(response.getId()))
                    .toList();
            for (SurveyAnswer answer : answers) {
                SurveyQuestion question = surveyQuestionRepository.findById(answer.getQuestion().getId())
                        .orElse(null);
                if (question != null && question.getCorrectAnswer() != null) {
                    if (question.getQuestionType() == SurveyQuestion.QuestionType.CHECKBOX_MULTIPLE) {
                        try {
                            Long[] optionIds = objectMapper.readValue(answer.getOptionIds(), Long[].class);
                            String selectedOptions = Arrays.stream(optionIds)
                                    .map(id -> surveyOptionRepository.findById(id).map(SurveyOption::getOptionText).orElse(""))
                                    .collect(Collectors.joining(","));
                            if (question.getCorrectAnswer().equals(selectedOptions)) {
                                correctAnswers++;
                            }
                        } catch (Exception e) {
                            // Bỏ qua nếu lỗi phân tích
                        }
                    } else if (question.getCorrectAnswer().equals(answer.getOption().getOptionText())) {
                        correctAnswers++;
                    }
                }
            }
        }

        return (double) correctAnswers / totalQuestions * 100;
    }

    public String evaluateAddictionLevel(Long surveyId, User user) {
        List<SurveyResponse> responses = surveyResponseRepository.findBySurveyIdAndUserId(surveyId, user.getUserId());
        if (responses.isEmpty()) return "No Data";
        SurveyResponse latestResponse = responses.get(0);
        return latestResponse.getRiskLevel() != null ? latestResponse.getRiskLevel() : "No Risk Level";
    }
}