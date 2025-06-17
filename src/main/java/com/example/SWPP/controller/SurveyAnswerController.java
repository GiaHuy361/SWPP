package com.example.SWPP.controller;

import com.example.SWPP.dto.SurveyAnswerDTO;
import com.example.SWPP.entity.SurveyAnswer;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.UserRepository;
import com.example.SWPP.service.SurveyAnswerService;
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
@RequestMapping("/api/surveys/answers")
public class SurveyAnswerController {

    private static final Logger logger = LoggerFactory.getLogger(SurveyAnswerController.class);

    @Autowired
    private SurveyAnswerService surveyAnswerService;

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
    @PreAuthorize("hasAuthority('VIEW_SURVEYS')")
    public ResponseEntity<?> createSurveyAnswer(@Valid @RequestBody SurveyAnswerDTO answerDTO, BindingResult bindingResult) {
        logger.info("Creating survey answer for user");
        User user = getCurrentUser();
        if (user == null) {
            logger.warn("Unauthorized access attempt");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Chưa xác thực người dùng"));
        }
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Validation failed for survey answer creation: {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            SurveyAnswer answer = surveyMapper.toSurveyAnswerEntity(answerDTO);
            SurveyAnswer createdAnswer = surveyAnswerService.createSurveyAnswer(answer);
            SurveyAnswerDTO responseDTO = surveyMapper.toSurveyAnswerDTO(createdAnswer);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (Exception e) {
            logger.error("Failed to create survey answer: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Tạo câu trả lời thất bại"));
        }
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_SURVEYS')")
    public ResponseEntity<?> getAllSurveyAnswers() {
        logger.info("Fetching all survey answers");
        try {
            List<SurveyAnswer> answers = surveyAnswerService.getAllSurveyAnswers();
            List<SurveyAnswerDTO> responseDTOs = answers.stream()
                    .map(surveyMapper::toSurveyAnswerDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            logger.error("Failed to fetch all survey answers: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy danh sách câu trả lời thất bại"));
        }
    }

    @GetMapping(params = "responseId")
    @PreAuthorize("hasAuthority('VIEW_SURVEYS')")
    public ResponseEntity<?> getSurveyAnswersByResponseId(@RequestParam Long responseId) {
        logger.info("Fetching survey answers for response id: {}", responseId);
        try {
            List<SurveyAnswer> answers = surveyAnswerService.getSurveyAnswersByResponseId(responseId);
            List<SurveyAnswerDTO> responseDTOs = answers.stream()
                    .map(surveyMapper::toSurveyAnswerDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            logger.error("Failed to fetch survey answers for responseId={}: {}", responseId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy danh sách câu trả lời thất bại"));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_SURVEYS')")
    public ResponseEntity<?> getSurveyAnswerById(@PathVariable Long id) {
        logger.info("Fetching survey answer by id: {}", id);
        try {
            SurveyAnswer answer = surveyAnswerService.getSurveyAnswerById(id);
            if (answer == null) {
                logger.warn("Survey answer not found for id: {}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Câu trả lời không tồn tại"));
            }
            SurveyAnswerDTO responseDTO = surveyMapper.toSurveyAnswerDTO(answer);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            logger.error("Failed to fetch survey answer for id={}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy thông tin câu trả lời thất bại"));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_SURVEYS')")
    public ResponseEntity<?> updateSurveyAnswer(@PathVariable Long id, @Valid @RequestBody SurveyAnswerDTO answerDTO, BindingResult bindingResult) {
        logger.info("Updating survey answer with id: {}", id);
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Validation failed for survey answer update: {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            SurveyAnswer answer = surveyMapper.toSurveyAnswerEntity(answerDTO);
            SurveyAnswer updatedAnswer = surveyAnswerService.updateSurveyAnswer(id, answer);
            if (updatedAnswer == null) {
                logger.warn("Survey answer not found for update: {}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Câu trả lời không tồn tại"));
            }
            SurveyAnswerDTO responseDTO = surveyMapper.toSurveyAnswerDTO(updatedAnswer);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            logger.error("Failed to update survey answer with id={}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Cập nhật câu trả lời thất bại"));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_SURVEYS')")
    public ResponseEntity<?> deleteSurveyAnswer(@PathVariable Long id) {
        logger.info("Deleting survey answer with id: {}", id);
        try {
            surveyAnswerService.deleteSurveyAnswer(id);
            return ResponseEntity.ok(Map.of("message", "Xóa câu trả lời thành công"));
        } catch (Exception e) {
            logger.error("Failed to delete survey answer with id={}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Xóa câu trả lời thất bại"));
        }
    }
}