package com.example.SWPP.dto;

public class SurveyOptionDTO {
    private Long id;
    private Long questionId;
    private String optionText;
    private Integer score;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }
    public String getOptionText() { return optionText; }
    public void setOptionText(String optionText) { this.optionText = optionText; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
}