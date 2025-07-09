package com.example.SWPP.controller;

import com.example.SWPP.entity.User;
import com.example.SWPP.repository.UserRepository;
import com.example.SWPP.service.PostViewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Controller cho PostView, cung cấp API RESTful để ghi nhận lượt xem bài viết.
 * Endpoint công khai, không yêu cầu xác thực.
 */
@RestController
@RequestMapping("/api/posts/{postId}/views")
public class PostViewController {
    private static final Logger logger = LoggerFactory.getLogger(PostViewController.class);
    private final PostViewService postViewService;
    private final UserRepository userRepository;

    public PostViewController(PostViewService postViewService, UserRepository userRepository) {
        this.postViewService = postViewService;
        this.userRepository = userRepository;
    }

    /**
     * Ghi nhận một lượt xem cho bài viết.
     * @param postId ID của bài viết.
     * @param authentication Authentication để lấy username nếu có.
     * @param xForwardedFor Header X-Forwarded-For để lấy IP qua proxy.
     * @param remoteAddr Remote address nếu không có proxy.
     * @return ResponseEntity với status 201 (Created).
     */
    @PostMapping
    public ResponseEntity<Void> recordView(@PathVariable Long postId, Authentication authentication, @RequestHeader(value = "X-Forwarded-For", required = false) String xForwardedFor, @RequestHeader(value = "Remote-Addr", required = false) String remoteAddr) {
        String ipAddress = xForwardedFor != null ? xForwardedFor : remoteAddr;
        Optional<Long> userId = Optional.empty();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            logger.info("Lấy userId từ username: {}", username);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
            userId = Optional.of(user.getUserId());
        }
        postViewService.recordView(postId, userId, ipAddress);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}