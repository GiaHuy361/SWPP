package com.example.SWPP.dto;

public class SurveyAnswerDTO {
    private Long id;
    private Long responseId;
    private Long questionId;
    private Long optionId;
    private String optionIds; // Danh sách option IDs cho CHECKBOX_MULTIPLE
    private Integer score; // Điểm của câu trả lời

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getResponseId() { return responseId; }
    public void setResponseId(Long responseId) { this.responseId = responseId; }
    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }
    public Long getOptionId() { return optionId; }
    public void setOptionId(Long optionId) { this.optionId = optionId; }
    public String getOptionIds() { return optionIds; }
    public void setOptionIds(String optionIds) { this.optionIds = optionIds; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
}