package com.example.SWPP.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "CourseQuizAnswer")
public class CourseQuizAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private CourseQuizQuestion question;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String answerText;

    @Column(nullable = false)
    private Boolean isCorrect;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CourseQuizQuestion getQuestion() { return question; }
    public void setQuestion(CourseQuizQuestion question) { this.question = question; }
    public String getAnswerText() { return answerText; }
    public void setAnswerText(String answerText) { this.answerText = answerText; }
    public Boolean getIsCorrect() { return isCorrect; }
    public void setIsCorrect(Boolean isCorrect) { this.isCorrect = isCorrect; }
}