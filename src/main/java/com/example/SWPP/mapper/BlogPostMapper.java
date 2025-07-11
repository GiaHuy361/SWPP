package com.example.SWPP.mapper;

import com.example.SWPP.dto.BlogPostDTO;
import com.example.SWPP.entity.BlogPost;
import com.example.SWPP.entity.Category;
import com.example.SWPP.entity.User;
import org.springframework.stereotype.Component;

@Component
public class BlogPostMapper {
    public static BlogPostDTO toDto(BlogPost entity) {
        BlogPostDTO dto = new BlogPostDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setSlug(entity.getSlug());
        dto.setExcerpt(entity.getExcerpt());
        dto.setContent(entity.getContent());
        dto.setImageUrl(entity.getImageUrl());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setPublishedAt(entity.getPublishedAt());
        dto.setCategoryId(entity.getCategory().getId());
        dto.setCategoryName(entity.getCategory().getName());
        dto.setAuthorId(entity.getAuthor().getUserId());
        dto.setAuthorName(entity.getAuthorName() != null ? entity.getAuthorName() : entity.getAuthor().getFullName());
        return dto;
    }

    public static BlogPost toEntity(BlogPostDTO dto, User author, Category category) {
        BlogPost entity = new BlogPost();
        entity.setTitle(dto.getTitle());
        entity.setSlug(dto.getSlug());
        entity.setExcerpt(dto.getExcerpt());
        entity.setContent(dto.getContent());
        entity.setImageUrl(dto.getImageUrl());
        entity.setPublishedAt(dto.getPublishedAt());
        entity.setCategory(category);
        entity.setAuthor(author);
        entity.setAuthorName(dto.getAuthorName());
        return entity;
    }
}