package com.example.SWPP.mapper;

import com.example.SWPP.dto.BlogPostDTO;
import com.example.SWPP.entity.BlogPost;
import com.example.SWPP.entity.Category;
import com.example.SWPP.entity.User;
import org.springframework.stereotype.Component;

/**
 * Mapper cho BlogPost, ánh xạ giữa entity và DTO.
 * Sử dụng phương thức tĩnh để chuyển đổi, dễ kiểm soát và debug.
 */
@Component
public class BlogPostMapper {
    /**
     * Chuyển đổi BlogPost entity sang BlogPostDTO.
     * @param entity BlogPost entity.
     * @return BlogPostDTO chứa thông tin bài viết.
     */
    public static BlogPostDTO toDto(BlogPost entity) {
        BlogPostDTO dto = new BlogPostDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setSlug(entity.getSlug());
        dto.setExcerpt(entity.getExcerpt());
        dto.setContent(entity.getContent());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setPublishedAt(entity.getPublishedAt());
        dto.setCategoryId(entity.getCategory().getId());
        dto.setAuthorId(entity.getAuthor().getUserId());
        return dto;
    }

    /**
     * Chuyển đổi BlogPostDTO sang BlogPost entity, dùng cho tạo bài viết.
     * @param dto BlogPostDTO chứa thông tin từ request.
     * @param author User là tác giả bài viết.
     * @param category Category của bài viết.
     * @return BlogPost entity.
     */
    public static BlogPost toEntity(BlogPostDTO dto, User author, Category category) {
        BlogPost entity = new BlogPost();
        entity.setTitle(dto.getTitle());
        entity.setSlug(dto.getSlug());
        entity.setExcerpt(dto.getExcerpt());
        entity.setContent(dto.getContent());
        entity.setPublishedAt(dto.getPublishedAt());
        entity.setCategory(category);
        entity.setAuthor(author);
        return entity;
    }
}