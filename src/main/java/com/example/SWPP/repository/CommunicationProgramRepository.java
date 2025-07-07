package com.example.SWPP.repository;

import com.example.SWPP.entity.CommunicationProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface CommunicationProgramRepository extends JpaRepository<CommunicationProgram, Long> {
    long countByStatusAndStartDateBeforeAndEndDateAfterOrEndDateIsNull(String status, LocalDateTime startDate, LocalDateTime endDate);
}