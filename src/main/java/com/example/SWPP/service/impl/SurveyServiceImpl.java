package com.example.SWPP.service.impl;

import com.example.SWPP.entity.Survey;
import com.example.SWPP.repository.SurveyRepository;
import com.example.SWPP.service.SurveyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SurveyServiceImpl implements SurveyService {

    @Autowired
    private SurveyRepository surveyRepository;

    @Override
    public Survey createSurvey(Survey survey) {
        return surveyRepository.save(survey);
    }

    @Override
    public Survey getSurveyById(Integer id) {
        return surveyRepository.findById(id).orElse(null);
    }

    @Override
    public List<Survey> getAllSurveys() {
        return surveyRepository.findAll();
    }

    @Override
    public Survey updateSurvey(Integer id, Survey updatedSurvey) {
        Survey survey = getSurveyById(id);
        if (survey == null) return null;
        survey.setTitle(updatedSurvey.getTitle());
        survey.setDescription(updatedSurvey.getDescription());
        survey.setSurveyType(updatedSurvey.getSurveyType());
        return surveyRepository.save(survey);
    }

    @Override
    public void deleteSurvey(Integer id) {
        surveyRepository.deleteById(id);
    }
}
