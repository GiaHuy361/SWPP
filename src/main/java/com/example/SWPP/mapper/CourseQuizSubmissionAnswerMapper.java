package com.example.SWPP.mapper;

import com.example.SWPP.dto.CourseQuizSubmissionAnswerDTO;
import com.example.SWPP.entity.CourseQuizAnswer;
import com.example.SWPP.entity.CourseQuizQuestion;
import com.example.SWPP.entity.CourseQuizSubmissionAnswer;

public class CourseQuizSubmissionAnswerMapper {

    public static CourseQuizSubmissionAnswerDTO toDto(CourseQuizSubmissionAnswer answer) {
        CourseQuizSubmissionAnswerDTO dto = new CourseQuizSubmissionAnswerDTO();

        dto.setId(answer.getId());
        dto.setSubmissionId(answer.getSubmission() != null ? answer.getSubmission().getId() : null);
        dto.setQuestionId(answer.getQuestion() != null ? answer.getQuestion().getId() : null);
        dto.setSelectedAnswerId(answer.getSelectedAnswer() != null ? answer.getSelectedAnswer().getId() : null);
        dto.setSelectedAnswerText(
                answer.getSelectedAnswer() != null
                        ? answer.getSelectedAnswer().getAnswerText()
                        : null
        );

        return dto;
    }

    public static CourseQuizSubmissionAnswer toEntity(CourseQuizSubmissionAnswerDTO dto) {
        CourseQuizSubmissionAnswer answer = new CourseQuizSubmissionAnswer();

        answer.setId(dto.getId());

        if (dto.getQuestionId() != null) {
            CourseQuizQuestion question = new CourseQuizQuestion();
            question.setId(dto.getQuestionId());
            answer.setQuestion(question);
        }

        if (dto.getSelectedAnswerId() != null) {
            CourseQuizAnswer selectedAnswer = new CourseQuizAnswer();
            selectedAnswer.setId(dto.getSelectedAnswerId());
            answer.setSelectedAnswer(selectedAnswer);
        }

        return answer;
    }
}