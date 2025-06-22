package com.example.SWPP.mapper;

import com.example.SWPP.dto.CourseLessonDTO;
import com.example.SWPP.entity.CourseLesson;

public class CourseLessonMapper {
    public static CourseLessonDTO toDto(CourseLesson lesson) {
        CourseLessonDTO dto = new CourseLessonDTO();
        dto.setId(lesson.getId());
        dto.setModuleId(lesson.getModule().getId());
        dto.setTitle(lesson.getTitle());
        dto.setContent(lesson.getContent());
        dto.setVideoUrl(lesson.getVideoUrl());
        dto.setPosition(lesson.getPosition());
        return dto;
    }

    public static CourseLesson toEntity(CourseLessonDTO dto) {
        CourseLesson lesson = new CourseLesson();
        lesson.setTitle(dto.getTitle());
        lesson.setContent(dto.getContent());
        lesson.setVideoUrl(dto.getVideoUrl());
        lesson.setPosition(dto.getPosition());
        return lesson;
    }
}