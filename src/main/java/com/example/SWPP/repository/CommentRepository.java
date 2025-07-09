package com.example.SWPP.repository;

import com.example.SWPP.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository cho Comment, xử lý các truy vấn cơ bản và tùy chỉnh cho bình luận.
 * Kế thừa JpaRepository để hỗ trợ CRUD và thêm phương thức tìm kiếm theo bài viết.
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    /**
     * Tìm danh sách bình luận theo ID bài viết, sắp xếp theo thời gian tạo tăng dần.
     * @param postId ID của bài viết.
     * @return Danh sách Comment.
     */
    List<Comment> findByPostIdOrderByCreatedAtAsc(Long postId);
}