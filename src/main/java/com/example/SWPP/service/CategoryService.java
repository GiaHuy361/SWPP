package com.example.SWPP.service;

import com.example.SWPP.dto.CategoryDTO;
import com.example.SWPP.entity.Category;
import com.example.SWPP.mapper.CategoryMapper;
import com.example.SWPP.repository.CategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service cho Category, xử lý logic nghiệp vụ liên quan đến danh mục.
 * Bao gồm lấy danh sách danh mục, chi tiết danh mục, và tạo danh mục mới.
 */
@Service
public class CategoryService {
    private static final Logger logger = LoggerFactory.getLogger(CategoryService.class);
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    /**
     * Lấy danh sách tất cả danh mục.
     * @return Danh sách CategoryDTO.
     */
    public List<CategoryDTO> getAllCategories() {
        logger.info("Lấy tất cả danh mục");
        return categoryRepository.findAll().stream()
                .map(CategoryMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết danh mục theo slug.
     * @param slug Slug của danh mục.
     * @return CategoryDTO chứa thông tin chi tiết.
     * @throws IllegalArgumentException nếu không tìm thấy danh mục.
     */
    public CategoryDTO getCategoryBySlug(String slug) {
        logger.info("Lấy danh mục với slug: {}", slug);
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Danh mục không tồn tại: " + slug));
        return CategoryMapper.toDto(category);
    }

    /**
     * Tạo danh mục mới, với parentId tùy chọn.
     * @param dto CategoryDTO chứa thông tin danh mục.
     * @param userId ID của người dùng tạo danh mục (để kiểm tra quyền).
     * @return CategoryDTO chứa thông tin danh mục vừa tạo.
     * @throws IllegalArgumentException nếu danh mục cha không tồn tại.
     * @throws AccessDeniedException nếu người dùng không có quyền MANAGE_CATEGORIES.
     */
    @Transactional
    public CategoryDTO createCategory(CategoryDTO dto, Long userId) {
        logger.info("Tạo danh mục mới: {}", dto.getName());
        Category parent = null;
        if (dto.getParentId() != null) {
            parent = categoryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Danh mục cha không tồn tại: " + dto.getParentId()));
        }
        Category category = CategoryMapper.toEntity(dto, parent);
        category.setSlug(generateUniqueSlug(dto.getName()));
        category = categoryRepository.save(category);
        return CategoryMapper.toDto(category);
    }

    /**
     * Tạo slug duy nhất từ tên danh mục.
     * @param name Tên danh mục.
     * @return Slug duy nhất.
     */
    private String generateUniqueSlug(String name) {
        String baseSlug = name.toLowerCase().replaceAll("[^a-z0-9]+", "-");
        String slug = baseSlug;
        int count = 1;
        while (categoryRepository.findBySlug(slug).isPresent()) {
            slug = baseSlug + "-" + count++;
        }
        return slug;
    }
}