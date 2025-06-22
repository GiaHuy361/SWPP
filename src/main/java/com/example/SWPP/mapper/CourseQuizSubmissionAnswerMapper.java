package com.example.SWPP.mapper;

import com.example.SWPP.dto.CourseQuizSubmissionAnswerDTO;
import com.example.SWPP.entity.CourseQuizSubmissionAnswer;

public class CourseQuizSubmissionAnswerMapper {
    public static CourseQuizSubmissionAnswerDTO toDto(CourseQuizSubmissionAnswer answer) {
        CourseQuizSubmissionAnswerDTO dto = new CourseQuizSubmissionAnswerDTO();
        dto.setId(answer.getId());
        dto.setSubmissionId(answer.getSubmission().getId());
        dto.setQuestionId(answer.getQuestion().getId());
        dto.setSelectedAnswerId(answer.getSelectedAnswer().getId());
        dto.setSelectedAnswer(answer.getSelectedAnswer().getAnswerText()); // Lấy text từ selectedAnswer
        return dto;
    }

    public static CourseQuizSubmissionAnswer toEntity(CourseQuizSubmissionAnswerDTO dto) {
        CourseQuizSubmissionAnswer answer = new CourseQuizSubmissionAnswer();
        answer.setSelectedAnswer(null); // Đặt null, sẽ được gán trong service
        return answer;
    }
}