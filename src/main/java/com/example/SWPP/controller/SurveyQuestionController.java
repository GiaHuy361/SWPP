package com.example.SWPP.controller;

import com.example.SWPP.dto.SurveyQuestionDTO;
import com.example.SWPP.entity.SurveyQuestion;
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
@RequestMapping("/api/surveys/questions")
public class SurveyQuestionController {

    private static final Logger logger = LoggerFactory.getLogger(SurveyQuestionController.class);

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
    public ResponseEntity<?> createSurveyQuestion(@Valid @RequestBody SurveyQuestionDTO questionDTO, BindingResult bindingResult) {
        logger.info("Creating survey question: {}", questionDTO.getQuestionText());
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Validation failed: {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            SurveyQuestion question = surveyMapper.toSurveyQuestionEntity(questionDTO);
            SurveyQuestion createdQuestion = surveyService.createSurveyQuestion(question);
            SurveyQuestionDTO responseDTO = surveyMapper.toSurveyQuestionDTO(createdQuestion);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid input: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to create survey question: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Tạo câu hỏi khảo sát thất bại: " + e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_SURVEYS')")
    public ResponseEntity<?> getAllSurveyQuestions() {
        logger.info("Fetching all survey questions");
        try {
            List<SurveyQuestion> questions = surveyService.getAllSurveyQuestions();
            List<SurveyQuestionDTO> responseDTOs = questions.stream()
                    .map(surveyMapper::toSurveyQuestionDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            logger.error("Failed to fetch all survey questions: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy danh sách câu hỏi khảo sát thất bại"));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_SURVEYS')")
    public ResponseEntity<?> getSurveyQuestionById(@PathVariable Long id) {
        logger.info("Fetching survey question by id: {}", id);
        try {
            SurveyQuestion question = surveyService.getSurveyQuestionById(id);
            if (question == null) {
                logger.warn("Survey question not found for id: {}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Câu hỏi không tồn tại"));
            }
            SurveyQuestionDTO responseDTO = surveyMapper.toSurveyQuestionDTO(question);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            logger.error("Failed to fetch survey question for id={}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy thông tin câu hỏi thất bại"));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_SURVEYS')")
    public ResponseEntity<?> updateSurveyQuestion(@PathVariable Long id, @Valid @RequestBody SurveyQuestionDTO questionDTO, BindingResult bindingResult) {
        logger.info("Updating survey question with id: {}", id);
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Validation failed: {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            SurveyQuestion question = surveyMapper.toSurveyQuestionEntity(questionDTO);
            SurveyQuestion updatedQuestion = surveyService.updateSurveyQuestion(id, question);
            if (updatedQuestion == null) {
                logger.warn("Survey question not found for update: {}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Câu hỏi không tồn tại"));
            }
            SurveyQuestionDTO responseDTO = surveyMapper.toSurveyQuestionDTO(updatedQuestion);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            logger.error("Failed to update survey question with id={}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Cập nhật câu hỏi thất bại"));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_SURVEYS')")
    public ResponseEntity<?> deleteSurveyQuestion(@PathVariable Long id) {
        logger.info("Deleting survey question with id: {}", id);
        try {
            surveyService.deleteSurveyQuestion(id);
            return ResponseEntity.ok(Map.of("message", "Xóa câu hỏi thành công"));
        } catch (Exception e) {
            logger.error("Failed to delete survey question with id={}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Xóa câu hỏi thất bại"));
        }
    }
}