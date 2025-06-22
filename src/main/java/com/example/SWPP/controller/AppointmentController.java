package com.example.SWPP.controller;

import com.example.SWPP.dto.AppointmentDTO;
import com.example.SWPP.dto.CreateAppointmentRequest;
import com.example.SWPP.dto.UpdateAppointmentRequest;
import com.example.SWPP.entity.Appointment;
import com.example.SWPP.service.AppointmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentController.class);

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    // Create: Đặt lịch hẹn
    @PostMapping
    @PreAuthorize("hasAuthority('BOOK_APPOINTMENTS')")
    public ResponseEntity<?> createAppointment(
            @Valid @RequestBody CreateAppointmentRequest request,
            Authentication authentication) {
        logger.info("Creating appointment: userId={}, consultantId={}, time={}",
                request.getUserId(), request.getConsultantId(), request.getAppointmentTime());
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Chưa xác thực"));
            }
            Appointment appointment = appointmentService.createAppointment(
                    request.getUserId(),
                    request.getConsultantId(),
                    request.getAppointmentTime()
            );
            return ResponseEntity.ok(Map.of("appointmentId", appointment.getAppointmentId(), "message", "Đặt lịch thành công"));
        } catch (Exception e) {
            logger.error("Failed to create appointment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Đặt lịch thất bại: " + e.getMessage()));
        }
    }

    // Read: Lấy tất cả lịch hẹn
    @GetMapping
    @PreAuthorize("hasAuthority('MANAGE_APPOINTMENTS') or hasAuthority('BOOK_APPOINTMENTS')")
    public ResponseEntity<?> getAllAppointments(Authentication authentication) {
        logger.info("Fetching all appointments");
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Chưa xác thực"));
            }
            List<AppointmentDTO> appointments = appointmentService.getAllAppointments();
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            logger.error("Failed to fetch all appointments: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy danh sách thất bại"));
        }
    }

    // Read: Lấy lịch hẹn theo ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_APPOINTMENTS') or hasAuthority('BOOK_APPOINTMENTS')")
    public ResponseEntity<?> getAppointmentById(@PathVariable Long id, Authentication authentication) {
        logger.info("Fetching appointment by id: {}", id);
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Chưa xác thực"));
            }
            String currentUserEmail = authentication.getName();
            AppointmentDTO appointment = appointmentService.getAppointmentById(id)
                    .orElseThrow(() -> new RuntimeException("Lịch hẹn không tồn tại"));
            // Kiểm tra quyền truy cập
            boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_Admin"));
            boolean isConsultant = appointment.getConsultantEmail().equals(currentUserEmail);
            boolean isUser = appointment.getUserEmail().equals(currentUserEmail);
            if (!isAdmin && !isConsultant && !isUser) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Bạn không có quyền xem lịch hẹn này"));
            }
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            logger.error("Failed to fetch appointment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy lịch hẹn"));
        }
    }

    // Update: Cập nhật hoặc xác nhận lịch hẹn
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_APPOINTMENTS')")
    public ResponseEntity<?> updateAppointment(@PathVariable Long id, @Valid @RequestBody UpdateAppointmentRequest request) {
        logger.info("Updating appointment: id={}, status={}", id, request.getStatus());
        try {
            AppointmentDTO updatedAppointment = appointmentService.updateAppointment(id, request);
            return ResponseEntity.ok(Map.of("appointmentId", updatedAppointment.getAppointmentId(), "message", "Cập nhật thành công"));
        } catch (Exception e) {
            logger.error("Failed to update appointment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Cập nhật thất bại: " + e.getMessage()));
        }
    }

    // Delete: Xóa lịch hẹn
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_APPOINTMENTS') or hasRole('Admin')")
    public ResponseEntity<?> deleteAppointment(@PathVariable Long id) {
        logger.info("Deleting appointment: id={}", id);
        try {
            appointmentService.deleteAppointment(id);
            return ResponseEntity.ok(Map.of("message", "Xóa lịch hẹn thành công"));
        } catch (Exception e) {
            logger.error("Failed to delete appointment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Xóa lịch hẹn thất bại"));
        }
    }
}