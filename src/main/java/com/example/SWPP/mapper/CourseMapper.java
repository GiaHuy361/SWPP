package com.example.SWPP.mapper;

import com.example.SWPP.dto.CourseDTO;
import com.example.SWPP.entity.Course;
import org.springframework.stereotype.Component;

@Component
public class CourseMapper {
    public static CourseDTO toDto(Course course) {
        CourseDTO dto = new CourseDTO();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle());
        dto.setLevel(course.getLevel());
        dto.setDescription(course.getDescription());
        dto.setRecommendedMinScore(course.getRecommendedMinScore());
        dto.setRecommendedMaxScore(course.getRecommendedMaxScore());
        dto.setAgeGroup(course.getAgeGroup());
        return dto;
    }

    public static Course toEntity(CourseDTO dto) {
        Course course = new Course();
        course.setTitle(dto.getTitle());
        course.setLevel(dto.getLevel());
        course.setDescription(dto.getDescription());
        course.setRecommendedMinScore(dto.getRecommendedMinScore());
        course.setRecommendedMaxScore(dto.getRecommendedMaxScore());
        course.setAgeGroup(dto.getAgeGroup());
        return course;
    }
}