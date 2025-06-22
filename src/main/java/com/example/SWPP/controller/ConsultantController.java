package com.example.SWPP.controller;

import com.example.SWPP.dto.ConsultantDTO;
import com.example.SWPP.dto.CreateConsultantRequest;
import com.example.SWPP.dto.UpdateConsultantRequest;
import com.example.SWPP.entity.Consultant;
import com.example.SWPP.service.ConsultantService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/consultants")
public class ConsultantController {

    private static final Logger logger = LoggerFactory.getLogger(ConsultantController.class);

    private final ConsultantService consultantService;

    public ConsultantController(ConsultantService consultantService) {
        this.consultantService = consultantService;
    }

    // Create: Tạo tư vấn viên
    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_CONSULTANTS')")
    public ResponseEntity<?> createConsultant(@Valid @RequestBody CreateConsultantRequest request) {
        logger.info("Creating consultant: userId={}, qualification={}, experienceYears={}",
                request.getUserId(), request.getQualification(), request.getExperienceYears());
        try {
            Consultant consultant = consultantService.createConsultant(
                    request.getUserId(),
                    request.getQualification(),
                    request.getExperienceYears()
            );
            return ResponseEntity.ok(Map.of("consultantId", consultant.getConsultantId(), "message", "Tạo tư vấn viên thành công"));
        } catch (Exception e) {
            logger.error("Failed to create consultant: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Tạo tư vấn viên thất bại: " + e.getMessage()));
        }
    }

    // Read: Lấy tất cả tư vấn viên
    @GetMapping
    @PreAuthorize("hasAuthority('MANAGE_CONSULTANTS') or hasAuthority('MANAGE_APPOINTMENTS')")
    public ResponseEntity<?> getAllConsultants() {
        logger.info("Fetching all consultants");
        try {
            List<ConsultantDTO> consultants = consultantService.getAllConsultants();
            return ResponseEntity.ok(consultants);
        } catch (Exception e) {
            logger.error("Failed to fetch all consultants: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy danh sách thất bại"));
        }
    }

    // Read: Lấy tư vấn viên theo ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_CONSULTANTS') or hasAuthority('MANAGE_APPOINTMENTS')")
    public ResponseEntity<?> getConsultantById(@PathVariable Long id) {
        logger.info("Fetching consultant by id: {}", id);
        try {
            ConsultantDTO consultant = consultantService.getConsultantById(id)
                    .orElseThrow(() -> new RuntimeException("Tư vấn viên không tồn tại"));
            return ResponseEntity.ok(consultant);
        } catch (Exception e) {
            logger.error("Failed to fetch consultant: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy tư vấn viên"));
        }
    }

    // Update: Cập nhật tư vấn viên
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_CONSULTANTS')")
    public ResponseEntity<?> updateConsultant(@PathVariable Long id, @Valid @RequestBody UpdateConsultantRequest request) {
        logger.info("Updating consultant: id={}, qualification={}, experienceYears={}, isActive={}, fullName={}, email={}, phone={}",
                id, request.getQualification(), request.getExperienceYears(), request.getIsActive(), request.getFullName(), request.getEmail(), request.getPhone());
        try {
            ConsultantDTO consultant = consultantService.updateConsultant(
                    id,
                    request.getQualification(),
                    request.getExperienceYears(),
                    request.getIsActive(),
                    request.getFullName(),
                    request.getEmail(),
                    request.getPhone()
            );
            return ResponseEntity.ok(Map.of("consultantId", consultant.getConsultantId(), "message", "Cập nhật thành công"));
        } catch (Exception e) {
            logger.error("Failed to update consultant: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Cập nhật thất bại: " + e.getMessage()));
        }
    }

    // Delete: Xóa tư vấn viên
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_CONSULTANTS')")
    public ResponseEntity<?> deleteConsultant(@PathVariable Long id) {
        logger.info("Deleting consultant: id={}", id);
        try {
            consultantService.deleteConsultant(id);
            return ResponseEntity.ok(Map.of("message", "Xóa tư vấn viên thành công"));
        } catch (Exception e) {
            logger.error("Failed to delete consultant: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Xóa tư vấn viên thất bại"));
        }
    }
}