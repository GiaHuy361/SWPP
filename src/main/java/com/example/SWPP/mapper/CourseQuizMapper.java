package com.example.SWPP.mapper;

import com.example.SWPP.dto.CourseQuizDTO;
import com.example.SWPP.entity.CourseQuiz;

public class CourseQuizMapper {
    public static CourseQuizDTO toDto(CourseQuiz quiz) {
        CourseQuizDTO dto = new CourseQuizDTO();
        dto.setId(quiz.getId());
        dto.setCourseId(quiz.getCourse().getId());
        dto.setDurationMinutes(quiz.getDurationMinutes());
        dto.setShuffleQuestions(quiz.getShuffleQuestions());
        dto.setShuffleAnswers(quiz.getShuffleAnswers());
        dto.setPassingPercentage(quiz.getPassingPercentage());
        return dto;
    }

    public static CourseQuiz toEntity(CourseQuizDTO dto) {
        CourseQuiz quiz = new CourseQuiz();
        quiz.setDurationMinutes(dto.getDurationMinutes());
        quiz.setShuffleQuestions(dto.getShuffleQuestions());
        quiz.setShuffleAnswers(dto.getShuffleAnswers());
        quiz.setPassingPercentage(dto.getPassingPercentage());
        return quiz;
    }
}
