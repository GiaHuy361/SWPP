package com.example.SWPP.dto;

import com.example.SWPP.entity.Appointment;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class UpdateAppointmentRequest {
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime appointmentTime;
    private Appointment.Status status;
    private String meetLink;
    private String note;  // Thêm trường note

    // Getters and Setters
    public LocalDateTime getAppointmentTime() { return appointmentTime; }
    public void setAppointmentTime(LocalDateTime appointmentTime) { this.appointmentTime = appointmentTime; }
    public Appointment.Status getStatus() { return status; }
    public void setStatus(Appointment.Status status) { this.status = status; }
    public String getMeetLink() { return meetLink; }
    public void setMeetLink(String meetLink) { this.meetLink = meetLink; }
    public String getNote() { return note; }  // Getter cho note
    public void setNote(String note) { this.note = note; }  // Setter cho note
}