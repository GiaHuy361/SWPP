package com.example.SWPP.mapper;

import com.example.SWPP.dto.CourseModuleDTO;
import com.example.SWPP.entity.CourseModule;

public class CourseModuleMapper {
    public static CourseModuleDTO toDto(CourseModule module) {
        CourseModuleDTO dto = new CourseModuleDTO();
        dto.setId(module.getId());
        dto.setCourseId(module.getCourse().getId());
        dto.setTitle(module.getTitle());
        dto.setDescription(module.getDescription());
        dto.setPosition(module.getPosition());
        return dto;
    }

    public static CourseModule toEntity(CourseModuleDTO dto) {
        CourseModule module = new CourseModule();
        module.setTitle(dto.getTitle());
        module.setDescription(dto.getDescription());
        module.setPosition(dto.getPosition());
        return module;
    }
}
