package com.example.SWPP.service;

import com.example.SWPP.entity.*;
import com.example.SWPP.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Arrays;
import java.util.stream.Collectors;

@Service
public class SurveyResponseService {

    private static final Logger logger = LoggerFactory.getLogger(SurveyResponseService.class);

    private final SurveyResponseRepository surveyResponseRepository;
    private final SurveyAnswerRepository surveyAnswerRepository;
    private final SurveyQuestionRepository surveyQuestionRepository;
    private final SurveyOptionRepository surveyOptionRepository;
    private final UserRepository userRepository;
    private final SurveyRepository surveyRepository;
    private final ObjectMapper objectMapper;

    public SurveyResponseService(SurveyResponseRepository surveyResponseRepository,
                                 SurveyAnswerRepository surveyAnswerRepository,
                                 SurveyQuestionRepository surveyQuestionRepository,
                                 SurveyOptionRepository surveyOptionRepository,
                                 UserRepository userRepository,
                                 SurveyRepository surveyRepository) {
        this.surveyResponseRepository = surveyResponseRepository;
        this.surveyAnswerRepository = surveyAnswerRepository;
        this.surveyQuestionRepository = surveyQuestionRepository;
        this.surveyOptionRepository = surveyOptionRepository;
        this.userRepository = userRepository;
        this.surveyRepository = surveyRepository;
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
        User user = userRepository.findById(response.getUser().getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại với ID: " + response.getUser().getUserId()));
        response.setUser(user);
        Survey survey = surveyRepository.findById(response.getSurvey().getId())
                .orElseThrow(() -> new IllegalArgumentException("Khảo sát không tồn tại với ID: " + response.getSurvey().getId()));
        response.setSurvey(survey);
        SurveyResponse savedResponse = surveyResponseRepository.save(response);
        if (response.getAnswers() != null) {
            response.getAnswers().forEach(answer -> {
                answer.setResponse(savedResponse);
                surveyAnswerRepository.save(answer);
            });
        }
        return savedResponse;
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
        if (response.getAnswers() != null) {
            existingResponse.getAnswers().clear();
            response.getAnswers().forEach(answer -> {
                answer.setResponse(existingResponse);
                existingResponse.getAnswers().add(answer);
            });
        }
        return surveyResponseRepository.save(existingResponse);
    }

    public void deleteSurveyResponse(Long id) {
        surveyResponseRepository.deleteById(id);
    }

    public Map<String, Object> calculateScore(Long responseId) {
        SurveyResponse response = surveyResponseRepository.findById(responseId)
                .orElseThrow(() -> new RuntimeException("Phản hồi không tồn tại"));
        List<SurveyAnswer> answers = surveyAnswerRepository.findByResponseId(responseId);
        int totalScore = answers.stream().mapToInt(answer -> {
            SurveyQuestion question = surveyQuestionRepository.findById(answer.getQuestion().getId())
                    .orElseThrow(() -> new RuntimeException("Câu hỏi không tồn tại"));
            if (question.getQuestionType() == SurveyQuestion.QuestionType.CHECKBOX_MULTIPLE) {
                if (answer.getOptionIds() != null) {
                    try {
                        Long[] optionIds = parseOptionIds(answer.getOptionIds());
                        int score = Arrays.stream(optionIds)
                                .map(id -> surveyOptionRepository.findById(id)
                                        .orElseThrow(() -> new RuntimeException("Lựa chọn không tồn tại với ID: " + id)))
                                .mapToInt(SurveyOption::getScore)
                                .sum();
                        logger.debug("QuestionId={}, optionIds={}, calculatedScore={}", question.getId(), Arrays.toString(optionIds), score);
                        return score;
                    } catch (Exception e) {
                        logger.error("Error parsing optionIds for answerId={}: {}", answer.getId(), e.getMessage());
                        return 0;
                    }
                }
                return 0;
            } else if (question.getQuestionType() == SurveyQuestion.QuestionType.TEXT) {
                return answer.getScore() != null ? answer.getScore() : 0;
            } else {
                if (answer.getOption() != null && answer.getOption().getId() != null) {
                    SurveyOption option = surveyOptionRepository.findById(answer.getOption().getId())
                            .orElseThrow(() -> new RuntimeException("Lựa chọn không tồn tại với ID: " + answer.getOption().getId()));
                    int score = option.getScore();
                    logger.debug("QuestionId={}, optionId={}, optionText={}, score={}", question.getId(), answer.getOption().getId(), option.getOptionText(), score);
                    return score;
                }
                logger.warn("No valid option for questionId={}", question.getId());
                return 0;
            }
        }).sum();

        SurveyType surveyType = response.getSurvey().getSurveyType();
        try {
            Map<String, Map<String, Integer>> thresholds = objectMapper.readValue(surveyType.getRiskThresholds(), Map.class);
            String riskLevel = totalScore <= thresholds.get("low").get("max") ? "Low Risk" :
                    totalScore <= thresholds.get("moderate").get("max") ? "Moderate Risk" : "High Risk";
            logger.debug("SurveyType={}, totalScore={}, thresholds={}, riskLevel={}", surveyType.getName(), totalScore, thresholds, riskLevel);

            response.setTotalScore(totalScore);
            response.setRiskLevel(riskLevel.isEmpty() ? "No Risk Level" : riskLevel);
            surveyResponseRepository.save(response);

            return Map.of("totalScore", totalScore, "maxScore", surveyType.getMaxScore(), "riskLevel", response.getRiskLevel());
        } catch (Exception e) {
            logger.error("Error parsing riskThresholds for surveyTypeId={}: {}", surveyType.getId(), e.getMessage());
            response.setRiskLevel("No Risk Level");
            surveyResponseRepository.save(response);
            return Map.of("totalScore", totalScore, "maxScore", surveyType.getMaxScore(), "riskLevel", "No Risk Level");
        }
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

    public double calculateAccuracyPercentage(Long surveyId, User user, List<Long> questionIds) {
        List<SurveyResponse> responses = surveyResponseRepository.findBySurveyIdAndUserId(surveyId, user.getUserId());
        if (responses.isEmpty()) {
            logger.warn("No responses found for surveyId={} and userId={}", surveyId, user.getUserId());
            return 0.0;
        }
        SurveyResponse latestResponse = responses.stream()
                .sorted((r1, r2) -> r2.getSubmittedAt().compareTo(r1.getSubmittedAt()))
                .findFirst()
                .orElse(null);
        if (latestResponse == null) return 0.0;

        List<SurveyQuestion> questions = surveyQuestionRepository.findAll().stream()
                .filter(q -> q.getSurvey().getId().equals(surveyId))
                .toList();
        int totalQuestions = questions.size();
        if (totalQuestions == 0) {
            logger.warn("No questions found for surveyId={}", surveyId);
            return 0.0;
        }

        List<SurveyAnswer> answers = surveyAnswerRepository.findByResponseId(latestResponse.getId());
        int correctAnswers = 0;

        for (SurveyAnswer answer : answers) {
            SurveyQuestion question = surveyQuestionRepository.findById(answer.getQuestion().getId()).orElse(null);
            if (question == null || question.getCorrectAnswer() == null) {
                logger.debug("Skipping questionId={} due to null question or null correctAnswer", answer.getQuestion().getId());
                continue;
            }

            boolean isCorrect = false;
            if (question.getQuestionType() == SurveyQuestion.QuestionType.CHECKBOX_MULTIPLE) {
                if (answer.getOptionIds() != null) {
                    try {
                        Long[] optionIds = parseOptionIds(answer.getOptionIds());
                        String selectedOptions = Arrays.stream(optionIds)
                                .map(id -> surveyOptionRepository.findById(id).map(SurveyOption::getOptionText).orElse(""))
                                .sorted()
                                .collect(Collectors.joining(","));
                        logger.debug("QuestionId={}, selectedOptions={}, correctAnswer={}", question.getId(), selectedOptions, question.getCorrectAnswer());
                        if (question.getCorrectAnswer().equals(selectedOptions)) {
                            isCorrect = true;
                        }
                    } catch (Exception e) {
                        logger.error("Error parsing optionIds for questionId={}: {}", question.getId(), e.getMessage());
                    }
                }
            } else if (question.getQuestionType() == SurveyQuestion.QuestionType.TEXT) {
                if (answer.getOptionIds() != null && question.getCorrectAnswer().equals(answer.getOptionIds())) {
                    logger.debug("QuestionId={} (TEXT), optionIds={}, correctAnswer={}", question.getId(), answer.getOptionIds(), question.getCorrectAnswer());
                    isCorrect = true;
                }
            } else {
                if (answer.getOption() != null) {
                    String selectedOptionText = answer.getOption().getOptionText();
                    Long optionId = null;
                    try {
                        optionId = Long.parseLong(answer.getOptionIds());
                        SurveyOption option = surveyOptionRepository.findById(optionId).orElse(null);
                        if (option != null) {
                            selectedOptionText = option.getOptionText();
                        }
                    } catch (NumberFormatException e) {
                        logger.warn("optionIds={} is not a valid number for questionId={}", answer.getOptionIds(), question.getId());
                    }
                    logger.debug("QuestionId={}, selectedOptionText={}, correctAnswer={}", question.getId(), selectedOptionText, question.getCorrectAnswer());
                    if (question.getCorrectAnswer().equals(selectedOptionText)) {
                        isCorrect = true;
                    }
                } else {
                    logger.debug("QuestionId={} has null option", question.getId());
                }
            }

            if (isCorrect) {
                correctAnswers++;
                logger.info("Correct answer for questionId={}", question.getId());
            }
        }

        double accuracy = (double) correctAnswers / totalQuestions * 100;
        logger.info("Accuracy for surveyId={}, userId={}: {}% ({} correct / {} total)", surveyId, user.getUserId(), accuracy, correctAnswers, totalQuestions);
        return accuracy;
    }

    public String evaluateAddictionLevel(Long surveyId, User user) {
        List<SurveyResponse> responses = surveyResponseRepository.findBySurveyIdAndUserId(surveyId, user.getUserId());
        if (responses.isEmpty()) return "No Data";
        SurveyResponse latestResponse = responses.get(0);
        return latestResponse.getRiskLevel() != null ? latestResponse.getRiskLevel() : "No Risk Level";
    }
}