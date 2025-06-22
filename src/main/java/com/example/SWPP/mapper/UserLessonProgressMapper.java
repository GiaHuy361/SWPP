package com.example.SWPP.mapper;

import com.example.SWPP.dto.UserLessonProgressDTO;
import com.example.SWPP.entity.UserLessonProgress;

public class UserLessonProgressMapper {
    public static UserLessonProgressDTO toDto(UserLessonProgress progress) {
        UserLessonProgressDTO dto = new UserLessonProgressDTO();
        dto.setId(progress.getId());
        dto.setUserId(progress.getUser().getUserId());
        dto.setLessonId(progress.getLesson().getId());
        dto.setCompletedAt(progress.getCompletedAt());
        dto.setCompletedFlag(progress.getCompletedFlag());
        return dto;
    }
}
