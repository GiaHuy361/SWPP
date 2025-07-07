package com.example.SWPP.mapper;

import com.example.SWPP.dto.CommunicationProgramDTO;
import com.example.SWPP.dto.FeedbackDTO;
import com.example.SWPP.entity.CommunicationProgram;
import com.example.SWPP.entity.Feedback;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.CommunicationProgramRepository;
import com.example.SWPP.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CommunicationProgramMapper {

    private final CommunicationProgramRepository programRepository;
    private final UserRepository userRepository;

    @Autowired
    public CommunicationProgramMapper(CommunicationProgramRepository programRepository, UserRepository userRepository) {
        this.programRepository = programRepository;
        this.userRepository = userRepository;
    }

    public CommunicationProgram toEntity(CommunicationProgramDTO dto) {
        CommunicationProgram program = new CommunicationProgram();
        program.setTitle(dto.getTitle());
        program.setDescription(dto.getDescription());
        program.setParticipantCount(dto.getParticipantCount());
        program.setInteractionCount(dto.getInteractionCount());
        program.setAverageRating(dto.getAverageRating());
        program.setFeedbackCount(dto.getFeedbackCount());
        program.setStartDate(dto.getStartDate());
        program.setEndDate(dto.getEndDate());
        program.setStatus(dto.getStatus());
        return program;
    }

    public Feedback toFeedbackEntity(FeedbackDTO dto) {
        if (dto.getProgramId() == null || dto.getUserId() == null || dto.getRating() == null) {
            throw new IllegalArgumentException("Program ID, User ID, and Rating are required");
        }

        Feedback feedback = new Feedback();
        CommunicationProgram program = programRepository.findById(dto.getProgramId())
                .orElseThrow(() -> new IllegalArgumentException("Program not found with ID: " + dto.getProgramId()));
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + dto.getUserId()));
        feedback.setProgram(program);
        feedback.setUser(user);
        feedback.setRating(dto.getRating());
        feedback.setComment(dto.getComment());
        return feedback;
    }

    public User mapToUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
    }
}