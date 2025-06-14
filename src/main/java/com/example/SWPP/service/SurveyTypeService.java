package com.example.SWPP.service;

import com.example.SWPP.entity.SurveyType;

import java.util.List;

public interface SurveyTypeService {
    List<SurveyType> getAllSurveyTypes();
    SurveyType createSurveyType(SurveyType surveyType);
}
