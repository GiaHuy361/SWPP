package com.example.SWPP.controller;

import com.example.SWPP.dto.BlogPostDTO;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.UserRepository;
import com.example.SWPP.service.BlogPostService;
import com.example.SWPP.service.PostViewService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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

    private final BlogPostService blogPostService;
    private final PostViewService postViewService;
    private final UserRepository userRepository;

    public BlogPostController(BlogPostService blogPostService, PostViewService postViewService, UserRepository userRepository) {
        this.blogPostService = blogPostService;
        this.postViewService = postViewService;
        this.userRepository = userRepository;
    }

    @GetMapping("/published")
    @PreAuthorize("hasAuthority('VIEW_BLOGS')")
    public ResponseEntity<Page<BlogPostDTO>> getPublishedPosts(Pageable pageable) {
        Page<BlogPostDTO> posts = blogPostService.getPublishedPosts(pageable);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('MANAGE_BLOGS')")
    public ResponseEntity<Page<BlogPostDTO>> getAllPosts(Pageable pageable) {
        Page<BlogPostDTO> posts = blogPostService.getAllPosts(pageable);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{slug}")
    @PreAuthorize("hasAuthority('VIEW_BLOGS')")
    public ResponseEntity<BlogPostDTO> getPostBySlug(@PathVariable String slug, Authentication authentication, HttpServletRequest request) {
        BlogPostDTO post = blogPostService.getPostBySlug(slug);

        String principal = authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())
                ? authentication.getName()
                : null;

        Optional<Long> userId = Optional.empty();
        if (principal != null) {
            Optional<User> userOpt = userRepository.findByUsername(principal);
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByEmail(principal);
            }
            User user = userOpt.orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
            userId = Optional.of(user.getUserId());
        }

        String ipAddress = request.getRemoteAddr();
        postViewService.recordView(post.getId(), userId, ipAddress);

        return ResponseEntity.ok(post);
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