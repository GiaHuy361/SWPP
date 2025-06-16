package com.example.SWPP.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "survey_option")
public class SurveyOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private SurveyQuestion question;

    @Column(columnDefinition = "TEXT")
    private String optionText;

    @Column
    private Integer score;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public SurveyQuestion getQuestion() { return question; }
    public void setQuestion(SurveyQuestion question) { this.question = question; }
    public String getOptionText() { return optionText; }
    public void setOptionText(String optionText) { this.optionText = optionText; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
}