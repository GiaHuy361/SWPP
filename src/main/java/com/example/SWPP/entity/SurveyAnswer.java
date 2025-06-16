package com.example.SWPP.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "survey_answer")
public class SurveyAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "response_id", nullable = false)
    private SurveyResponse response;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private SurveyQuestion question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_id")
    private SurveyOption option;

    @Column(columnDefinition = "TEXT")
    private String optionIds; // Lưu danh sách option IDs dưới dạng JSON cho CHECKBOX_MULTIPLE

    @Column
    private Integer score;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public SurveyResponse getResponse() { return response; }
    public void setResponse(SurveyResponse response) { this.response = response; }
    public SurveyQuestion getQuestion() { return question; }
    public void setQuestion(SurveyQuestion question) { this.question = question; }
    public SurveyOption getOption() { return option; }
    public void setOption(SurveyOption option) { this.option = option; }
    public String getOptionIds() { return optionIds; }
    public void setOptionIds(String optionIds) { this.optionIds = optionIds; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
}