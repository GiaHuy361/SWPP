
        package com.example.SWPP.controller;

import com.example.SWPP.dto.NotificationDTO;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.UserRepository;
import com.example.SWPP.service.NotificationService;
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

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    @Autowired
    private NotificationService notificationService;

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
    @PreAuthorize("hasAuthority('MANAGE_NOTIFICATIONS')")
    public ResponseEntity<?> createNotification(@Valid @RequestBody NotificationDTO notificationDTO, BindingResult bindingResult) {
        logger.info("Creating notification");
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Validation failed for notification creation: {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            Boolean isSystemNotification = notificationDTO.getIsSystemNotification() != null ? notificationDTO.getIsSystemNotification() : false;
            List<NotificationDTO> createdNotifications = notificationService.createNotification(notificationDTO, isSystemNotification);
            if (isSystemNotification) {
                return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Tạo thông báo hệ thống thành công", "notifications", createdNotifications));
            } else {
                return ResponseEntity.status(HttpStatus.CREATED).body(createdNotifications.get(0));
            }
        } catch (IllegalArgumentException e) {
            logger.error("Failed to create notification: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Tạo thông báo thất bại: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to create notification: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Tạo thông báo thất bại: " + e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_NOTIFICATIONS')")
    public ResponseEntity<?> getAllNotifications() {
        logger.info("Fetching all notifications for user");
        User user = getCurrentUser();
        if (user == null) {
            logger.warn("Unauthorized access attempt");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Chưa xác thực người dùng"));
        }
        try {
            List<NotificationDTO> notifications = notificationService.getUserNotifications(user.getUserId());
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            logger.error("Failed to fetch notifications: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy danh sách thông báo thất bại"));
        }
    }

    @GetMapping("/unread")
    @PreAuthorize("hasAuthority('VIEW_NOTIFICATIONS')")
    public ResponseEntity<?> getUnreadNotifications() {
        logger.info("Fetching unread notifications for user");
        User user = getCurrentUser();
        if (user == null) {
            logger.warn("Unauthorized access attempt");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Chưa xác thực người dùng"));
        }
        try {
            List<NotificationDTO> notifications = notificationService.getUnreadUserNotifications(user.getUserId());
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            logger.error("Failed to fetch unread notifications: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy danh sách thông báo chưa đọc thất bại"));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_NOTIFICATIONS')")
    public ResponseEntity<?> getNotificationById(@PathVariable Long id) {
        logger.info("Fetching notification by id: {}", id);
        User user = getCurrentUser();
        if (user == null) {
            logger.warn("Unauthorized access attempt");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Chưa xác thực người dùng"));
        }
        try {
            NotificationDTO notification = notificationService.getUserNotifications(user.getUserId()).stream()
                    .filter(n -> n.getNotificationId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Thông báo không tồn tại hoặc không thuộc về người dùng"));
            return ResponseEntity.ok(notification);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to fetch notification: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to fetch notification: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy thông báo thất bại"));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_NOTIFICATIONS')")
    public ResponseEntity<?> updateNotification(@PathVariable Long id, @Valid @RequestBody NotificationDTO notificationDTO, BindingResult bindingResult) {
        logger.info("Updating notification with id: {}", id);
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Validation failed for notification update: {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            NotificationDTO updatedNotification = notificationService.updateNotification(id, notificationDTO);
            return ResponseEntity.ok(updatedNotification);
        } catch (IllegalArgumentException e) {
            logger.error("Failed to update notification: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to update notification: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Cập nhật thông báo thất bại"));
        }
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasAuthority('VIEW_NOTIFICATIONS')")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable Long id) {
        logger.info("Marking notification as read: id={}", id);
        User user = getCurrentUser();
        if (user == null) {
            logger.warn("Unauthorized access attempt");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Chưa xác thực người dùng"));
        }
        try {
            NotificationDTO notification = notificationService.getUserNotifications(user.getUserId()).stream()
                    .filter(n -> n.getNotificationId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Thông báo không tồn tại hoặc không thuộc về người dùng"));
            notificationService.markAsRead(id);
            return ResponseEntity.ok(Map.of("message", "Đánh dấu thông báo đã đọc thành công"));
        } catch (IllegalArgumentException e) {
            logger.error("Failed to mark notification as read: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to mark notification as read: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Đánh dấu thông báo đã đọc thất bại"));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_NOTIFICATIONS')")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        logger.info("Deleting notification with id: {}", id);
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.ok(Map.of("message", "Xóa thông báo thành công"));
        } catch (IllegalArgumentException e) {
            logger.error("Failed to delete notification: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to delete notification: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Xóa thông báo thất bại"));
        }
    }
}
