package com.example.SWPP.controller;

import com.example.SWPP.dto.SurveyOptionDTO;
import com.example.SWPP.entity.SurveyOption;
import com.example.SWPP.service.SurveyService;
import com.example.SWPP.mapper.SurveyMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/surveys/options")
public class SurveyOptionController {

    private static final Logger logger = LoggerFactory.getLogger(SurveyOptionController.class);

    @Autowired
    private SurveyService surveyService;

    @Autowired
    private SurveyMapper surveyMapper;

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_SURVEYS')")
    public ResponseEntity<?> getSurveyOptionById(@PathVariable Long id) {
        logger.info("Fetching survey option by id: {}", id);
        try {
            SurveyOption option = surveyService.getSurveyOptionById(id);
            SurveyOptionDTO responseDTO = surveyMapper.toSurveyOptionDTO(option);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            logger.error("Failed to fetch survey option for id={}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Lựa chọn không tồn tại"));
        }
    }
}