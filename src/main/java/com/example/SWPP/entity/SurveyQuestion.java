package com.example.SWPP.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Entity
@Table(name = "survey_question", indexes = {@Index(name = "idx_survey_id", columnList = "survey_id")})
public class SurveyQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "survey_id", nullable = false)
    private Survey survey;

    @NotNull
    @Column(columnDefinition = "TEXT")
    private String questionText;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private QuestionType questionType;

    @Column(columnDefinition = "TEXT")
    private String correctAnswer;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SurveyAnswer> answers;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SurveyOption> options;

    public enum QuestionType {
        MULTIPLE_CHOICE, TRUE_FALSE, TEXT, CHECKBOX_MULTIPLE
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Survey getSurvey() { return survey; }
    public void setSurvey(Survey survey) { this.survey = survey; }
    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public QuestionType getQuestionType() { return questionType; }
    public void setQuestionType(QuestionType questionType) { this.questionType = questionType; }
    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
    public List<SurveyAnswer> getAnswers() { return answers; }
    public void setAnswers(List<SurveyAnswer> answers) { this.answers = answers; }
    public List<SurveyOption> getOptions() { return options; }
    public void setOptions(List<SurveyOption> options) { this.options = options; }
}