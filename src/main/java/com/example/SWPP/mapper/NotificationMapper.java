
package com.example.SWPP.mapper;

import com.example.SWPP.dto.NotificationDTO;
import com.example.SWPP.entity.Notification;
import com.example.SWPP.entity.User;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationDTO toNotificationDTO(Notification notification) {
        if (notification == null) {
            return null;
        }
        return new NotificationDTO(
                notification.getNotificationId(),
                notification.getUser() != null ? notification.getUser().getUserId() : null,
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getIsRead(),
                notification.getCreatedAt(),
                false // isSystemNotification luôn là false vì không lưu trong entity
        );
    }

    public Notification toNotificationEntity(NotificationDTO dto, User user) {
        if (dto == null) {
            return null;
        }
        Notification notification = new Notification();
        notification.setNotificationId(dto.getNotificationId());
        notification.setUser(user);
        notification.setTitle(dto.getTitle());
        notification.setMessage(dto.getMessage());
        notification.setType(dto.getType());
        notification.setIsRead(dto.getIsRead() != null ? dto.getIsRead() : false);
        notification.setCreatedAt(dto.getCreatedAt() != null ? dto.getCreatedAt() : java.time.LocalDateTime.now());
        // Không ánh xạ isSystemNotification vì nó không tồn tại trong entity
        return notification;
    }
}
