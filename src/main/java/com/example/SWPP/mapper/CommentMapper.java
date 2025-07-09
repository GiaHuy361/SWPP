package com.example.SWPP.mapper;

import com.example.SWPP.dto.CommentDTO;
import com.example.SWPP.entity.BlogPost;
import com.example.SWPP.entity.Comment;
import com.example.SWPP.entity.User;
import org.springframework.stereotype.Component;

/**
 * Mapper cho Comment, ánh xạ giữa entity và DTO.
 * Sử dụng phương thức tĩnh để chuyển đổi, dễ kiểm soát và debug.
 */
@Component
public class CommentMapper {
    /**
     * Chuyển đổi Comment entity sang CommentDTO.
     * @param entity Comment entity.
     * @return CommentDTO chứa thông tin bình luận.
     */
    public static CommentDTO toDto(Comment entity) {
        CommentDTO dto = new CommentDTO();
        dto.setId(entity.getId());
        dto.setContent(entity.getContent());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setAuthorId(entity.getAuthor().getUserId());
        dto.setPostId(entity.getPost().getId());
        if (entity.getParent() != null) {
            dto.setParentId(entity.getParent().getId());
        }
        return dto;
    }

    /**
     * Chuyển đổi CommentDTO sang Comment entity, dùng cho tạo bình luận.
     * @param dto CommentDTO chứa thông tin từ request.
     * @param author User là tác giả bình luận.
     * @param post BlogPost liên quan đến bình luận.
     * @param parent Comment cha (nếu là reply).
     * @return Comment entity.
     */
    public static Comment toEntity(CommentDTO dto, User author, BlogPost post, Comment parent) {
        Comment entity = new Comment();
        entity.setContent(dto.getContent());
        entity.setAuthor(author);
        entity.setPost(post);
        entity.setParent(parent);
        return entity;
    }
}