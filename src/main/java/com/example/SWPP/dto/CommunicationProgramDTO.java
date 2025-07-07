package com.example.SWPP.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class CommunicationProgramDTO {
    @NotNull(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Participant count is required")
    private Integer participantCount;

    @NotNull(message = "Interaction count is required")
    private Integer interactionCount;

    private Float averageRating;

    @NotNull(message = "Feedback count is required")
    private Integer feedbackCount;

    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    private LocalDateTime endDate;

    @NotNull(message = "Status is required")
    private String status;

    private Float finalAverageRating; // Thêm trường mới

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getParticipantCount() { return participantCount; }
    public void setParticipantCount(Integer participantCount) { this.participantCount = participantCount; }
    public Integer getInteractionCount() { return interactionCount; }
    public void setInteractionCount(Integer interactionCount) { this.interactionCount = interactionCount; }
    public Float getAverageRating() { return averageRating; }
    public void setAverageRating(Float averageRating) { this.averageRating = averageRating; }
    public Integer getFeedbackCount() { return feedbackCount; }
    public void setFeedbackCount(Integer feedbackCount) { this.feedbackCount = feedbackCount; }
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Float getFinalAverageRating() { return finalAverageRating; }
    public void setFinalAverageRating(Float finalAverageRating) { this.finalAverageRating = finalAverageRating; }
}