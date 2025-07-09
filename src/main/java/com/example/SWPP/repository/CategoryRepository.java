package com.example.SWPP.repository;

import com.example.SWPP.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho Category, xử lý các truy vấn cơ bản và tùy chỉnh cho danh mục.
 * Kế thừa JpaRepository để hỗ trợ CRUD và thêm phương thức tìm kiếm theo slug và parent.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    /**
     * Tìm danh mục theo slug, trả về Optional để xử lý trường hợp không tìm thấy.
     * @param slug Slug của danh mục, duy nhất.
     * @return Optional chứa Category nếu tìm thấy, không thì Optional.empty().
     */
    Optional<Category> findBySlug(String slug);

    /**
     * Tìm danh sách danh mục con theo ID danh mục cha.
     * @param parentId ID của danh mục cha.
     * @return Danh sách Category là con của danh mục cha.
     */
    List<Category> findByParentId(Long parentId);
}