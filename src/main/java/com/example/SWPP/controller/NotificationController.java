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
import java.util.Optional;
import java.util.stream.Collectors;

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

    // Endpoint để lấy userId từ email
    @GetMapping("/user-id/{email}")
    @PreAuthorize("hasAuthority('SEND_NOTIFICATION')")
    public ResponseEntity<?> getUserIdByEmail(@PathVariable String email) {
        logger.info("Tìm userId cho email: {}", email);
        try {
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (!userOptional.isPresent()) {
                logger.warn("Không tìm thấy người dùng với email: {}", email);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Không tìm thấy người dùng"));
            }
            User user = userOptional.get();
            return ResponseEntity.ok(Map.of("userId", user.getUserId()));
        } catch (Exception e) {
            logger.error("Lỗi khi tìm userId cho email {}: {}", email, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi hệ thống"));
        }
    }

    // Endpoint mới để lấy danh sách người dùng
    @GetMapping("/users")
    @PreAuthorize("hasAuthority('SEND_NOTIFICATION')")
    public ResponseEntity<?> getAllUsers() {
        logger.info("Lấy danh sách tất cả người dùng");
        try {
            List<User> users = userRepository.findAll();
            logger.info("Found {} users", users.size());
            List<Map<String, Object>> userList = users.stream().map(user -> {
                Map<String, Object> userMap = new java.util.HashMap<>();
                userMap.put("userId", user.getUserId());
                userMap.put("email", user.getEmail() != null ? user.getEmail() : "");
                userMap.put("username", user.getUsername() != null ? user.getUsername() : "");
                userMap.put("fullName", user.getFullName() != null ? user.getFullName() : "");
                userMap.put("phone", user.getPhone() != null ? user.getPhone() : "");
                userMap.put("role", user.getRole() != null ? user.getRole().getRoleName() : "Guest");
                return userMap;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(userList);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy danh sách người dùng: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy danh sách người dùng thất bại"));
        }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_NOTIFICATIONS')")
    public ResponseEntity<?> createNotification(@Valid @RequestBody NotificationDTO notificationDTO, BindingResult bindingResult) {
        logger.info("Tạo thông báo");
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Lỗi xác thực khi tạo thông báo: {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            Boolean isSystemNotification = notificationDTO.getIsSystemNotification() != null ? notificationDTO.getIsSystemNotification() : false;
            List<NotificationDTO> createdNotifications;
            if (!isSystemNotification && notificationDTO.getUserId() != null) {
                createdNotifications = List.of(notificationService.createSingleNotification(notificationDTO));
            } else {
                createdNotifications = notificationService.createNotification(notificationDTO, isSystemNotification);
            }
            if (isSystemNotification) {
                return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Tạo thông báo hệ thống thành công", "notifications", createdNotifications));
            } else {
                return ResponseEntity.status(HttpStatus.CREATED).body(createdNotifications.get(0));
            }
        } catch (IllegalArgumentException e) {
            logger.error("Lỗi khi tạo thông báo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Tạo thông báo thất bại: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Lỗi khi tạo thông báo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Tạo thông báo thất bại: " + e.getMessage()));
        }
    }

    @PostMapping("/send")
    @PreAuthorize("hasAuthority('SEND_NOTIFICATION')")
    public ResponseEntity<?> sendNotification(@RequestBody NotificationDTO notificationDTO, BindingResult bindingResult) {
        logger.info("Gửi thông báo với quyền SEND_NOTIFICATION");
        // Bỏ @Valid để cho phép userId: null cho thông báo hệ thống
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Lỗi xác thực khi gửi thông báo: {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            Boolean isSystemNotification = notificationDTO.getIsSystemNotification() != null ? notificationDTO.getIsSystemNotification() : false;
            List<NotificationDTO> createdNotifications;
            if (!isSystemNotification && notificationDTO.getUserId() != null) {
                createdNotifications = List.of(notificationService.createSingleNotification(notificationDTO));
            } else if (isSystemNotification) {
                createdNotifications = notificationService.createNotification(notificationDTO, true);
            } else {
                throw new IllegalArgumentException("Thông báo cá nhân yêu cầu userId hoặc thông báo hệ thống phải được chỉ định");
            }
            if (isSystemNotification) {
                return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Gửi thông báo hệ thống thành công", "notifications", createdNotifications));
            } else {
                return ResponseEntity.status(HttpStatus.CREATED).body(createdNotifications.get(0));
            }
        } catch (IllegalArgumentException e) {
            logger.error("Lỗi khi gửi thông báo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Gửi thông báo thất bại: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Lỗi khi gửi thông báo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Gửi thông báo thất bại: " + e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_NOTIFICATIONS')")
    public ResponseEntity<?> getAllNotifications() {
        logger.info("Lấy tất cả thông báo của người dùng");
        User user = getCurrentUser();
        if (user == null) {
            logger.warn("Truy cập không được xác thực");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Chưa xác thực người dùng"));
        }
        try {
            List<NotificationDTO> notifications = notificationService.getUserNotifications(user.getUserId());
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy thông báo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy danh sách thông báo thất bại"));
        }
    }

    @GetMapping("/unread")
    @PreAuthorize("hasAuthority('VIEW_NOTIFICATIONS')")
    public ResponseEntity<?> getUnreadNotifications() {
        logger.info("Lấy thông báo chưa đọc của người dùng");
        User user = getCurrentUser();
        if (user == null) {
            logger.warn("Truy cập không được xác thực");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Chưa xác thực người dùng"));
        }
        try {
            List<NotificationDTO> notifications = notificationService.getUnreadUserNotifications(user.getUserId());
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy thông báo chưa đọc: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy danh sách thông báo chưa đọc thất bại"));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_NOTIFICATIONS')")
    public ResponseEntity<?> getNotificationById(@PathVariable Long id) {
        logger.info("Lấy thông báo theo id: {}", id);
        User user = getCurrentUser();
        if (user == null) {
            logger.warn("Truy cập không được xác thực");
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
            logger.error("Lỗi khi lấy thông báo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Lỗi khi lấy thông báo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy thông báo thất bại"));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_NOTIFICATIONS')")
    public ResponseEntity<?> updateNotification(@PathVariable Long id, @Valid @RequestBody NotificationDTO notificationDTO, BindingResult bindingResult) {
        logger.info("Cập nhật thông báo với id: {}", id);
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Lỗi xác thực khi cập nhật thông báo: {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            NotificationDTO updatedNotification = notificationService.updateNotification(id, notificationDTO);
            return ResponseEntity.ok(updatedNotification);
        } catch (IllegalArgumentException e) {
            logger.error("Lỗi khi cập nhật thông báo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Lỗi khi cập nhật thông báo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Cập nhật thông báo thất bại"));
        }
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasAuthority('VIEW_NOTIFICATIONS')")
    public ResponseEntity<?> markNotificationAsRead(@PathVariable Long id) {
        logger.info("Đánh dấu thông báo đã đọc: id={}", id);
        User user = getCurrentUser();
        if (user == null) {
            logger.warn("Truy cập không được xác thực");
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
            logger.error("Lỗi khi đánh dấu thông báo đã đọc: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Lỗi khi đánh dấu thông báo đã đọc: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Đánh dấu thông báo đã đọc thất bại"));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_NOTIFICATIONS')")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        logger.info("Xóa thông báo với id: {}", id);
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.ok(Map.of("message", "Xóa thông báo thành công"));
        } catch (IllegalArgumentException e) {
            logger.error("Lỗi khi xóa thông báo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Lỗi khi xóa thông báo: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Xóa thông báo thất bại"));
        }
    }
}