package com.example.SWPP.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "CourseQuiz")
public class CourseQuiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "course_id", unique = true, nullable = false)
    private Course course;

    @Column(nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false)
    private Boolean shuffleQuestions;

    @Column(nullable = false)
    private Boolean shuffleAnswers;

    @Column(nullable = false)
    private Integer passingPercentage;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourseQuizQuestion> questions = new ArrayList<>();

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourseQuizSubmission> submissions = new ArrayList<>();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public Boolean getShuffleQuestions() { return shuffleQuestions; }
    public void setShuffleQuestions(Boolean shuffleQuestions) { this.shuffleQuestions = shuffleQuestions; }
    public Boolean getShuffleAnswers() { return shuffleAnswers; }
    public void setShuffleAnswers(Boolean shuffleAnswers) { this.shuffleAnswers = shuffleAnswers; }
    public Integer getPassingPercentage() { return passingPercentage; }
    public void setPassingPercentage(Integer passingPercentage) { this.passingPercentage = passingPercentage; }
    public List<CourseQuizQuestion> getQuestions() { return questions; }
    public void setQuestions(List<CourseQuizQuestion> questions) { this.questions = questions; }
    public List<CourseQuizSubmission> getSubmissions() { return submissions; }
    public void setSubmissions(List<CourseQuizSubmission> submissions) { this.submissions = submissions; }
}