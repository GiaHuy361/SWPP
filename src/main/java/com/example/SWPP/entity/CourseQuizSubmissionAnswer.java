package com.example.SWPP.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "CourseQuizSubmissionAnswer")
public class CourseQuizSubmissionAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private CourseQuizSubmission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private CourseQuizQuestion question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_answer_id", nullable = false)
    private CourseQuizAnswer selectedAnswer;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CourseQuizSubmission getSubmission() { return submission; }
    public void setSubmission(CourseQuizSubmission submission) { this.submission = submission; }
    public CourseQuizQuestion getQuestion() { return question; }
    public void setQuestion(CourseQuizQuestion question) { this.question = question; }
    public CourseQuizAnswer getSelectedAnswer() { return selectedAnswer; }
    public void setSelectedAnswer(CourseQuizAnswer selectedAnswer) { this.selectedAnswer = selectedAnswer; }
}