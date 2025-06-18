package com.example.SWPP.repository;

import com.example.SWPP.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    @Query("SELECT a FROM Appointment a WHERE a.consultant.consultantId = :consultantId")
    List<Appointment> findByConsultantId(@Param("consultantId") Long consultantId);

    @Query("SELECT a FROM Appointment a WHERE a.user.userId = :userId")
    List<Appointment> findByUserId(@Param("userId") Long userId);

    @Query("SELECT a FROM Appointment a WHERE a.consultant.consultantId = :consultantId AND a.appointmentTime = :appointmentTime")
    Optional<Appointment> findByConsultantIdAndAppointmentTime(@Param("consultantId") Long consultantId, @Param("appointmentTime") LocalDateTime appointmentTime);
}