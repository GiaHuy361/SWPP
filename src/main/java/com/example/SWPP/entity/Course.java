package com.example.SWPP.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Course")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 255, nullable = false)
    private String title;

    @Column(length = 50, nullable = false)
    private String level;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private Integer recommendedMinScore;

    @Column(nullable = false)
    private Integer recommendedMaxScore;

    @Column(length = 50, nullable = false)
    private String ageGroup;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourseModule> modules = new ArrayList<>();

    @OneToOne(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private CourseQuiz quiz;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Enrollment> enrollments = new ArrayList<>();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getRecommendedMinScore() { return recommendedMinScore; }
    public void setRecommendedMinScore(Integer recommendedMinScore) { this.recommendedMinScore = recommendedMinScore; }
    public Integer getRecommendedMaxScore() { return recommendedMaxScore; }
    public void setRecommendedMaxScore(Integer recommendedMaxScore) { this.recommendedMaxScore = recommendedMaxScore; }
    public String getAgeGroup() { return ageGroup; }
    public void setAgeGroup(String ageGroup) { this.ageGroup = ageGroup; }
    public List<CourseModule> getModules() { return modules; }
    public void setModules(List<CourseModule> modules) { this.modules = modules; }
    public CourseQuiz getQuiz() { return quiz; }
    public void setQuiz(CourseQuiz quiz) { this.quiz = quiz; }
    public List<Enrollment> getEnrollments() { return enrollments; }
    public void setEnrollments(List<Enrollment> enrollments) { this.enrollments = enrollments; }
}