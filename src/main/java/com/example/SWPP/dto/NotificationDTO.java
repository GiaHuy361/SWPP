package com.example.SWPP.dto;

import com.example.SWPP.entity.Notification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class NotificationDTO {

    private Long notificationId;

    @NotNull(message = "ID người dùng không được để trống")
    private Long userId;

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotBlank(message = "Nội dung không được để trống")
    private String message;

    @NotNull(message = "Loại thông báo không được để trống")
    private Notification.NotificationType type;

    private Boolean isRead;

    private LocalDateTime createdAt;

    private Boolean isSystemNotification;

    // Constructors
    public NotificationDTO() {}

    public NotificationDTO(Long notificationId, Long userId, String title, String message, Notification.NotificationType type, Boolean isRead, LocalDateTime createdAt, Boolean isSystemNotification) {
        this.notificationId = notificationId;
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.isSystemNotification = isSystemNotification;
    }

    // Getters and Setters
    public Long getNotificationId() { return notificationId; }
    public void setNotificationId(Long notificationId) { this.notificationId = notificationId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Notification.NotificationType getType() { return type; }
    public void setType(Notification.NotificationType type) { this.type = type; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Boolean getIsSystemNotification() { return isSystemNotification; }
    public void setIsSystemNotification(Boolean isSystemNotification) { this.isSystemNotification = isSystemNotification; }
}