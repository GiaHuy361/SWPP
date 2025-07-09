package com.example.SWPP.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Thực thể Reaction đại diện cho một phản ứng của người dùng đối với bài viết blog.
 * Bao gồm loại phản ứng (LIKE, LOVE, APPLAUSE), thông tin người dùng, bài viết, và thời gian tạo.
 */
@Entity
@Table(name = "reactions", uniqueConstraints = @UniqueConstraint(columnNames = {"post_id", "user_id"}))
public class Reaction {
    public enum ReactionType {
        LIKE,
        LOVE,
        APPLAUSE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private BlogPost post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReactionType type;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Reaction() {}

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public BlogPost getPost() { return post; }
    public void setPost(BlogPost post) { this.post = post; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public ReactionType getType() { return type; }
    public void setType(ReactionType type) { this.type = type; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}