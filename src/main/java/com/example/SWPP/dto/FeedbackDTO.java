package com.example.SWPP.dto;

import jakarta.validation.constraints.NotNull;

public class FeedbackDTO {
    @NotNull(message = "Program ID is required")
    private Long programId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Rating is required")
    private Integer rating; // 1-5 stars

    private String comment;

    // Getters and Setters
    public Long getProgramId() { return programId; }
    public void setProgramId(Long programId) { this.programId = programId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}