package com.example.SWPP.repository;

import com.example.SWPP.entity.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository cho Reaction, xử lý các truy vấn cơ bản và tùy chỉnh cho reaction.
 * Kế thừa JpaRepository để hỗ trợ CRUD và thêm phương thức tìm kiếm theo user và post.
 */
@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    /**
     * Tìm reaction theo user và post, trả về Optional để xử lý trường hợp không tìm thấy.
     * @param userId ID của người dùng.
     * @param postId ID của bài viết.
     * @return Optional chứa Reaction nếu tìm thấy, không thì Optional.empty().
     */
    Optional<Reaction> findByUserUserIdAndPostId(Long userId, Long postId);
    long countByPostIdAndType(Long postId, Reaction.ReactionType type);
}