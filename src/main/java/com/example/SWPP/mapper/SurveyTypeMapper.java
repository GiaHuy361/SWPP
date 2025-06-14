package com.example.SWPP.mapper;

import com.example.SWPP.dto.SurveyTypeDTO;
import com.example.SWPP.entity.SurveyType;

public class SurveyTypeMapper {

    public static SurveyTypeDTO toDTO(SurveyType surveyType) {
        if (surveyType == null) return null;
        return new SurveyTypeDTO(
            surveyType.getId(),
            surveyType.getName(),
            surveyType.getDescription()
        );
    }
}
