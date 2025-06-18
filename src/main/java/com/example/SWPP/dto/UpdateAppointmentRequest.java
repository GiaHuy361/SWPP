package com.example.SWPP.dto;

import com.example.SWPP.entity.Appointment;
import java.time.LocalDateTime;

public class UpdateAppointmentRequest {
    private LocalDateTime appointmentTime;
    private Appointment.Status status;
    private String meetLink;

    // Getters and Setters
    public LocalDateTime getAppointmentTime() { return appointmentTime; }
    public void setAppointmentTime(LocalDateTime appointmentTime) { this.appointmentTime = appointmentTime; }
    public Appointment.Status getStatus() { return status; }
    public void setStatus(Appointment.Status status) { this.status = status; }
    public String getMeetLink() { return meetLink; }
    public void setMeetLink(String meetLink) { this.meetLink = meetLink; }
}