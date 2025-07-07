package com.example.SWPP.service;

import com.example.SWPP.dto.CommunicationProgramDTO;
import com.example.SWPP.dto.FeedbackDTO;
import com.example.SWPP.entity.CommunicationProgram;
import com.example.SWPP.entity.Feedback;
import com.example.SWPP.entity.User;
import com.example.SWPP.mapper.CommunicationProgramMapper;
import com.example.SWPP.repository.CommunicationProgramRepository;
import com.example.SWPP.repository.FeedbackRepository;
import com.example.SWPP.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class CommunicationProgramService {

    private final CommunicationProgramRepository programRepository;
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final CommunicationProgramMapper mapper;
    private final EmailService emailService;

    public CommunicationProgramService(CommunicationProgramRepository programRepository,
                                       FeedbackRepository feedbackRepository,
                                       UserRepository userRepository,
                                       CommunicationProgramMapper mapper,
                                       EmailService emailService) {
        this.programRepository = programRepository;
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
        this.emailService = emailService;
    }

    public CommunicationProgram createProgram(CommunicationProgramDTO dto, LocalDateTime currentTime) {
        CommunicationProgram program = mapper.toEntity(dto);
        program.setCreatedAt(currentTime);
        program.setUpdatedAt(currentTime);
        if ("active".equals(dto.getStatus()) && dto.getStartDate().isBefore(currentTime) &&
                (dto.getEndDate() == null || dto.getEndDate().isAfter(currentTime))) {
            program.setParticipantCount(0);
            program.setInteractionCount(0);
        }
        return programRepository.save(program);
    }

    public CommunicationProgram getProgram(Long programId) {
        return programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Chương trình không tồn tại"));
    }

    public List<CommunicationProgram> getAllPrograms() {
        return programRepository.findAll();
    }

    public CommunicationProgram updateProgram(Long programId, CommunicationProgramDTO dto, LocalDateTime currentTime) {
        CommunicationProgram program = programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Chương trình không tồn tại"));
        program.setTitle(dto.getTitle());
        program.setDescription(dto.getDescription());
        program.setParticipantCount(dto.getParticipantCount());
        program.setInteractionCount(dto.getInteractionCount());
        program.setAverageRating(dto.getAverageRating());
        program.setFeedbackCount(dto.getFeedbackCount());
        program.setStartDate(dto.getStartDate());
        program.setEndDate(dto.getEndDate());
        program.setStatus(dto.getStatus());
        program.setFinalAverageRating(dto.getFinalAverageRating());
        program.setUpdatedAt(currentTime);
        return programRepository.save(program);
    }

    public void deleteProgram(Long programId) {
        CommunicationProgram program = programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Chương trình không tồn tại"));
        programRepository.delete(program);
    }

    public Feedback createFeedback(FeedbackDTO dto, LocalDateTime currentTime) {
        CommunicationProgram program = programRepository.findById(dto.getProgramId())
                .orElseThrow(() -> new RuntimeException("Chương trình không tồn tại"));
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        // Kiểm tra xem người dùng đã tham gia chương trình chưa
        if (!program.getParticipants().contains(dto.getUserId())) {
            throw new RuntimeException("Người dùng chưa tham gia chương trình này");
        }

        Feedback feedback = mapper.toFeedbackEntity(dto);
        feedback.setProgram(program);
        feedback.setUser(user);
        feedback.setCreatedAt(currentTime);
        Feedback savedFeedback = feedbackRepository.save(feedback);
        updateProgramStats(program.getProgramId());
        incrementInteraction(program.getProgramId(), currentTime);
        return savedFeedback;
    }

    public Feedback getFeedback(Long feedbackId) {
        return feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Phản hồi không tồn tại"));
    }

    public List<Feedback> getAllFeedbacks() {
        return feedbackRepository.findAll();
    }

    public Feedback updateFeedback(Long feedbackId, FeedbackDTO dto) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Phản hồi không tồn tại"));
        feedback.setRating(dto.getRating());
        feedback.setComment(dto.getComment());
        Feedback savedFeedback = feedbackRepository.save(feedback);
        updateProgramStats(feedback.getProgram().getProgramId());
        return savedFeedback;
    }

    public void deleteFeedback(Long feedbackId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Phản hồi không tồn tại"));
        Long programId = feedback.getProgram().getProgramId();
        feedbackRepository.delete(feedback);
        updateProgramStats(programId);
    }

    private void updateProgramStats(Long programId) {
        CommunicationProgram program = programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Chương trình không tồn tại"));
        long feedbackCount = feedbackRepository.countByProgramProgramId(programId);
        program.setFeedbackCount((int) feedbackCount);
        double avgRating = feedbackRepository.findAverageRatingByProgramId(programId).orElse(0.0);
        program.setAverageRating((float) avgRating);
        program.setUpdatedAt(LocalDateTime.now());
        programRepository.save(program);
    }

    public long countActivePrograms(LocalDateTime currentTime) {
        return programRepository.countByStatusAndStartDateBeforeAndEndDateAfterOrEndDateIsNull("active", currentTime, currentTime);
    }

    public int countParticipants(Long programId) {
        return programRepository.findById(programId)
                .map(CommunicationProgram::getParticipantCount)
                .orElse(0);
    }

    public int countInteractions(Long programId) {
        return programRepository.findById(programId)
                .map(CommunicationProgram::getInteractionCount)
                .orElse(0);
    }

    public void incrementParticipant(Long programId, Long userId, LocalDateTime currentTime) {
        CommunicationProgram program = programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Chương trình không tồn tại"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        if (!program.getParticipants().contains(userId)) {
            program.getParticipants().add(userId);
            program.setParticipantCount(program.getParticipantCount() + 1);
            program.setUpdatedAt(currentTime);
            programRepository.save(program);

            // Gửi giấy mời qua email
            String subject = "Thư Mời Tham Gia Chương Trình: " + program.getTitle();
            String text = "Chào " + user.getUsername() + ",\n\n" +
                    "Bạn đã được mời tham gia chương trình \"" + program.getTitle() + "\".\n" +
                    "Mô tả: " + (program.getDescription() != null ? program.getDescription() : "Không có mô tả") + "\n" +
                    "Thời gian bắt đầu: " + program.getStartDate() + "\n" +
                    "Thời gian kết thúc: " + (program.getEndDate() != null ? program.getEndDate() : "Chưa xác định") + "\n\n" +
                    "Trân trọng,\nĐội ngũ SWPP";
            emailService.sendSimpleMessage(user.getEmail(), subject, text);
        }
    }

    public void incrementInteraction(Long programId, LocalDateTime currentTime) {
        CommunicationProgram program = programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Chương trình không tồn tại"));
        program.setInteractionCount(program.getInteractionCount() + 1);
        program.setUpdatedAt(currentTime);
        programRepository.save(program);
    }

    @Scheduled(cron = "0 0 * * * *") // Chạy mỗi giờ
    public void updateProgramStatus() {
        LocalDateTime currentTime = LocalDateTime.now();
        List<CommunicationProgram> activePrograms = programRepository.findByStatusAndEndDateBefore("active", currentTime);
        for (CommunicationProgram program : activePrograms) {
            program.setStatus("inactive");
            program.setFinalAverageRating(program.getAverageRating()); // Lưu điểm trung bình cuối cùng
            program.setUpdatedAt(currentTime);
            programRepository.save(program);
        }
    }
}