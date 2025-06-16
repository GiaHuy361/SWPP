package com.example.SWPP.controller;

import com.example.SWPP.dto.SurveyTypeDTO;
import com.example.SWPP.entity.SurveyType;
import com.example.SWPP.mapper.SurveyMapper;
import com.example.SWPP.service.SurveyService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/surveys/types")
public class SurveyTypeController {

    private static final Logger logger = LoggerFactory.getLogger(SurveyTypeController.class);

    @Autowired
    private SurveyService surveyService;

    @Autowired
    private SurveyMapper surveyMapper;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_SURVEYS')")
    public ResponseEntity<?> createSurveyType(@Valid @RequestBody SurveyTypeDTO surveyTypeDTO, BindingResult bindingResult) {
        logger.info("Creating survey type: {}", surveyTypeDTO.getName());
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Validation failed for survey type creation: {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            // Validate riskThresholds JSON
            objectMapper.readValue(surveyTypeDTO.getRiskThresholds(), Map.class);
            SurveyType surveyType = surveyMapper.toSurveyTypeEntity(surveyTypeDTO);
            SurveyType createdSurveyType = surveyService.createSurveyType(surveyType);
            SurveyTypeDTO responseDTO = surveyMapper.toSurveyTypeDTO(createdSurveyType);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (Exception e) {
            logger.error("Failed to create survey type: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Tạo loại khảo sát thất bại: " + e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_SURVEYS')")
    public ResponseEntity<?> getAllSurveyTypes() {
        logger.info("Fetching all survey types");
        try {
            List<SurveyType> surveyTypes = surveyService.getAllSurveyTypes();
            List<SurveyTypeDTO> responseDTOs = surveyTypes.stream()
                    .map(surveyMapper::toSurveyTypeDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            logger.error("Failed to fetch survey types: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy danh sách loại khảo sát thất bại"));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_SURVEYS')")
    public ResponseEntity<?> getSurveyTypeById(@PathVariable Long id) {
        logger.info("Fetching survey type by id: {}", id);
        try {
            SurveyType surveyType = surveyService.getSurveyTypeById(id);
            SurveyTypeDTO responseDTO = surveyMapper.toSurveyTypeDTO(surveyType);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            logger.error("Failed to fetch survey type for id={}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Loại khảo sát không tồn tại"));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_SURVEYS')")
    public ResponseEntity<?> updateSurveyType(@PathVariable Long id, @Valid @RequestBody SurveyTypeDTO surveyTypeDTO, BindingResult bindingResult) {
        logger.info("Updating survey type with id: {}", id);
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Validation failed for survey type update: {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            // Validate riskThresholds JSON
            objectMapper.readValue(surveyTypeDTO.getRiskThresholds(), Map.class);
            SurveyType surveyType = surveyMapper.toSurveyTypeEntity(surveyTypeDTO);
            SurveyType updatedSurveyType = surveyService.updateSurveyType(id, surveyType);
            SurveyTypeDTO responseDTO = surveyMapper.toSurveyTypeDTO(updatedSurveyType);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            logger.error("Failed to update survey type with id={}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Cập nhật loại khảo sát thất bại: " + e.getMessage()));
        }
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_SURVEYS')")
    public ResponseEntity<?> deleteSurveyType(@PathVariable Long id) {
        logger.info("Deleting survey type with id: {}", id);
        try {
            surveyService.deleteSurveyType(id);
            return ResponseEntity.ok(Map.of("message", "Xóa loại khảo sát thành công"));
        } catch (Exception e) {
            logger.error("Failed to delete survey type with id={}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Xóa loại khảo sát thất bại"));
        }
    }
}