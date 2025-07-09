package com.example.SWPP.repository;

import com.example.SWPP.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository cho Bookmark, xử lý các truy vấn cơ bản và tùy chỉnh cho bookmark.
 * Kế thừa JpaRepository để hỗ trợ CRUD và thêm phương thức kiểm tra bookmark tồn tại.
 */
@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    /**
     * Kiểm tra xem người dùng đã bookmark bài viết chưa, trả về Optional để xử lý trường hợp không tồn tại.
     * @param userId ID của người dùng.
     * @param postId ID của bài viết.
     * @return Optional chứa Bookmark nếu tồn tại, không thì Optional.empty().
     */
    Optional<Bookmark> findByUserUserIdAndPostId(Long userId, Long postId);

}