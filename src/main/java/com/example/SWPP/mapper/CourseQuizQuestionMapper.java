package com.example.SWPP.mapper;

import com.example.SWPP.dto.CourseQuizQuestionDTO;
import com.example.SWPP.entity.CourseQuizQuestion;

public class CourseQuizQuestionMapper {
    public static CourseQuizQuestionDTO toDto(CourseQuizQuestion question) {
        CourseQuizQuestionDTO dto = new CourseQuizQuestionDTO();
        dto.setId(question.getId());
        dto.setQuizId(question.getQuiz().getId());
        dto.setQuestionText(question.getQuestionText());
        dto.setExplanation(question.getExplanation());
        dto.setPosition(question.getPosition());
        dto.setQuestionType(question.getQuestionType());
        return dto;
    }

    public static CourseQuizQuestion toEntity(CourseQuizQuestionDTO dto) {
        CourseQuizQuestion question = new CourseQuizQuestion();
        question.setQuestionText(dto.getQuestionText());
        question.setExplanation(dto.getExplanation());
        question.setPosition(dto.getPosition());
        question.setQuestionType(dto.getQuestionType());
        return question;
    }
}
