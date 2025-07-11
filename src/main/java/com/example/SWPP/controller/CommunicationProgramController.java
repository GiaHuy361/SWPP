package com.example.SWPP.controller;

import com.example.SWPP.dto.CommunicationProgramDTO;
import com.example.SWPP.dto.FeedbackDTO;
import com.example.SWPP.entity.CommunicationProgram;
import com.example.SWPP.entity.Feedback;
import com.example.SWPP.entity.User;
import com.example.SWPP.service.CommunicationProgramService;
import com.example.SWPP.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/communication")
public class CommunicationProgramController {

    private static final Logger logger = LoggerFactory.getLogger(CommunicationProgramController.class);
    private static final LocalDateTime CURRENT_TIME = LocalDateTime.of(2025, 7, 7, 14, 26);

    private final CommunicationProgramService communicationProgramService;
    private final UserRepository userRepository;

    public CommunicationProgramController(CommunicationProgramService communicationProgramService, UserRepository userRepository) {
        this.communicationProgramService = communicationProgramService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_PROGRAMS')")
    public ResponseEntity<?> createProgram(@Valid @RequestBody CommunicationProgramDTO dto, BindingResult bindingResult) {
        logger.info("Creating program: {}", dto.getTitle());
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldErrors().stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            logger.warn("Validation failed for program creation: {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            CommunicationProgram program = communicationProgramService.createProgram(dto, CURRENT_TIME);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("programId", program.getProgramId()));
        } catch (Exception e) {
            logger.error("Failed to create program: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Tạo chương trình thất bại: " + e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_PROGRAMS')")
    public ResponseEntity<?> getAllPrograms() {
        logger.info("Fetching all programs");
        try {
            List<CommunicationProgram> programs = communicationProgramService.getAllPrograms();
            List<Map<String, Object>> programList = new ArrayList<>();
            for (CommunicationProgram program : programs) {
                Map<String, Object> programMap = new HashMap<>();
                programMap.put("programId", program.getProgramId());
                programMap.put("title", program.getTitle());
                programMap.put("description", program.getDescription());
                programMap.put("participantCount", program.getParticipantCount());
                programMap.put("interactionCount", program.getInteractionCount());
                programMap.put("averageRating", program.getAverageRating());
                programMap.put("feedbackCount", program.getFeedbackCount());
                programMap.put("startDate", program.getStartDate());
                programMap.put("endDate", program.getEndDate());
                programMap.put("status", program.getStatus());
                programMap.put("createdAt", program.getCreatedAt());
                programMap.put("updatedAt", program.getUpdatedAt());
                programMap.put("activeProgramsCount", communicationProgramService.countActivePrograms(CURRENT_TIME));
                programMap.put("finalAverageRating", program.getFinalAverageRating());
                programList.add(programMap);
            }
            return ResponseEntity.ok(programList);
        } catch (Exception e) {
            logger.error("Failed to fetch all programs: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy danh sách chương trình thất bại"));
        }
    }

    @GetMapping("/{programId}")
    @PreAuthorize("hasAuthority('VIEW_PROGRAMS')")
    public ResponseEntity<?> getProgram(@PathVariable Long programId) {
        logger.info("Fetching program by id: {}", programId);
        try {
            CommunicationProgram program = communicationProgramService.getProgram(programId);
            if (program == null) {
                logger.warn("Program not found for id: {}", programId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Chương trình không tồn tại"));
            }
            Map<String, Object> response = new HashMap<>();
            response.put("programId", program.getProgramId());
            response.put("title", program.getTitle());
            response.put("description", program.getDescription());
            response.put("participantCount", program.getParticipantCount());
            response.put("interactionCount", program.getInteractionCount());
            response.put("averageRating", program.getAverageRating());
            response.put("feedbackCount", program.getFeedbackCount());
            response.put("startDate", program.getStartDate());
            response.put("endDate", program.getEndDate());
            response.put("status", program.getStatus());
            response.put("createdAt", program.getCreatedAt());
            response.put("updatedAt", program.getUpdatedAt());
            response.put("finalAverageRating", program.getFinalAverageRating());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to fetch program for id={}: {}", programId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy thông tin chương trình thất bại"));
        }
    }

    @GetMapping("/{programId}/participant-count")
    @PreAuthorize("hasAuthority('VIEW_PROGRAMS')")
    public ResponseEntity<?> getParticipantCount(@PathVariable Long programId) {
        logger.info("Fetching participant count for program id: {}", programId);
        try {
            int participantCount = communicationProgramService.countParticipants(programId);
            return ResponseEntity.ok(Map.of("programId", programId, "participantCount", participantCount));
        } catch (Exception e) {
            logger.error("Failed to fetch participant count for program id={}: {}", programId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy số lượng người tham gia thất bại: " + e.getMessage()));
        }
    }

    @PutMapping("/{programId}")
    @PreAuthorize("hasAuthority('MANAGE_PROGRAMS')")
    public ResponseEntity<?> updateProgram(@PathVariable Long programId, @Valid @RequestBody CommunicationProgramDTO dto, BindingResult bindingResult) {
        logger.info("Updating program with id: {}", programId);
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldErrors().stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            logger.warn("Validation failed for program update: {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            CommunicationProgram program = communicationProgramService.updateProgram(programId, dto, CURRENT_TIME);
            if (program == null) {
                logger.warn("Program not found for update: {}", programId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Chương trình không tồn tại"));
            }
            return ResponseEntity.ok(Map.of("programId", program.getProgramId()));
        } catch (Exception e) {
            logger.error("Failed to update program with id={}: {}", programId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Cập nhật chương trình thất bại: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{programId}")
    @PreAuthorize("hasAuthority('MANAGE_PROGRAMS')")
    public ResponseEntity<?> deleteProgram(@PathVariable Long programId) {
        logger.info("Deleting program with id: {}", programId);
        try {
            communicationProgramService.deleteProgram(programId);
            return ResponseEntity.ok(Map.of("message", "Xóa chương trình thành công"));
        } catch (Exception e) {
            logger.error("Failed to delete program with id={}: {}", programId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Xóa chương trình thất bại: " + e.getMessage()));
        }
    }

    @PostMapping("/feedback")
    @PreAuthorize("hasAuthority('VIEW_PROGRAMS')")
    public ResponseEntity<?> createFeedback(@Valid @RequestBody FeedbackDTO dto, BindingResult bindingResult) {
        logger.info("Creating feedback for programId: {}", dto.getProgramId());
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldErrors().stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            logger.warn("Validation failed for feedback creation: {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            Feedback feedback = communicationProgramService.createFeedback(dto, CURRENT_TIME);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("feedbackId", feedback.getFeedbackId(), "message", "Phản hồi đã được gửi thành công."));
        } catch (Exception e) {
            logger.error("Failed to create feedback: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Tạo phản hồi thất bại: " + e.getMessage()));
        }
    }

    @GetMapping("/feedback/{feedbackId}")
    @PreAuthorize("hasAuthority('VIEW_PROGRAMS')")
    public ResponseEntity<?> getFeedback(@PathVariable Long feedbackId) {
        logger.info("Fetching feedback by id: {}", feedbackId);
        try {
            Feedback feedback = communicationProgramService.getFeedback(feedbackId);
            if (feedback == null) {
                logger.warn("Feedback not found for id: {}", feedbackId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Phản hồi không tồn tại"));
            }
            Map<String, Object> response = new HashMap<>();
            response.put("feedbackId", feedback.getFeedbackId());
            response.put("programId", feedback.getProgram().getProgramId());
            response.put("userId", feedback.getUser().getUserId());
            response.put("rating", feedback.getRating());
            response.put("comment", feedback.getComment());
            response.put("createdAt", feedback.getCreatedAt());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to fetch feedback for id={}: {}", feedbackId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy thông tin phản hồi thất bại: " + e.getMessage()));
        }
    }

    @GetMapping("/feedbacks")
    @PreAuthorize("hasAuthority('VIEW_PROGRAMS')")
    public ResponseEntity<?> getAllFeedbacks() {
        logger.info("Fetching all feedbacks");
        try {
            List<Feedback> feedbacks = communicationProgramService.getAllFeedbacks();
            List<Map<String, Object>> feedbackList = new ArrayList<>();
            for (Feedback feedback : feedbacks) {
                Map<String, Object> feedbackMap = new HashMap<>();
                feedbackMap.put("feedbackId", feedback.getFeedbackId());
                feedbackMap.put("programId", feedback.getProgram().getProgramId());
                feedbackMap.put("userId", feedback.getUser().getUserId());
                feedbackMap.put("rating", feedback.getRating());
                feedbackMap.put("comment", feedback.getComment());
                feedbackMap.put("createdAt", feedback.getCreatedAt());
                feedbackList.add(feedbackMap);
            }
            return ResponseEntity.ok(feedbackList);
        } catch (Exception e) {
            logger.error("Failed to fetch all feedbacks: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy danh sách phản hồi thất bại: " + e.getMessage()));
        }
    }

    @PutMapping("/feedback/{feedbackId}")
    @PreAuthorize("hasAuthority('MANAGE_PROGRAMS')")
    public ResponseEntity<?> updateFeedback(@PathVariable Long feedbackId, @Valid @RequestBody FeedbackDTO dto, BindingResult bindingResult) {
        logger.info("Updating feedback with id: {}", feedbackId);
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldErrors().stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            logger.warn("Validation failed for feedback update: {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            Feedback feedback = communicationProgramService.updateFeedback(feedbackId, dto);
            if (feedback == null) {
                logger.warn("Feedback not found for update: {}", feedbackId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Phản hồi không tồn tại"));
            }
            return ResponseEntity.ok(Map.of("feedbackId", feedback.getFeedbackId()));
        } catch (Exception e) {
            logger.error("Failed to update feedback with id={}: {}", feedbackId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Cập nhật phản hồi thất bại: " + e.getMessage()));
        }
    }

    @DeleteMapping("/feedback/{feedbackId}")
    @PreAuthorize("hasAuthority('MANAGE_PROGRAMS')")
    public ResponseEntity<?> deleteFeedback(@PathVariable Long feedbackId) {
        logger.info("Deleting feedback with id: {}", feedbackId);
        try {
            communicationProgramService.deleteFeedback(feedbackId);
            return ResponseEntity.ok(Map.of("message", "Xóa phản hồi thành công"));
        } catch (Exception e) {
            logger.error("Failed to delete feedback with id={}: {}", feedbackId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Xóa phản hồi thất bại: " + e.getMessage()));
        }
    }

    @PostMapping("/{programId}/join")
    @PreAuthorize("hasAuthority('VIEW_PROGRAMS')")
    public ResponseEntity<?> joinProgram(@PathVariable Long programId, Authentication authentication) {
        logger.info("User attempting to join program with id: {}", programId);
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại với email: " + email));
            Long userId = user.getUserId();

            communicationProgramService.incrementParticipant(programId, userId, CURRENT_TIME);
            return ResponseEntity.status(HttpStatus.OK)
                    .body(Map.of("message", "Tham gia chương trình thành công! Kiểm tra email để xem giấy mời."));
        } catch (Exception e) {
            logger.error("Failed to join program with id={}: {}", programId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Tham gia chương trình thất bại: " + e.getMessage()));
        }
    }

    @GetMapping("/{programId}/summary")
    @PreAuthorize("hasAuthority('VIEW_PROGRAMS')")
    public ResponseEntity<?> getProgramSummary(@PathVariable Long programId) {
        logger.info("Fetching summary for program with id: {}", programId);
        try {
            CommunicationProgram program = communicationProgramService.getProgram(programId);
            if (program == null) {
                logger.warn("Program not found for id: {}", programId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Chương trình không tồn tại"));
            }
            Map<String, Object> response = new HashMap<>();
            response.put("programId", program.getProgramId());
            response.put("title", program.getTitle());
            response.put("participantCount", program.getParticipantCount());
            response.put("interactionCount", program.getInteractionCount());
            response.put("feedbackCount", program.getFeedbackCount());
            response.put("averageRating", program.getAverageRating());
            response.put("finalAverageRating", program.getFinalAverageRating());
            response.put("status", program.getStatus());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to fetch summary for program id={}: {}", programId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy thông tin tổng quan thất bại: " + e.getMessage()));
        }
    }
    /**
     * Lấy danh sách ID chương trình mà user đã tham gia
     */
    @GetMapping("/user/{userId}/joined-programs")
    public ResponseEntity<List<Long>> getUserJoinedPrograms(@PathVariable Long userId) {
        List<Long> joinedProgramIds = communicationProgramService.getUserJoinedProgramIds(userId);
        return ResponseEntity.ok(joinedProgramIds);
    }

    /**
     * Kiểm tra trạng thái tham gia của user đối với một chương trình
     */
    @GetMapping("/{programId}/participation-status")
    public ResponseEntity<Boolean> checkUserParticipation(
            @PathVariable Long programId,
            @RequestParam Long userId) {
        boolean hasJoined = communicationProgramService.hasUserJoinedProgram(userId, programId);
        return ResponseEntity.ok(hasJoined);
    }
}