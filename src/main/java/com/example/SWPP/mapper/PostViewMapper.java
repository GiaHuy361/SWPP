package com.example.SWPP.mapper;

import com.example.SWPP.dto.PostViewDTO;
import com.example.SWPP.entity.PostView;
import org.springframework.stereotype.Component;

/**
 * Mapper cho PostView, ánh xạ giữa entity và DTO.
 * Sử dụng phương thức tĩnh để chuyển đổi.
 */
@Component
public class PostViewMapper {
    /**
     * Chuyển đổi PostView entity sang PostViewDTO.
     * @param entity PostView entity.
     * @return PostViewDTO chứa thông tin lượt xem.
     */
    public static PostViewDTO toDto(PostView entity) {
        PostViewDTO dto = new PostViewDTO();
        dto.setId(entity.getId());
        dto.setPostId(entity.getPost().getId());
        if (entity.getUser() != null) {
            dto.setUserId(entity.getUser().getUserId());
        }
        dto.setIpAddress(entity.getIpAddress());
        dto.setViewedAt(entity.getViewedAt());
        return dto;
    }
}