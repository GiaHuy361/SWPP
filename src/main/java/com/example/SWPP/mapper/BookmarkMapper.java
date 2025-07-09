package com.example.SWPP.mapper;

import com.example.SWPP.dto.BookmarkDTO;
import com.example.SWPP.entity.BlogPost;
import com.example.SWPP.entity.Bookmark;
import com.example.SWPP.entity.User;
import org.springframework.stereotype.Component;

/**
 * Mapper cho Bookmark, ánh xạ giữa entity và DTO.
 * Sử dụng phương thức tĩnh để chuyển đổi, dễ kiểm soát và debug.
 */
@Component
public class BookmarkMapper {
    /**
     * Chuyển đổi Bookmark entity sang BookmarkDTO.
     * @param entity Bookmark entity.
     * @return BookmarkDTO chứa thông tin bookmark.
     */
    public static BookmarkDTO toDto(Bookmark entity) {
        BookmarkDTO dto = new BookmarkDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser().getUserId());
        dto.setPostId(entity.getPost().getId());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    /**
     * Chuyển đổi BookmarkDTO sang Bookmark entity, dùng cho tạo bookmark.
     * @param dto BookmarkDTO chứa thông tin từ request.
     * @param user User là người bookmark.
     * @param post BlogPost được bookmark.
     * @return Bookmark entity.
     */
    public static Bookmark toEntity(BookmarkDTO dto, User user, BlogPost post) {
        Bookmark entity = new Bookmark();
        entity.setUser(user);
        entity.setPost(post);
        return entity;
    }
}