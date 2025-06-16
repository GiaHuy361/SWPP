package com.example.SWPP.service;

import com.example.SWPP.entity.*;
import com.example.SWPP.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SurveyService {

    private static final Logger logger = LoggerFactory.getLogger(SurveyService.class);

    private final SurveyRepository surveyRepository;
    private final SurveyTypeRepository surveyTypeRepository;
    private final SurveyQuestionRepository surveyQuestionRepository;
    private final SurveyResponseRepository surveyResponseRepository;
    private final SurveyAnswerRepository surveyAnswerRepository;
    private final SurveyOptionRepository surveyOptionRepository;

    public SurveyService(SurveyRepository surveyRepository, SurveyTypeRepository surveyTypeRepository,
                         SurveyQuestionRepository surveyQuestionRepository, SurveyResponseRepository surveyResponseRepository,
                         SurveyAnswerRepository surveyAnswerRepository, SurveyOptionRepository surveyOptionRepository) {
        this.surveyRepository = surveyRepository;
        this.surveyTypeRepository = surveyTypeRepository;
        this.surveyQuestionRepository = surveyQuestionRepository;
        this.surveyResponseRepository = surveyResponseRepository;
        this.surveyAnswerRepository = surveyAnswerRepository;
        this.surveyOptionRepository = surveyOptionRepository;
    }

    public Survey createSurvey(Survey survey) {
        if (survey == null) {
            throw new IllegalArgumentException("Khảo sát không được null");
        }
        List<SurveyQuestion> questions = survey.getQuestions();
        if (questions == null || questions.isEmpty()) {
            throw new IllegalArgumentException("Khảo sát phải có ít nhất một câu hỏi");
        }
        if (survey.getSurveyType() == null || survey.getSurveyType().getId() == null) {
            throw new IllegalArgumentException("Loại khảo sát không được null");
        }
        SurveyType surveyType = surveyTypeRepository.findById(survey.getSurveyType().getId())
                .orElseThrow(() -> new IllegalArgumentException("Loại khảo sát không tồn tại: " + survey.getSurveyType().getId()));
        survey.setSurveyType(surveyType);
        questions.forEach(question -> {
            question.setSurvey(survey);
            if (question.getOptions() != null) {
                question.getOptions().forEach(option -> option.setQuestion(question));
            }
        });
        logger.info("Creating survey with title: {}", survey.getTitle());
        return surveyRepository.save(survey);
    }

    public List<Survey> getAllSurveys() {
        logger.info("Fetching all surveys");
        return surveyRepository.findAll();
    }

    public Survey getSurveyById(Long id) {
        logger.info("Fetching survey by id: {}", id);
        return surveyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khảo sát không tồn tại: " + id));
    }

    public Survey updateSurvey(Long id, Survey survey) {
        if (survey == null) {
            throw new IllegalArgumentException("Khảo sát không được null");
        }
        Survey existingSurvey = getSurveyById(id);
        List<SurveyQuestion> questions = survey.getQuestions();
        if (questions == null || questions.isEmpty()) {
            throw new IllegalArgumentException("Khảo sát phải có ít nhất một câu hỏi");
        }
        if (survey.getSurveyType() == null || survey.getSurveyType().getId() == null) {
            throw new IllegalArgumentException("Loại khảo sát không được null");
        }
        SurveyType surveyType = surveyTypeRepository.findById(survey.getSurveyType().getId())
                .orElseThrow(() -> new RuntimeException("Loại khảo sát không tồn tại: " + survey.getSurveyType().getId()));
        existingSurvey.setTitle(survey.getTitle());
        existingSurvey.setDescription(survey.getDescription());
        existingSurvey.setSurveyType(surveyType);
        existingSurvey.setCreatedAt(survey.getCreatedAt());
        existingSurvey.getQuestions().clear();
        questions.forEach(question -> {
            question.setSurvey(existingSurvey);
            if (question.getOptions() != null) {
                question.getOptions().forEach(option -> option.setQuestion(question));
            }
            existingSurvey.getQuestions().add(question);
        });
        logger.info("Updating survey with id: {}", id);
        return surveyRepository.save(existingSurvey);
    }

    public void deleteSurvey(Long id) {
        logger.info("Deleting survey with id: {}", id);
        if (!surveyRepository.existsById(id)) {
            throw new RuntimeException("Khảo sát không tồn tại: " + id);
        }
        surveyRepository.deleteById(id);
    }

    public SurveyType createSurveyType(SurveyType surveyType) {
        if (surveyType == null) {
            throw new IllegalArgumentException("Loại khảo sát không được null");
        }
        logger.info("Creating survey type: {}", surveyType.getName());
        return surveyTypeRepository.save(surveyType);
    }

    public List<SurveyType> getAllSurveyTypes() {
        logger.info("Fetching all survey types");
        return surveyTypeRepository.findAll();
    }

    public SurveyType getSurveyTypeById(Long id) {
        logger.info("Fetching survey type by id: {}", id);
        return surveyTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loại khảo sát không tồn tại: " + id));
    }

    public SurveyType updateSurveyType(Long id, SurveyType surveyType) {
        if (surveyType == null) {
            throw new IllegalArgumentException("Loại khảo sát không được null");
        }
        SurveyType existingType = getSurveyTypeById(id);
        existingType.setName(surveyType.getName());
        existingType.setDescription(surveyType.getDescription());
        existingType.setMaxScore(surveyType.getMaxScore());
        existingType.setRiskThresholds(surveyType.getRiskThresholds());
        logger.info("Updating survey type with id: {}", id);
        return surveyTypeRepository.save(existingType);
    }

    public void deleteSurveyType(Long id) {
        logger.info("Deleting survey type with id: {}", id);
        if (!surveyTypeRepository.existsById(id)) {
            throw new RuntimeException("Loại khảo sát không tồn tại: " + id);
        }
        surveyTypeRepository.deleteById(id);
    }

    public SurveyQuestion createSurveyQuestion(SurveyQuestion question) {
        if (question == null) {
            throw new IllegalArgumentException("Câu hỏi không được null");
        }
        logger.info("Creating survey question: {}", question.getQuestionText());
        // Kiểm tra và tra cứu survey
        Long surveyId = question.getSurvey() != null ? question.getSurvey().getId() : null;
        if (surveyId == null) {
            throw new IllegalArgumentException("ID khảo sát không được null");
        }
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> {
                    logger.error("Survey not found with ID: {}", surveyId);
                    return new IllegalArgumentException("Khảo sát không tồn tại với ID: " + surveyId);
                });
        question.setSurvey(survey);
        if (question.getOptions() != null) {
            question.getOptions().forEach(option -> option.setQuestion(question));
        }
        return surveyQuestionRepository.save(question);
    }

    public List<SurveyQuestion> getAllSurveyQuestions() {
        logger.info("Fetching all survey questions");
        return surveyQuestionRepository.findAll();
    }

    public SurveyQuestion getSurveyQuestionById(Long id) {
        logger.info("Fetching survey question by id: {}", id);
        return surveyQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Câu hỏi không tồn tại: " + id));
    }

    public SurveyQuestion updateSurveyQuestion(Long id, SurveyQuestion question) {
        if (question == null) {
            throw new IllegalArgumentException("Câu hỏi không được null");
        }
        SurveyQuestion existingQuestion = getSurveyQuestionById(id);
        existingQuestion.setQuestionText(question.getQuestionText());
        existingQuestion.setQuestionType(question.getQuestionType());
        existingQuestion.setCorrectAnswer(question.getCorrectAnswer());
        existingQuestion.getOptions().clear();
        if (question.getOptions() != null) {
            question.getOptions().forEach(option -> {
                option.setQuestion(existingQuestion);
                existingQuestion.getOptions().add(option);
            });
        }
        logger.info("Updating survey question with id: {}", id);
        return surveyQuestionRepository.save(existingQuestion);
    }

    public void deleteSurveyQuestion(Long id) {
        logger.info("Deleting survey question with id: {}", id);
        if (!surveyQuestionRepository.existsById(id)) {
            throw new RuntimeException("Câu hỏi không tồn tại: " + id);
        }
        surveyQuestionRepository.deleteById(id);
    }

    public SurveyResponse createSurveyResponse(SurveyResponse response) {
        if (response == null) {
            throw new IllegalArgumentException("Phản hồi không được null");
        }
        if (response.getSurvey() == null || response.getSurvey().getId() == null) {
            throw new IllegalArgumentException("Khảo sát không được null");
        }
        if (response.getUser() == null || response.getUser().getUserId() == null) {
            throw new IllegalArgumentException("Người dùng không được null");
        }
        logger.info("Creating survey response for survey id: {}", response.getSurvey().getId());
        return surveyResponseRepository.save(response);
    }

    public List<SurveyResponse> getAllSurveyResponses() {
        logger.info("Fetching all survey responses");
        return surveyResponseRepository.findAll();
    }

    public SurveyResponse getSurveyResponseById(Long id) {
        logger.info("Fetching survey response by id: {}", id);
        return surveyResponseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Phản hồi không tồn tại: " + id));
    }

    public SurveyResponse updateSurveyResponse(Long id, SurveyResponse response) {
        if (response == null) {
            throw new IllegalArgumentException("Phản hồi không được null");
        }
        SurveyResponse existingResponse = getSurveyResponseById(id);
        existingResponse.setTotalScore(response.getTotalScore());
        existingResponse.setRiskLevel(response.getRiskLevel());
        existingResponse.setSubmittedAt(response.getSubmittedAt());
        logger.info("Updating survey response with id: {}", id);
        return surveyResponseRepository.save(existingResponse);
    }

    public void deleteSurveyResponse(Long id) {
        logger.info("Deleting survey response with id: {}", id);
        if (!surveyResponseRepository.existsById(id)) {
            throw new RuntimeException("Phản hồi không tồn tại: " + id);
        }
        surveyResponseRepository.deleteById(id);
    }

    public SurveyAnswer createSurveyAnswer(SurveyAnswer answer) {
        if (answer == null) {
            throw new IllegalArgumentException("Câu trả lời không được null");
        }
        if (answer.getQuestion() == null || answer.getQuestion().getId() == null) {
            throw new IllegalArgumentException("Câu hỏi không được null");
        }
        if (answer.getResponse() == null || answer.getResponse().getId() == null) {
            throw new IllegalArgumentException("Phản hồi không được null");
        }
        logger.info("Creating survey answer for question id: {}", answer.getQuestion().getId());
        return surveyAnswerRepository.save(answer);
    }

    public List<SurveyAnswer> getAllSurveyAnswers() {
        logger.info("Fetching all survey answers");
        return surveyAnswerRepository.findAll();
    }

    public SurveyAnswer getSurveyAnswerById(Long id) {
        logger.info("Fetching survey answer by id: {}", id);
        return surveyAnswerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Câu trả lời không tồn tại: " + id));
    }

    public SurveyAnswer updateSurveyAnswer(Long id, SurveyAnswer answer) {
        if (answer == null) {
            throw new IllegalArgumentException("Câu trả lời không được null");
        }
        SurveyAnswer existingAnswer = getSurveyAnswerById(id);
        existingAnswer.setOption(answer.getOption());
        existingAnswer.setOptionIds(answer.getOptionIds());
        existingAnswer.setScore(answer.getScore());
        logger.info("Updating survey answer with id: {}", id);
        return surveyAnswerRepository.save(existingAnswer);
    }

    public void deleteSurveyAnswer(Long id) {
        logger.info("Deleting survey answer with id: {}", id);
        if (!surveyAnswerRepository.existsById(id)) {
            throw new RuntimeException("Câu trả lời không tồn tại: " + id);
        }
        surveyAnswerRepository.deleteById(id);
    }

    public SurveyOption createSurveyOption(SurveyOption option) {
        if (option == null) {
            throw new IllegalArgumentException("Lựa chọn không được null");
        }
        if (option.getQuestion() == null || option.getQuestion().getId() == null) {
            throw new IllegalArgumentException("Câu hỏi không được null");
        }
        logger.info("Creating survey option: {}", option.getOptionText());
        return surveyOptionRepository.save(option);
    }

    public SurveyOption getSurveyOptionById(Long id) {
        logger.info("Fetching survey option by id: {}", id);
        return surveyOptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lựa chọn không tồn tại: " + id));
    }

    public void deleteSurveyOption(Long id) {
        logger.info("Deleting survey option with id: {}", id);
        if (!surveyOptionRepository.existsById(id)) {
            throw new RuntimeException("Lựa chọn không tồn tại: " + id);
        }
        surveyOptionRepository.deleteById(id);
    }
}