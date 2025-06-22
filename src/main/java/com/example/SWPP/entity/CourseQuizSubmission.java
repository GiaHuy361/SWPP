package com.example.SWPP.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "CourseQuizSubmission")
public class CourseQuizSubmission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private CourseQuiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    @Column(nullable = false)
    private Integer percentageScore;

    @Column(nullable = false)
    private Boolean passed;

    @Column(nullable = false)
    private Integer durationTaken;

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourseQuizSubmissionAnswer> answers = new ArrayList<>();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CourseQuiz getQuiz() { return quiz; }
    public void setQuiz(CourseQuiz quiz) { this.quiz = quiz; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public Integer getPercentageScore() { return percentageScore; }
    public void setPercentageScore(Integer percentageScore) { this.percentageScore = percentageScore; }
    public Boolean getPassed() { return passed; }
    public void setPassed(Boolean passed) { this.passed = passed; }
    public Integer getDurationTaken() { return durationTaken; }
    public void setDurationTaken(Integer durationTaken) { this.durationTaken = durationTaken; }
    public List<CourseQuizSubmissionAnswer> getAnswers() { return answers; }
    public void setAnswers(List<CourseQuizSubmissionAnswer> answers) { this.answers = answers; }
}