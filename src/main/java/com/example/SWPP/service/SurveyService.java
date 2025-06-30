package com.example.SWPP.service;

import com.example.SWPP.entity.*;
import com.example.SWPP.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
        if (survey.getSurveyType() == null || survey.getSurveyType().getId() == null) {
            throw new IllegalArgumentException("Loại khảo sát không được null");
        }
        SurveyType surveyType = surveyTypeRepository.findById(survey.getSurveyType().getId())
                .orElseThrow(() -> new IllegalArgumentException("Loại khảo sát không tồn tại: " + survey.getSurveyType().getId()));
        survey.setSurveyType(surveyType);
        // Đặt createdAt mặc định nếu không có
        if (survey.getCreatedAt() == null) {
            survey.setCreatedAt(LocalDateTime.now());
            logger.debug("Set default createdAt for survey: {}", survey.getCreatedAt());
        }
        // Cho phép questions rỗng ban đầu, thêm sau
        List<SurveyQuestion> questions = survey.getQuestions();
        if (questions != null) {
            questions.forEach(question -> {
                question.setSurvey(survey);
                if (question.getOptions() != null) {
                    question.getOptions().forEach(option -> option.setQuestion(question));
                }
            });
        }
        logger.info("Creating survey with title: {}", survey.getTitle());
        try {
            return surveyRepository.save(survey);
        } catch (Exception e) {
            logger.error("Failed to create survey with title '{}': {}", survey.getTitle(), e.getMessage(), e);
            throw e;
        }
    }

    // Các phương thức khác giữ nguyên như phiên bản trước...
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
        if (survey.getSurveyType() == null || survey.getSurveyType().getId() == null) {
            throw new IllegalArgumentException("Loại khảo sát không được null");
        }
        SurveyType surveyType = surveyTypeRepository.findById(survey.getSurveyType().getId())
                .orElseThrow(() -> new RuntimeException("Loại khảo sát không tồn tại: " + survey.getSurveyType().getId()));
        existingSurvey.setTitle(survey.getTitle());
        existingSurvey.setDescription(survey.getDescription());
        existingSurvey.setSurveyType(surveyType);
        if (survey.getCreatedAt() != null) {
            existingSurvey.setCreatedAt(survey.getCreatedAt());
        }
        existingSurvey.getQuestions().clear();
        List<SurveyQuestion> questions = survey.getQuestions();
        if (questions != null) {
            questions.forEach(question -> {
                question.setSurvey(existingSurvey);
                if (question.getOptions() != null) {
                    question.getOptions().forEach(option -> option.setQuestion(question));
                }
                existingSurvey.getQuestions().add(question);
            });
        }
        logger.info("Updating survey with id: {}", id);
        try {
            return surveyRepository.save(existingSurvey);
        } catch (Exception e) {
            logger.error("Failed to update survey with id '{}': {}", id, e.getMessage(), e);
            throw e;
        }
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
        try {
            return surveyTypeRepository.save(surveyType);
        } catch (Exception e) {
            logger.error("Failed to create survey type '{}': {}", surveyType.getName(), e.getMessage(), e);
            throw e;
        }
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
        try {
            return surveyTypeRepository.save(existingType);
        } catch (Exception e) {
            logger.error("Failed to update survey type with id '{}': {}", id, e.getMessage(), e);
            throw e;
        }
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
        Long surveyId = question.getSurvey() != null ? question.getSurvey().getId() : null;
        if (surveyId == null) {
            throw new IllegalArgumentException("ID khảo sát không được null");
        }
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new IllegalArgumentException("Khảo sát không tồn tại với ID: " + surveyId));
        question.setSurvey(survey);
        if (question.getOptions() != null) {
            question.getOptions().forEach(option -> option.setQuestion(question));
        }
        try {
            return surveyQuestionRepository.save(question);
        } catch (Exception e) {
            logger.error("Failed to create survey question '{}': {}", question.getQuestionText(), e.getMessage(), e);
            throw e;
        }
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
        try {
            return surveyQuestionRepository.save(existingQuestion);
        } catch (Exception e) {
            logger.error("Failed to update survey question with id '{}': {}", id, e.getMessage(), e);
            throw e;
        }
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
        try {
            return surveyResponseRepository.save(response);
        } catch (Exception e) {
            logger.error("Failed to create survey response for survey id '{}': {}", response.getSurvey().getId(), e.getMessage(), e);
            throw e;
        }
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
        try {
            return surveyResponseRepository.save(existingResponse);
        } catch (Exception e) {
            logger.error("Failed to update survey response with id '{}': {}", id, e.getMessage(), e);
            throw e;
        }
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
        try {
            return surveyAnswerRepository.save(answer);
        } catch (Exception e) {
            logger.error("Failed to create survey answer for question id '{}': {}", answer.getQuestion().getId(), e.getMessage(), e);
            throw e;
        }
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
        try {
            return surveyAnswerRepository.save(existingAnswer);
        } catch (Exception e) {
            logger.error("Failed to update survey answer with id '{}': {}", id, e.getMessage(), e);
            throw e;
        }
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
        try {
            return surveyOptionRepository.save(option);
        } catch (Exception e) {
            logger.error("Failed to create survey option '{}': {}", option.getOptionText(), e.getMessage(), e);
            throw e;
        }
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

    // Thêm phương thức kiểm tra tồn tại
    public boolean isSurveyTypeExists(Long surveyTypeId) {
        logger.debug("Checking if survey type exists with id: {}", surveyTypeId);
        return surveyTypeRepository.existsById(surveyTypeId);
    }
}