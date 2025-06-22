package com.example.SWPP.mapper;

import com.example.SWPP.dto.CourseQuizAnswerDTO;
import com.example.SWPP.entity.CourseQuizAnswer;

public class CourseQuizAnswerMapper {
    public static CourseQuizAnswerDTO toDto(CourseQuizAnswer answer) {
        CourseQuizAnswerDTO dto = new CourseQuizAnswerDTO();
        dto.setId(answer.getId());
        dto.setQuestionId(answer.getQuestion().getId());
        dto.setAnswerText(answer.getAnswerText());
        dto.setIsCorrect(answer.getIsCorrect());
        return dto;
    }

    public static CourseQuizAnswer toEntity(CourseQuizAnswerDTO dto) {
        CourseQuizAnswer answer = new CourseQuizAnswer();
        answer.setAnswerText(dto.getAnswerText());
        answer.setIsCorrect(dto.getIsCorrect());
        return answer;
    }
}
