package com.example.SWPP.service;

import com.example.SWPP.dto.ConsultantDTO;
import com.example.SWPP.entity.Consultant;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.ConsultantRepository;
import com.example.SWPP.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ConsultantService {

    private static final Logger logger = LoggerFactory.getLogger(ConsultantService.class);

    private final ConsultantRepository consultantRepository;
    private final UserRepository userRepository;

    public ConsultantService(ConsultantRepository consultantRepository, UserRepository userRepository) {
        this.consultantRepository = consultantRepository;
        this.userRepository = userRepository;
    }

    public Consultant createConsultant(Long userId, String qualification, Integer experienceYears) {
        logger.info("Creating consultant: userId={}, qualification={}, experienceYears={}", userId, qualification, experienceYears);
        checkAuthority("MANAGE_CONSULTANTS");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        if (user.getRole() == null) {
            logger.error("User with ID {} has no role assigned", userId);
            throw new IllegalStateException("Người dùng không có vai trò được gán");
        }
        Consultant consultant = new Consultant();
        consultant.setUser(user);
        consultant.setQualification(qualification);
        consultant.setExperienceYears(experienceYears);
        return consultantRepository.save(consultant);
    }

    public List<ConsultantDTO> getAllConsultants() {
        logger.info("Fetching all consultants");
        checkAuthority("MANAGE_CONSULTANTS");
        return consultantRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public Optional<ConsultantDTO> getConsultantById(Long id) {
        logger.info("Fetching consultant by id: {}", id);
        checkAuthority("MANAGE_CONSULTANTS");
        return consultantRepository.findById(id).map(this::mapToDTO);
    }

    public ConsultantDTO updateConsultant(Long id, String qualification, Integer experienceYears, Boolean isActive, String fullName, String email, String phone) {
        logger.info("Updating consultant: id={}, qualification={}, experienceYears={}, isActive={}, fullName={}, email={}, phone={}",
                id, qualification, experienceYears, isActive, fullName, email, phone);
        checkAuthority("MANAGE_CONSULTANTS");
        Consultant consultant = consultantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tư vấn viên không tồn tại"));
        User user = consultant.getUser();
        if (user == null) {
            throw new IllegalStateException("Người dùng liên kết với tư vấn viên không tồn tại");
        }

        if (qualification != null) consultant.setQualification(qualification);
        if (experienceYears != null) consultant.setExperienceYears(experienceYears);
        if (isActive != null) consultant.setIsActive(isActive);
        if (fullName != null) user.setFullName(fullName);
        if (email != null) {
            if (userRepository.findByEmail(email).isPresent() && !email.equals(user.getEmail())) {
                throw new IllegalArgumentException("Email đã được sử dụng");
            }
            user.setEmail(email);
        }
        if (phone != null) user.setPhone(phone);
        consultant.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        Consultant savedConsultant = consultantRepository.save(consultant);
        return mapToDTO(savedConsultant);
    }

    public void deleteConsultant(Long id) {
        logger.info("Deleting consultant: id={}", id);
        checkAuthority("MANAGE_CONSULTANTS");
        Consultant consultant = consultantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tư vấn viên không tồn tại"));
        consultantRepository.delete(consultant);
    }

    private ConsultantDTO mapToDTO(Consultant consultant) {
        ConsultantDTO dto = new ConsultantDTO();
        dto.setConsultantId(consultant.getConsultantId());
        dto.setUserId(consultant.getUser().getUserId());
        dto.setFullName(consultant.getUser().getFullName());
        dto.setEmail(consultant.getUser().getEmail());
        dto.setPhone(consultant.getUser().getPhone());
        dto.setQualification(consultant.getQualification());
        dto.setExperienceYears(consultant.getExperienceYears());
        dto.setIsActive(consultant.getIsActive());
        dto.setCreatedAt(consultant.getCreatedAt());
        dto.setUpdatedAt(consultant.getUpdatedAt());
        return dto;
    }

    private void checkAuthority(String requiredAuthority) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (userDetails == null || !userDetails.getAuthorities().contains(new SimpleGrantedAuthority(requiredAuthority))) {
            throw new SecurityException("Không có quyền " + requiredAuthority);
        }
    }
}