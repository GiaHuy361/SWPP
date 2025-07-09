package com.example.SWPP.dto;

import com.example.SWPP.entity.Reaction;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * DTO cho Reaction, dùng cho request (tạo/cập nhật) và response.
 * Sử dụng Jackson annotations để kiểm soát serialization/deserialization.
 */
public class ReactionDTO {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long userId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long postId;

    @NotNull(message = "Loại reaction không được để trống")
    private Reaction.ReactionType type;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime createdAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }
    public Reaction.ReactionType getType() { return type; }
    public void setType(Reaction.ReactionType type) { this.type = type; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}