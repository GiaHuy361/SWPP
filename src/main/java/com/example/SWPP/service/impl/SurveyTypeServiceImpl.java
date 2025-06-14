package com.example.SWPP.service.impl;

import com.example.SWPP.entity.SurveyType;
import com.example.SWPP.repository.SurveyTypeRepository;
import com.example.SWPP.service.SurveyTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SurveyTypeServiceImpl implements SurveyTypeService {

    @Autowired
    private SurveyTypeRepository surveyTypeRepository;

    @Override
    public List<SurveyType> getAllSurveyTypes() {
        return surveyTypeRepository.findAll();
    }

    @Override
    public SurveyType createSurveyType(SurveyType surveyType) {
        return surveyTypeRepository.save(surveyType);
    }
}
