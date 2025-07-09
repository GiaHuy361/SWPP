package com.example.SWPP.repository;

import com.example.SWPP.entity.BlogPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Repository cho BlogPost, xử lý các truy vấn cơ bản và tùy chỉnh cho bài viết blog.
 * Kế thừa JpaRepository để hỗ trợ CRUD và thêm các phương thức tìm kiếm theo slug và trạng thái xuất bản.
 */
@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {
    /**
     * Tìm bài viết theo slug, trả về Optional để xử lý trường hợp không tìm thấy.
     * @param slug Slug của bài viết, duy nhất.
     * @return Optional chứa BlogPost nếu tìm thấy, không thì Optional.empty().
     */
    Optional<BlogPost> findBySlug(String slug);

    /**
     * Tìm danh sách bài viết đã xuất bản (publishedAt <= currentTime và không null), hỗ trợ phân trang.
     * @param currentTime Thời gian hiện tại để so sánh với publishedAt.
     * @param pageable Đối tượng phân trang, bao gồm sort và page size.
     * @return Page chứa danh sách bài viết đã xuất bản.
     */
    @Query("SELECT p FROM BlogPost p WHERE p.publishedAt IS NOT NULL AND p.publishedAt <= :currentTime")
    Page<BlogPost> findPublishedPosts(@Param("currentTime") LocalDateTime currentTime, Pageable pageable);

}