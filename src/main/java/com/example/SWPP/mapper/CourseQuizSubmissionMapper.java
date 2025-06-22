package com.example.SWPP.mapper;

import com.example.SWPP.dto.CourseQuizSubmissionDTO;
import com.example.SWPP.entity.CourseQuizSubmission;

import java.util.stream.Collectors;

public class CourseQuizSubmissionMapper {
    public static CourseQuizSubmissionDTO toDto(CourseQuizSubmission submission) {
        CourseQuizSubmissionDTO dto = new CourseQuizSubmissionDTO();
        dto.setId(submission.getId());
        dto.setUserId(submission.getUser().getUserId());
        dto.setQuizId(submission.getQuiz().getId());
        dto.setSubmittedAt(submission.getSubmittedAt());
        dto.setPercentageScore(submission.getPercentageScore());
        dto.setPassed(submission.getPassed());
        dto.setDurationTaken(submission.getDurationTaken());
        dto.setAnswerIds(submission.getAnswers().stream()
                .map(answer -> answer.getId())
                .collect(Collectors.toList()));
        return dto;
    }

    public static CourseQuizSubmission toEntity(CourseQuizSubmissionDTO dto) {
        CourseQuizSubmission submission = new CourseQuizSubmission();
        submission.setPercentageScore(dto.getPercentageScore());
        submission.setPassed(dto.getPassed());
        submission.setDurationTaken(dto.getDurationTaken());
        return submission;
    }
}