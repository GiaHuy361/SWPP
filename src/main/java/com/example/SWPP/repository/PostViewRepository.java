package com.example.SWPP.repository;

import com.example.SWPP.entity.PostView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository cho PostView, xử lý các truy vấn cơ bản cho lượt xem bài viết.
 * Kế thừa JpaRepository để hỗ trợ CRUD và thêm phương thức đếm lượt xem.
 */
@Repository
public interface PostViewRepository extends JpaRepository<PostView, Long> {
    /**
     * Đếm số lượt xem của bài viết.
     * @param postId ID của bài viết.
     * @return Số lượt xem.
     */
    long countByPostId(Long postId);
}