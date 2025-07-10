package com.example.SWPP.controller;

import com.example.SWPP.dto.BlogPostDTO;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.UserRepository;
import com.example.SWPP.service.BlogPostService;
import com.example.SWPP.service.PostViewService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/blogposts")
public class BlogPostController {

    private static final Logger logger = LoggerFactory.getLogger(BlogPostController.class);
    private final BlogPostService blogPostService;
    private final PostViewService postViewService;
    private final UserRepository userRepository;

    public BlogPostController(BlogPostService blogPostService, PostViewService postViewService, UserRepository userRepository) {
        this.blogPostService = blogPostService;
        this.postViewService = postViewService;
        this.userRepository = userRepository;
    }

    @GetMapping("/published")
    public ResponseEntity<Page<BlogPostDTO>> getPublishedPosts(Pageable pageable) {
        logger.info("Lấy danh sách bài viết đã xuất bản, page: {}", pageable.getPageNumber());
        Page<BlogPostDTO> posts = blogPostService.getPublishedPosts(pageable);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('MANAGE_BLOGS')")
    public ResponseEntity<Page<BlogPostDTO>> getAllPosts(Pageable pageable) {
        logger.info("Lấy tất cả bài viết, page: {}", pageable.getPageNumber());
        Page<BlogPostDTO> posts = blogPostService.getAllPosts(pageable);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<BlogPostDTO> getPostBySlug(@PathVariable String slug, Authentication authentication, HttpServletRequest request) {
        logger.info("Lấy bài viết với slug: {}", slug);
        BlogPostDTO post = blogPostService.getPostBySlug(slug);

        // Lấy userId nếu người dùng đã đăng nhập
        Long userId = null;
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            String principal = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(principal);
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByEmail(principal);
            }
            User user = userOpt.orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại: " + principal));
            userId = user.getUserId();
        }

        // Lấy địa chỉ IP
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.getRemoteAddr();
        }
        if (ipAddress == null) {
            ipAddress = "unknown";
            logger.warn("Không xác định được IP cho slug: {}", slug);
        }

        // Ghi nhận lượt xem nếu đã đăng nhập
        if (userId != null) {
            try {
                postViewService.recordView(post.getId(), userId, ipAddress);
            } catch (IllegalArgumentException e) {
                logger.warn("Không ghi nhận lượt xem cho postId {}: {}", post.getId(), e.getMessage());
            }
        }

        return ResponseEntity.ok(post);
    }

    @GetMapping("/id/{id}")
    @PreAuthorize("hasAuthority('MANAGE_BLOGS')")
    public ResponseEntity<BlogPostDTO> getPostById(@PathVariable Long id) {
        logger.info("Lấy bài viết với id: {}", id);
        try {
            BlogPostDTO post = blogPostService.getPostById(id);
            return ResponseEntity.ok(post);
        } catch (IllegalArgumentException e) {
            logger.error("Không tìm thấy bài viết với id: {} - {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_BLOGS')")
    public ResponseEntity<BlogPostDTO> createPost(@Valid @RequestBody BlogPostDTO dto, Authentication authentication) {
        String principal = authentication.getName();
        User user = userRepository.findByUsername(principal)
                .or(() -> userRepository.findByEmail(principal))
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));

        BlogPostDTO created = blogPostService.createPost(dto, user.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_BLOGS')")
    public ResponseEntity<BlogPostDTO> updatePost(@PathVariable Long id, @Valid @RequestBody BlogPostDTO dto, Authentication authentication) {
        String principal = authentication.getName();
        BlogPostDTO updated = blogPostService.updatePost(id, dto, principal);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_BLOGS')")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, Authentication authentication) {
        String principal = authentication.getName();
        blogPostService.deletePost(id, principal);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAuthority('MANAGE_BLOGS')")
    public ResponseEntity<BlogPostDTO> publishPost(@PathVariable Long id, Authentication authentication) {
        String principal = authentication.getName();
        BlogPostDTO published = blogPostService.publishPost(id, principal);
        return ResponseEntity.ok(published);
    }
}