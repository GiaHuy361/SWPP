package com.example.SWPP.mapper;

import com.example.SWPP.dto.CategoryDTO;
import com.example.SWPP.entity.Category;
import org.springframework.stereotype.Component;

/**
 * Mapper cho Category, ánh xạ giữa entity và DTO.
 * Sử dụng phương thức tĩnh để chuyển đổi, dễ kiểm soát và debug.
 */
@Component
public class CategoryMapper {
    /**
     * Chuyển đổi Category entity sang CategoryDTO.
     * @param entity Category entity.
     * @return CategoryDTO chứa thông tin danh mục.
     */
    public static CategoryDTO toDto(Category entity) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setSlug(entity.getSlug());
        if (entity.getParent() != null) {
            dto.setParentId(entity.getParent().getId());
        }
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    /**
     * Chuyển đổi CategoryDTO sang Category entity, dùng cho tạo danh mục.
     * @param dto CategoryDTO chứa thông tin từ request.
     * @param parent Category cha (nếu có).
     * @return Category entity.
     */
    public static Category toEntity(CategoryDTO dto, Category parent) {
        Category entity = new Category();
        entity.setName(dto.getName());
        entity.setParent(parent);
        return entity;
    }
}