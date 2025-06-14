package com.example.SWPP.service;

import com.example.SWPP.entity.Survey;

import java.util.List;

public interface SurveyService {
    Survey createSurvey(Survey survey);
    Survey getSurveyById(Integer id);
    List<Survey> getAllSurveys();
    Survey updateSurvey(Integer id, Survey updatedSurvey);
    void deleteSurvey(Integer id);
}
