package com.example.SWPP.dto;

import java.util.List;

public class SurveyQuestionDTO {
    private Long id;
    private Long surveyId;
    private String questionText;
    private String questionType;
    private String correctAnswer;
    private List<SurveyOptionDTO> options;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getSurveyId() { return surveyId; }
    public void setSurveyId(Long surveyId) { this.surveyId = surveyId; }
    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public String getQuestionType() { return questionType; }
    public void setQuestionType(String questionType) { this.questionType = questionType; }
    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
    public List<SurveyOptionDTO> getOptions() { return options; }
    public void setOptions(List<SurveyOptionDTO> options) { this.options = options; }
}