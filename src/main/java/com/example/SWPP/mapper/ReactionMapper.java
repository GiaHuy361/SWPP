package com.example.SWPP.mapper;

import com.example.SWPP.dto.ReactionDTO;
import com.example.SWPP.entity.Reaction;
import org.springframework.stereotype.Component;

/**
 * Mapper cho Reaction, ánh xạ giữa entity và DTO.
 * Sử dụng phương thức tĩnh để chuyển đổi, dễ kiểm soát và debug.
 */
@Component
public class ReactionMapper {
    /**
     * Chuyển đổi Reaction entity sang ReactionDTO.
     * @param entity Reaction entity.
     * @return ReactionDTO chứa thông tin reaction.
     */
    public static ReactionDTO toDto(Reaction entity) {
        ReactionDTO dto = new ReactionDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser().getUserId());
        dto.setPostId(entity.getPost().getId());
        dto.setType(entity.getType());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}