package com.example.SWPP.controller;

import com.example.SWPP.dto.CategoryDTO;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.UserRepository;
import com.example.SWPP.service.CategoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * Controller cho Category, cung cấp các API RESTful để quản lý danh mục.
 * Bao gồm lấy danh sách danh mục, chi tiết danh mục, và tạo danh mục mới.
 * Yêu cầu quyền VIEW_BLOGS cho GET và MANAGE_CATEGORIES cho POST.
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private static final Logger logger = LoggerFactory.getLogger(CategoryController.class);

    private final CategoryService categoryService;
    private final UserRepository userRepository;

    public CategoryController(CategoryService categoryService, UserRepository userRepository) {
        this.categoryService = categoryService;
        this.userRepository = userRepository;
    }

    /**
     * Lấy danh sách tất cả danh mục, công khai.
     */
    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        List<CategoryDTO> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * Lấy chi tiết danh mục theo slug, công khai.
     */
    @GetMapping("/{slug}")
    public ResponseEntity<CategoryDTO> getCategoryBySlug(@PathVariable String slug) {
        CategoryDTO category = categoryService.getCategoryBySlug(slug);
        return ResponseEntity.ok(category);
    }

    /**
     * Tạo danh mục mới, yêu cầu quyền MANAGE_CATEGORIES.
     * Lấy userId từ Authentication.getName() rồi query UserRepository.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_CATEGORIES')")
    public ResponseEntity<CategoryDTO> createCategory(
            @Valid @RequestBody CategoryDTO dto,
            Authentication authentication) {

        // Lấy principal (có thể là username hoặc email)
        String principal = authentication.getName();

        // Tìm User bằng username, nếu không có thì tìm bằng email
        User user = userRepository.findByUsername(principal)
                .orElseGet(() -> userRepository.findByEmail(principal)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng: " + principal)));

        Long userId = user.getUserId();
        CategoryDTO category = categoryService.createCategory(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }
}
