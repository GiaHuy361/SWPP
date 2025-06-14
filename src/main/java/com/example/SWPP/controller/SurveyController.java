package com.example.SWPP.controller;

import com.example.SWPP.dto.SurveyDTO;
import com.example.SWPP.entity.Survey;
import com.example.SWPP.mapper.SurveyMapper;
import com.example.SWPP.service.SurveyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/surveys")
public class SurveyController {

    @Autowired
    private SurveyService surveyService;

    @GetMapping
    public List<SurveyDTO> getAllSurveys() {
        return surveyService.getAllSurveys().stream()
                .map(SurveyMapper::toDTO)
                .collect(Collectors.toList());
    }

    @PostMapping
    public Survey createSurvey(@RequestBody Survey survey) {
        return surveyService.createSurvey(survey);
    }
}
