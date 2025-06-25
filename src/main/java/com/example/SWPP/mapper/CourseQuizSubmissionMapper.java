package com.example.SWPP.mapper;

import com.example.SWPP.dto.CourseQuizSubmissionAnswerDTO;
import com.example.SWPP.dto.CourseQuizSubmissionDTO;
import com.example.SWPP.entity.CourseQuiz;
import com.example.SWPP.entity.CourseQuizAnswer;
import com.example.SWPP.entity.CourseQuizQuestion;
import com.example.SWPP.entity.CourseQuizSubmission;
import com.example.SWPP.entity.CourseQuizSubmissionAnswer;
import com.example.SWPP.entity.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class CourseQuizSubmissionMapper {

    public static CourseQuizSubmission toEntity(CourseQuizSubmissionDTO dto) {
        CourseQuizSubmission submission = new CourseQuizSubmission();

        submission.setId(dto.getId());

        if (dto.getUserId() != null) {
            User user = new User();
            user.setUserId(dto.getUserId());
            submission.setUser(user);
        }

        if (dto.getQuizId() != null) {
            CourseQuiz quiz = new CourseQuiz();
            quiz.setId(dto.getQuizId());
            submission.setQuiz(quiz);
        }

        submission.setSubmittedAt(dto.getSubmittedAt() != null ? dto.getSubmittedAt() : LocalDateTime.now());
        submission.setPercentageScore(dto.getPercentageScore());
        submission.setPassed(dto.getPassed());
        submission.setDurationTaken(dto.getDurationTaken());

        // Convert list of answer DTOs to entities
        List<CourseQuizSubmissionAnswer> answers = dto.getAnswers().stream()
                .map(CourseQuizSubmissionAnswerMapper::toEntity)
                .peek(answer -> answer.setSubmission(submission))
                .collect(Collectors.toList());

        submission.setAnswers(answers);
        return submission;
    }

    public static CourseQuizSubmissionDTO toDto(CourseQuizSubmission submission) {
        CourseQuizSubmissionDTO dto = new CourseQuizSubmissionDTO();

        dto.setId(submission.getId());
        dto.setUserId(submission.getUser() != null ? submission.getUser().getUserId() : null);
        dto.setQuizId(submission.getQuiz() != null ? submission.getQuiz().getId() : null);
        dto.setSubmittedAt(submission.getSubmittedAt());
        dto.setPercentageScore(submission.getPercentageScore());
        dto.setPassed(submission.getPassed());
        dto.setDurationTaken(submission.getDurationTaken());

        List<CourseQuizSubmissionAnswerDTO> answers = submission.getAnswers().stream()
                .map(CourseQuizSubmissionAnswerMapper::toDto)
                .collect(Collectors.toList());
        dto.setAnswers(answers);

        return dto;
    }
}