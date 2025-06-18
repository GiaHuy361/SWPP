package com.example.SWPP.controller;

import com.example.SWPP.dto.SurveyResponseDTO;
import com.example.SWPP.entity.SurveyQuestion;
import com.example.SWPP.entity.SurveyResponse;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.UserRepository;
import com.example.SWPP.service.SurveyResponseService;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/surveys/responses")
public class SurveyResponseController {

    private static final Logger logger = LoggerFactory.getLogger(SurveyResponseController.class);

    @Autowired
    private SurveyResponseService surveyResponseService;

    @Autowired
    private SurveyService surveyService;

    @Autowired
    private SurveyMapper surveyMapper;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            logger.warn("Unauthorized access attempt: No authenticated user");
            return null;
        }
        String email = auth.getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('VIEW_SURVEYS')")
    public ResponseEntity<?> createSurveyResponse(@Valid @RequestBody SurveyResponseDTO responseDTO, BindingResult bindingResult) {
        logger.info("Creating survey response for user");
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Chưa xác thực người dùng"));
        }
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Validation failed for survey response creation: {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            responseDTO.setUserId(user.getUserId());
            SurveyResponse response = surveyMapper.toSurveyResponseEntity(responseDTO);
            SurveyResponse createdResponse = surveyResponseService.createSurveyResponse(response);
            Map<String, Object> result = surveyResponseService.calculateScore(createdResponse.getId());
            SurveyResponseDTO responseDTOOut = surveyMapper.toSurveyResponseDTO(createdResponse);
            responseDTOOut.setTotalScore((Integer) result.get("totalScore"));
            responseDTOOut.setRiskLevel((String) result.get("riskLevel"));
            logger.info("Survey response created successfully: id={}", createdResponse.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTOOut);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid input for survey response creation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Tạo phản hồi thất bại: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to create survey response: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Tạo phản hồi thất bại: " + e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_SURVEYS')")
    public ResponseEntity<?> getAllSurveyResponses() {
        logger.info("Fetching all survey responses");
        try {
            List<SurveyResponse> responses = surveyResponseService.getAllSurveyResponses();
            logger.debug("Found {} survey responses", responses.size());
            List<SurveyResponseDTO> responseDTOs = responses.stream()
                    .map(surveyMapper::toSurveyResponseDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            logger.error("Failed to fetch all survey responses: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy danh sách phản hồi thất bại"));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_SURVEYS')")
    public ResponseEntity<?> getSurveyResponseById(@PathVariable Long id) {
        logger.info("Fetching survey response by id: {}", id);
        try {
            SurveyResponse response = surveyResponseService.getSurveyResponseById(id);
            logger.debug("Found survey response: id={}, surveyId={}", response.getId(), response.getSurvey().getId());
            SurveyResponseDTO responseDTO = surveyMapper.toSurveyResponseDTO(response);
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            logger.warn("Survey response not found for id: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to fetch survey response for id={}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy thông tin phản hồi thất bại: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_SURVEYS')")
    public ResponseEntity<?> updateSurveyResponse(@PathVariable Long id, @Valid @RequestBody SurveyResponseDTO responseDTO, BindingResult bindingResult) {
        logger.info("Updating survey response with id: {}", id);
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Chưa xác thực người dùng"));
        }
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Validation failed for survey response update: {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            responseDTO.setUserId(user.getUserId());
            SurveyResponse response = surveyMapper.toSurveyResponseEntity(responseDTO);
            SurveyResponse updatedResponse = surveyResponseService.updateSurveyResponse(id, response);
            SurveyResponseDTO responseDTOOut = surveyMapper.toSurveyResponseDTO(updatedResponse);
            logger.info("Survey response updated successfully: id={}", updatedResponse.getId());
            return ResponseEntity.ok(responseDTOOut);
        } catch (RuntimeException e) {
            logger.warn("Survey response not found for update: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to update survey response with id={}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Cập nhật phản hồi thất bại: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_SURVEYS')")
    public ResponseEntity<?> deleteSurveyResponse(@PathVariable Long id) {
        logger.info("Deleting survey response with id: {}", id);
        try {
            surveyResponseService.deleteSurveyResponse(id);
            logger.info("Survey response deleted successfully: id={}", id);
            return ResponseEntity.ok(Map.of("message", ""));
        } catch (RuntimeException e) {
            logger.warn("Survey response not found for deletion: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to delete survey response with id={}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Xóa phản hồi thất bại: " + e.getMessage()));
        }
    }

    @GetMapping("/result/{responseId}")
    @PreAuthorize("hasAuthority('VIEW_SURVEYS')")
    public ResponseEntity<?> getSurveyResult(@PathVariable Long responseId) {
        logger.info("Fetching survey result for responseId: {}", responseId);
        try {
            Map<String, Object> result = surveyResponseService.calculateScore(responseId);
            logger.debug("Calculated result: {}", result);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            logger.warn("Survey response not found for result: {}", responseId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to calculate score for responseId={}: {}", responseId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Tính điểm thất bại: " + e.getMessage()));
        }
    }

    @GetMapping("/user")
    @PreAuthorize("hasAuthority('VIEW_SURVEYS')")
    public ResponseEntity<?> getUserResponsesAndAnalysis(@RequestParam(required = false) Long surveyId) {
        logger.info("Fetching user responses and analysis for surveyId: {}", surveyId);
        User user = getCurrentUser();
        if (user == null) {
            logger.warn("Unauthorized access attempt");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Chưa xác thực người dùng"));
        }
        try {
            Long resolvedSurveyId = resolveDefaultSurveyId(user, surveyId);
            if (resolvedSurveyId == null) {
                logger.warn("No valid surveyId found for user: userId={}", user.getUserId());
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Không tìm thấy khảo sát hợp lệ cho người dùng"));
            }

            SurveyResponse latestResponse = surveyResponseService.getAllSurveyResponses().stream()
                    .filter(r -> r.getUser().getUserId().equals(user.getUserId()) && r.getSurvey().getId().equals(resolvedSurveyId))
                    .findFirst().orElse(null);
            if (latestResponse == null) {
                logger.warn("No responses found for surveyId={} and userId={}", resolvedSurveyId, user.getUserId());
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Không tìm thấy phản hồi cho khảo sát và người dùng"));
            }

            var survey = surveyService.getSurveyById(resolvedSurveyId);
            List<Long> questionIds = survey.getQuestions().stream()
                    .map(SurveyQuestion::getId)
                    .collect(Collectors.toList());
            if (questionIds.isEmpty()) {
                logger.warn("Survey has no questions: surveyId={}", resolvedSurveyId);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Khảo sát phải có ít nhất một câu hỏi"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("responses", surveyResponseService.getAllSurveyResponses().stream()
                    .filter(r -> r.getUser().getUserId().equals(user.getUserId()) && r.getSurvey().getId().equals(resolvedSurveyId))
                    .map(SurveyResponse::getId)
                    .collect(Collectors.toList()));
            response.put("addictionLevel", surveyResponseService.evaluateAddictionLevel(resolvedSurveyId, user));
            logger.info("User responses and analysis fetched successfully: surveyId={}, userId={}", resolvedSurveyId, user.getUserId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.warn("Survey not found or error: surveyId={}, error={}", surveyId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to fetch user responses and analysis for surveyId={}: {}", surveyId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy thông tin phản hồi và phân tích thất bại: " + e.getMessage()));
        }
    }

    private Long resolveDefaultSurveyId(User user, Long surveyId) {
        if (surveyId != null) {
            return surveyId;
        }
        List<SurveyResponse> userResponses = surveyResponseService.getAllSurveyResponses().stream()
                .filter(r -> r.getUser().getUserId().equals(user.getUserId()))
                .collect(Collectors.toList());
        if (userResponses.isEmpty()) {
            return null;
        }
        return userResponses.get(0).getSurvey().getId();
    }
}