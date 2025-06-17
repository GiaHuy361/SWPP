package com.example.SWPP.mapper;

import com.example.SWPP.dto.*;
import com.example.SWPP.entity.*;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class SurveyMapper {

    public SurveyType toSurveyTypeEntity(SurveyTypeDTO dto) {
        if (dto == null) return null;
        SurveyType entity = new SurveyType();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setMaxScore(dto.getMaxScore());
        entity.setRiskThresholds(dto.getRiskThresholds());
        return entity;
    }

    public SurveyTypeDTO toSurveyTypeDTO(SurveyType entity) {
        if (entity == null) return null;
        SurveyTypeDTO dto = new SurveyTypeDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setMaxScore(entity.getMaxScore());
        dto.setRiskThresholds(entity.getRiskThresholds());
        return dto;
    }

    public Survey toSurveyEntity(SurveyDTO dto) {
        if (dto == null) return null;
        Survey entity = new Survey();
        entity.setId(dto.getId());
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setCreatedAt(dto.getCreatedAt());
        if (dto.getSurveyTypeId() != null) {
            SurveyType surveyType = new SurveyType();
            surveyType.setId(dto.getSurveyTypeId());
            entity.setSurveyType(surveyType);
        }
        if (dto.getQuestions() != null && !dto.getQuestions().isEmpty()) {
            List<SurveyQuestion> questions = dto.getQuestions().stream()
                    .map(this::toSurveyQuestionEntity)
                    .collect(Collectors.toList());
            questions.forEach(question -> question.setSurvey(entity));
            entity.setQuestions(questions);
        } else {
            entity.setQuestions(Collections.emptyList());
        }
        return entity;
    }

    public SurveyDTO toSurveyDTO(Survey entity) {
        if (entity == null) return null;
        SurveyDTO dto = new SurveyDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setSurveyTypeId(entity.getSurveyType() != null ? entity.getSurveyType().getId() : null);
        dto.setCreatedAt(entity.getCreatedAt());
        if (entity.getQuestions() != null) {
            dto.setQuestions(entity.getQuestions().stream()
                    .map(this::toSurveyQuestionDTO)
                    .collect(Collectors.toList()));
        } else {
            dto.setQuestions(Collections.emptyList());
        }
        return dto;
    }

    public SurveyQuestion toSurveyQuestionEntity(SurveyQuestionDTO dto) {
        if (dto == null) return null;
        SurveyQuestion entity = new SurveyQuestion();
        entity.setId(dto.getId());
        entity.setQuestionText(dto.getQuestionText());
        try {
            entity.setQuestionType(SurveyQuestion.QuestionType.valueOf(dto.getQuestionType()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Loại câu hỏi không hợp lệ: " + dto.getQuestionType());
        }
        entity.setCorrectAnswer(dto.getCorrectAnswer());
        if (dto.getSurveyId() != null) {
            Survey survey = new Survey();
            survey.setId(dto.getSurveyId());
            entity.setSurvey(survey);
        }
        if (dto.getOptions() != null && !dto.getOptions().isEmpty()) {
            List<SurveyOption> options = dto.getOptions().stream()
                    .map(this::toSurveyOptionEntity)
                    .collect(Collectors.toList());
            options.forEach(option -> option.setQuestion(entity));
            entity.setOptions(options);
        } else {
            entity.setOptions(Collections.emptyList());
        }
        return entity;
    }

    public SurveyQuestionDTO toSurveyQuestionDTO(SurveyQuestion entity) {
        if (entity == null) return null;
        SurveyQuestionDTO dto = new SurveyQuestionDTO();
        dto.setId(entity.getId());
        dto.setSurveyId(entity.getSurvey() != null ? entity.getSurvey().getId() : null);
        dto.setQuestionText(entity.getQuestionText());
        dto.setQuestionType(entity.getQuestionType().name());
        dto.setCorrectAnswer(entity.getCorrectAnswer());
        if (entity.getOptions() != null) {
            dto.setOptions(entity.getOptions().stream()
                    .map(this::toSurveyOptionDTO)
                    .collect(Collectors.toList()));
        } else {
            dto.setOptions(Collections.emptyList());
        }
        return dto;
    }

    public SurveyOption toSurveyOptionEntity(SurveyOptionDTO dto) {
        if (dto == null) return null;
        SurveyOption entity = new SurveyOption();
        entity.setId(dto.getId());
        entity.setOptionText(dto.getOptionText());
        entity.setScore(dto.getScore());
        return entity;
    }

    public SurveyOptionDTO toSurveyOptionDTO(SurveyOption entity) {
        if (entity == null) return null;
        SurveyOptionDTO dto = new SurveyOptionDTO();
        dto.setId(entity.getId());
        dto.setQuestionId(entity.getQuestion() != null ? entity.getQuestion().getId() : null);
        dto.setOptionText(entity.getOptionText());
        dto.setScore(entity.getScore());
        return dto;
    }

    public SurveyResponse toSurveyResponseEntity(SurveyResponseDTO dto) {
        if (dto == null) return null;
        SurveyResponse entity = new SurveyResponse();
        entity.setSubmittedAt(dto.getSubmittedAt());
        entity.setTotalScore(dto.getTotalScore());
        entity.setRiskLevel(dto.getRiskLevel());
        if (dto.getUserId() != null) {
            User user = new User();
            user.setUserId(dto.getUserId());
            entity.setUser(user);
        }
        if (dto.getSurveyId() != null) {
            Survey survey = new Survey();
            survey.setId(dto.getSurveyId());
            entity.setSurvey(survey);
        }
        if (dto.getAnswers() != null) {
            List<SurveyAnswer> answers = dto.getAnswers().stream()
                    .map(this::toSurveyAnswerEntity)
                    .collect(Collectors.toList());
            answers.forEach(answer -> answer.setResponse(entity));
            entity.setAnswers(answers);
        }
        return entity;
    }

    public SurveyResponseDTO toSurveyResponseDTO(SurveyResponse entity) {
        if (entity == null) return null;
        SurveyResponseDTO dto = new SurveyResponseDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser() != null ? entity.getUser().getUserId() : null);
        dto.setSurveyId(entity.getSurvey() != null ? entity.getSurvey().getId() : null);
        dto.setSubmittedAt(entity.getSubmittedAt());
        dto.setTotalScore(entity.getTotalScore());
        dto.setRiskLevel(entity.getRiskLevel());
        if (entity.getAnswers() != null) {
            dto.setAnswers(entity.getAnswers().stream()
                    .map(this::toSurveyAnswerDTO)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    public SurveyAnswer toSurveyAnswerEntity(SurveyAnswerDTO dto) {
        if (dto == null) return null;
        SurveyAnswer entity = new SurveyAnswer();
        entity.setId(dto.getId());
        entity.setOptionIds(dto.getOptionIds());
        entity.setScore(dto.getScore() != null ? dto.getScore() : 0);
        if (dto.getQuestionId() != null) {
            SurveyQuestion question = new SurveyQuestion();
            question.setId(dto.getQuestionId());
            entity.setQuestion(question);
        }
        if (dto.getResponseId() != null) {
            SurveyResponse response = new SurveyResponse();
            response.setId(dto.getResponseId());
            entity.setResponse(response);
        }
        if (dto.getOptionId() != null) {
            SurveyOption option = new SurveyOption();
            option.setId(dto.getOptionId());
            entity.setOption(option);
        }
        return entity;
    }

    public SurveyAnswerDTO toSurveyAnswerDTO(SurveyAnswer entity) {
        if (entity == null) return null;
        SurveyAnswerDTO dto = new SurveyAnswerDTO();
        dto.setId(entity.getId());
        dto.setResponseId(entity.getResponse() != null ? entity.getResponse().getId() : null);
        dto.setQuestionId(entity.getQuestion() != null ? entity.getQuestion().getId() : null);
        dto.setOptionId(entity.getOption() != null ? entity.getOption().getId() : null);
        dto.setOptionIds(entity.getOptionIds());
        dto.setScore(entity.getScore());
        return dto;
    }
}