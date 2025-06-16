package com.example.SWPP.controller;

import com.example.SWPP.dto.SurveyDTO;
import com.example.SWPP.entity.Survey;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.UserRepository;
import com.example.SWPP.service.SurveyService;
import com.example.SWPP.mapper.SurveyMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/surveys")
public class SurveyController {

    private static final Logger logger = LoggerFactory.getLogger(SurveyController.class);

    @Autowired
    private SurveyService surveyService;

    @Autowired
    private SurveyMapper surveyMapper;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return null;
        }
        String email = auth.getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_SURVEYS')")
    public ResponseEntity<?> createSurvey(@Valid @RequestBody SurveyDTO surveyDTO, BindingResult bindingResult) {
        logger.info("Creating survey: {}", surveyDTO.getTitle());
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Validation failed for survey creation: {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            Survey survey = surveyMapper.toSurveyEntity(surveyDTO);
            Survey createdSurvey = surveyService.createSurvey(survey);
            SurveyDTO responseDTO = surveyMapper.toSurveyDTO(createdSurvey);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (Exception e) {
            logger.error("Failed to create survey: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Tạo khảo sát thất bại"));
        }
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_SURVEYS')")
    public ResponseEntity<?> getAllSurveys() {
        logger.info("Fetching all surveys");
        try {
            List<Survey> surveys = surveyService.getAllSurveys();
            List<SurveyDTO> responseDTOs = surveys.stream()
                    .map(surveyMapper::toSurveyDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            logger.error("Failed to fetch all surveys: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy danh sách khảo sát thất bại"));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_SURVEYS')")
    public ResponseEntity<?> getSurveyById(@PathVariable Long id) {
        logger.info("Fetching survey by id: {}", id);
        try {
            Survey survey = surveyService.getSurveyById(id);
            if (survey == null) {
                logger.warn("Survey not found for id: {}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Khảo sát không tồn tại"));
            }
            SurveyDTO responseDTO = surveyMapper.toSurveyDTO(survey);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            logger.error("Failed to fetch survey for id={}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy thông tin khảo sát thất bại"));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_SURVEYS')")
    public ResponseEntity<?> updateSurvey(@PathVariable Long id, @Valid @RequestBody SurveyDTO surveyDTO, BindingResult bindingResult) {
        logger.info("Updating survey with id: {}", id);
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Validation failed for survey update: {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            Survey survey = surveyMapper.toSurveyEntity(surveyDTO);
            Survey updatedSurvey = surveyService.updateSurvey(id, survey);
            if (updatedSurvey == null) {
                logger.warn("Survey not found for update: {}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Khảo sát không tồn tại"));
            }
            SurveyDTO responseDTO = surveyMapper.toSurveyDTO(updatedSurvey);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            logger.error("Failed to update survey with id={}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Cập nhật khảo sát thất bại"));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_SURVEYS')")
    public ResponseEntity<?> deleteSurvey(@PathVariable Long id) {
        logger.info("Deleting survey with id: {}", id);
        try {
            surveyService.deleteSurvey(id);
            return ResponseEntity.ok(Map.of("message", "Xóa khảo sát thành công"));
        } catch (Exception e) {
            logger.error("Failed to delete survey with id={}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Xóa khảo sát thất bại"));
        }
    }
}