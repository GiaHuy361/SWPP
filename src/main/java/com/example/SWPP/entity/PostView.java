package com.example.SWPP.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Thực thể PostView đại diện cho một lượt xem bài viết blog.
 * Bao gồm thông tin bài viết, người dùng (nếu có), địa chỉ IP, và thời gian xem.
 */
@Entity
@Table(name = "post_views")
public class PostView {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private BlogPost post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(nullable = false)
    private LocalDateTime viewedAt;

    public PostView() {}

    @PrePersist
    protected void onCreate() {
        viewedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public BlogPost getPost() { return post; }
    public void setPost(BlogPost post) { this.post = post; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public LocalDateTime getViewedAt() { return viewedAt; }
    public void setViewedAt(LocalDateTime viewedAt) { this.viewedAt = viewedAt; }
}