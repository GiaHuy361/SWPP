
        package com.example.SWPP.service;

import com.example.SWPP.dto.NotificationDTO;
import com.example.SWPP.entity.*;
import com.example.SWPP.mapper.NotificationMapper;
import com.example.SWPP.repository.AppointmentRepository;
import com.example.SWPP.repository.CourseQuizSubmissionRepository;
import com.example.SWPP.repository.NotificationRepository;
import com.example.SWPP.repository.SurveyResponseRepository;
import com.example.SWPP.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private CourseQuizSubmissionRepository quizSubmissionRepository;

    @Autowired
    private SurveyResponseRepository surveyResponseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationMapper notificationMapper;

    @Transactional
    public List<NotificationDTO> createNotification(NotificationDTO notificationDTO, Boolean isSystemNotification) {
        logger.info("Creating notification, isSystemNotification={}", isSystemNotification);
        if (isSystemNotification != null && isSystemNotification) {
            // Tạo thông báo cho tất cả người dùng
            logger.info("Creating system notification for all users");
            List<User> allUsers = userRepository.findAll();
            List<Notification> notifications = allUsers.stream()
                    .map(user -> {
                        Notification notification = notificationMapper.toNotificationEntity(notificationDTO, user);
                        notification.setType(Notification.NotificationType.SYSTEM); // Đảm bảo type là SYSTEM
                        return notification;
                    })
                    .collect(Collectors.toList());
            List<Notification> savedNotifications = notificationRepository.saveAll(notifications);
            return savedNotifications.stream()
                    .map(notificationMapper::toNotificationDTO)
                    .collect(Collectors.toList());
        } else {
            // Tạo thông báo cho một userId cụ thể
            Long userId = notificationDTO.getUserId();
            if (userId == null) {
                throw new IllegalArgumentException("userId is required for non-system notification");
            }
            logger.info("Creating notification for userId={}", userId);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại: " + userId));
            Notification notification = notificationMapper.toNotificationEntity(notificationDTO, user);
            Notification savedNotification = notificationRepository.save(notification);
            return List.of(notificationMapper.toNotificationDTO(savedNotification));
        }
    }

    @Transactional
    public void createAppointmentNotification(Appointment appointment) {
        logger.info("Creating appointment notification for appointmentId={}", appointment.getAppointmentId());
        Notification userNotification = new Notification(
                appointment.getUser(),
                "Cuộc hẹn mới",
                "Bạn đã đặt một cuộc hẹn với " + appointment.getConsultant().getUser().getFullName() + " vào lúc " + appointment.getAppointmentTime(),
                Notification.NotificationType.APPOINTMENT
        );
        Notification consultantNotification = new Notification(
                appointment.getConsultant().getUser(),
                "Cuộc hẹn mới",
                "Bạn có một cuộc hẹn với " + appointment.getUser().getFullName() + " vào lúc " + appointment.getAppointmentTime(),
                Notification.NotificationType.APPOINTMENT
        );
        notificationRepository.save(userNotification);
        notificationRepository.save(consultantNotification);
    }

    @Transactional
    public void createQuizSubmissionNotification(CourseQuizSubmission submission) {
        logger.info("Creating quiz submission notification for submissionId={}", submission.getId());
        if (submission.getPassed()) {
            Notification notification = new Notification(
                    submission.getUser(),
                    "Chúc mừng hoàn thành bài kiểm tra!",
                    "Bạn đã đạt " + submission.getPercentageScore() + "% trong bài kiểm tra của khóa học " + submission.getQuiz().getCourse().getTitle(),
                    Notification.NotificationType.QUIZ_RESULT
            );
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void createSurveyResponseNotification(SurveyResponse response) {
        logger.info("Creating survey response notification for responseId={}", response.getId());
        Notification notification = new Notification(
                response.getUser(),
                "Hoàn thành khảo sát",
                "Bạn đã hoàn thành khảo sát '" + response.getSurvey().getTitle() + "'. Kết quả: " + response.getRiskLevel(),
                Notification.NotificationType.SURVEY
        );
        notificationRepository.save(notification);
    }

    public List<NotificationDTO> getUserNotifications(Long userId) {
        logger.info("Fetching notifications for userId={}", userId);
        return notificationRepository.findByUser_UserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(notificationMapper::toNotificationDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getUnreadUserNotifications(Long userId) {
        logger.info("Fetching unread notifications for userId={}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại: " + userId));
        return notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user)
                .stream()
                .map(notificationMapper::toNotificationDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificationDTO updateNotification(Long notificationId, NotificationDTO notificationDTO) {
        logger.info("Updating notification: notificationId={}", notificationId);
        Notification existingNotification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Thông báo không tồn tại: " + notificationId));
        User user = userRepository.findById(notificationDTO.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại: " + notificationDTO.getUserId()));
        Notification updatedNotification = notificationMapper.toNotificationEntity(notificationDTO, user);
        updatedNotification.setNotificationId(notificationId);
        Notification savedNotification = notificationRepository.save(updatedNotification);
        return notificationMapper.toNotificationDTO(savedNotification);
    }

    @Transactional
    public void deleteNotification(Long notificationId) {
        logger.info("Deleting notification: notificationId={}", notificationId);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Thông báo không tồn tại: " + notificationId));
        notificationRepository.delete(notification);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        logger.info("Marking notification as read: notificationId={}", notificationId);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Thông báo không tồn tại: " + notificationId));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
}
