package com.example.SWPP.service;

import com.example.SWPP.dto.AppointmentDTO;
import com.example.SWPP.dto.UpdateAppointmentRequest;
import com.example.SWPP.entity.Appointment;
import com.example.SWPP.entity.Consultant;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.AppointmentRepository;
import com.example.SWPP.repository.ConsultantRepository;
import com.example.SWPP.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentService.class);
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final AppointmentRepository appointmentRepository;
    private final ConsultantRepository consultantRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              ConsultantRepository consultantRepository,
                              UserRepository userRepository,
                              EmailService emailService) {
        this.appointmentRepository = appointmentRepository;
        this.consultantRepository = consultantRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // Create: Đặt lịch hẹn
    public Appointment createAppointment(Long userId, Long consultantId, LocalDateTime appointmentTime) {
        logger.info("Creating appointment: userId={}, consultantId={}, time={}", userId, consultantId, appointmentTime);
        checkAuthority("BOOK_APPOINTMENTS");
        if (appointmentTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Không thể đặt lịch quá khứ");
        }
        if (appointmentTime.getHour() < 8 || appointmentTime.getHour() >= 18) {
            throw new IllegalArgumentException("Chỉ có thể đặt lịch từ 08:00 đến 18:00");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        Consultant consultant = consultantRepository.findById(consultantId)
                .orElseThrow(() -> new IllegalArgumentException("Tư vấn viên không tồn tại"));

        if (!consultant.getUser().getRole().getRoleName().equals("Consultant")) {
            throw new IllegalStateException("Người dùng không phải tư vấn viên");
        }
        if (appointmentRepository.findByConsultantIdAndAppointmentTime(consultantId, appointmentTime).isPresent()) {
            throw new IllegalStateException("Tư vấn viên đã có lịch hẹn vào thời gian này");
        }

        Appointment appointment = new Appointment();
        appointment.setUser(user);
        appointment.setConsultant(consultant);
        appointment.setAppointmentTime(appointmentTime);
        return appointmentRepository.save(appointment);
    }

    // Read: Lấy tất cả lịch hẹn
    public List<AppointmentDTO> getAllAppointments() {
        logger.info("Fetching all appointments");
        checkAuthority("MANAGE_APPOINTMENTS");
        return appointmentRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // Read: Lấy lịch hẹn theo ID
    public Optional<AppointmentDTO> getAppointmentById(Long id) {
        logger.info("Fetching appointment by id: {}", id);
        checkAuthority("MANAGE_APPOINTMENTS");
        return appointmentRepository.findById(id).map(this::mapToDTO);
    }

    // Read: Lấy lịch hẹn của tư vấn viên
    public List<AppointmentDTO> getAppointmentsByConsultantId(Long consultantId) {
        logger.info("Fetching appointments for consultantId: {}", consultantId);
        checkAuthority("MANAGE_APPOINTMENTS");
        return appointmentRepository.findByConsultantId(consultantId).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // Read: Lấy lịch hẹn của người dùng
    public List<AppointmentDTO> getAppointmentsByUserId(Long userId) {
        logger.info("Fetching appointments for userId: {}", userId);
        checkAuthority("BOOK_APPOINTMENTS");
        return appointmentRepository.findByUserId(userId).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // Update: Cập nhật lịch hẹn
    public AppointmentDTO updateAppointment(Long id, UpdateAppointmentRequest request) {
        logger.info("Updating appointment: id={}", id);
        checkAuthority("MANAGE_APPOINTMENTS");
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lịch hẹn không tồn tại"));

        if (request.getAppointmentTime() != null) {
            if (request.getAppointmentTime().isBefore(LocalDateTime.now())) {
                throw new IllegalArgumentException("Không thể cập nhật lịch quá khứ");
            }
            if (appointmentRepository.findByConsultantIdAndAppointmentTime(
                    appointment.getConsultant().getConsultantId(), request.getAppointmentTime()).isPresent()) {
                throw new IllegalStateException("Tư vấn viên đã có lịch hẹn vào thời gian này");
            }
            appointment.setAppointmentTime(request.getAppointmentTime());
        }
        if (request.getStatus() != null) {
            appointment.setStatus(request.getStatus());
            if (appointment.getStatus() == Appointment.Status.CONFIRMED && appointment.getMeetLink() == null) {
                appointment.setMeetLink(generateGoogleMeetLink());
                sendConfirmationEmail(appointment);
            }
        }
        if (request.getMeetLink() != null) {
            appointment.setMeetLink(request.getMeetLink());
        }
        Appointment savedAppointment = appointmentRepository.save(appointment);
        return mapToDTO(savedAppointment);
    }

    // Delete: Xóa lịch hẹn
    public void deleteAppointment(Long id) {
        logger.info("Deleting appointment: id={}", id);
        checkAuthority("MANAGE_APPOINTMENTS");
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lịch hẹn không tồn tại"));
        appointmentRepository.delete(appointment);
    }

    private AppointmentDTO mapToDTO(Appointment appointment) {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setAppointmentId(appointment.getAppointmentId());
        dto.setUserId(appointment.getUser().getUserId());
        dto.setUserFullName(appointment.getUser().getFullName());
        dto.setUserEmail(appointment.getUser().getEmail());
        dto.setConsultantId(appointment.getConsultant().getConsultantId());
        dto.setConsultantFullName(appointment.getConsultant().getUser().getFullName());
        dto.setConsultantEmail(appointment.getConsultant().getUser().getEmail());
        dto.setAppointmentTime(appointment.getAppointmentTime());
        dto.setStatus(appointment.getStatus());
        dto.setMeetLink(appointment.getMeetLink());
        dto.setCreatedAt(appointment.getCreatedAt());
        return dto;
    }

    private String generateGoogleMeetLink() {
        // Giả lập link, thực tế dùng Google Calendar API
        return "https://meet.google.com/xyz-1234-abc";
    }

    private void sendConfirmationEmail(Appointment appointment) {
        String subject = "Xác nhận lịch hẹn tư vấn";
        String body = String.format(
                "Kính gửi %s,\n\n" +
                        "Lịch hẹn của bạn với tư vấn viên %s đã được xác nhận.\n" +
                        "Thời gian: %s\n" +
                        "Link Google Meet: %s\n\n" +
                        "Vui lòng tham gia đúng giờ. Trân trọng,\n" +
                        "Hệ thống",
                appointment.getUser().getFullName(),
                appointment.getConsultant().getUser().getFullName(),
                appointment.getAppointmentTime().format(DATE_TIME_FORMATTER),
                appointment.getMeetLink()
        );

        emailService.sendSimpleMessage(appointment.getUser().getEmail(), subject, body);
        logger.info("Confirmation email sent to: {}", appointment.getUser().getEmail());
    }

    private void checkAuthority(String requiredAuthority) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (userDetails == null || !userDetails.getAuthorities().contains(new SimpleGrantedAuthority(requiredAuthority))) {
            throw new SecurityException("Không có quyền " + requiredAuthority);
        }
    }
}