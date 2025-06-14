package com.example.SWPP.controller;

import com.example.SWPP.dto.SurveyTypeDTO;
import com.example.SWPP.entity.SurveyType;
import com.example.SWPP.mapper.SurveyTypeMapper;
import com.example.SWPP.service.SurveyTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/survey-types")
public class SurveyTypeController {

    @Autowired
    private SurveyTypeService surveyTypeService;

    @GetMapping
    public List<SurveyTypeDTO> getAllTypes() {
        return surveyTypeService.getAllSurveyTypes().stream()
                .map(SurveyTypeMapper::toDTO)
                .collect(Collectors.toList());
    }

    @PostMapping
    public SurveyType create(@RequestBody SurveyType surveyType) {
        return surveyTypeService.createSurveyType(surveyType);
    }
}
