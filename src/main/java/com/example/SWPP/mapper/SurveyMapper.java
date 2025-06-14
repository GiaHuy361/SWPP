package com.example.SWPP.mapper;

import com.example.SWPP.dto.SurveyDTO;
import com.example.SWPP.dto.SurveyTypeDTO;
import com.example.SWPP.entity.Survey;

public class SurveyMapper {
    public static SurveyDTO toDTO(Survey survey) {
        if (survey == null) return null;

        SurveyTypeDTO typeDTO = new SurveyTypeDTO(
                survey.getSurveyType().getId(),
                survey.getSurveyType().getName(),
                survey.getSurveyType().getDescription()
        );

        return new SurveyDTO(
                survey.getId(),
                survey.getTitle(),
                survey.getDescription(),
                survey.getCreatedAt(),
                typeDTO
        );
    }
}
