package com.example.SWPP.controller;

import com.example.SWPP.entity.PostView;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.UserRepository;
import com.example.SWPP.service.PostViewService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

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
     * Ghi nhận lượt xem cho bài viết, yêu cầu đăng nhập.
     * @param postId ID bài viết.
     * @param authentication Thông tin xác thực người dùng.
     * @param request Request để lấy IP.
     * @return Response 201 nếu thành công, 401 nếu chưa đăng nhập.
     */
    @PostMapping
    public ResponseEntity<Void> recordView(
            @PathVariable Long postId,
            Authentication authentication,
            HttpServletRequest request) {
        logger.info("Ghi nhận lượt xem cho postId: {}", postId);

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            logger.warn("Yêu cầu đăng nhập để ghi nhận lượt xem cho postId: {}", postId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String principal = authentication.getName();
        User user = userRepository.findByUsername(principal)
                .or(() -> userRepository.findByEmail(principal))
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng: " + principal));
        Long userId = user.getUserId();

        // Lấy IP từ X-Forwarded-For hoặc Remote-Addr
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.getRemoteAddr();
        }
        if (ipAddress == null) {
            ipAddress = "unknown";
            logger.warn("Không xác định được IP cho postId: {}", postId);
        }

        try {
            PostView view = postViewService.recordView(postId, userId, ipAddress);
            if (view == null) {
                logger.info("Lượt xem không được ghi nhận do đã tồn tại cho postId: {}, userId: {}", postId, userId);
                return ResponseEntity.status(HttpStatus.OK).build();
            }
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (IllegalArgumentException e) {
            logger.error("Lỗi khi ghi nhận lượt xem cho postId: {} - {}", postId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Lấy số lượt xem của bài viết.
     * @param postId ID bài viết.
     * @return Số lượt xem.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getViewCount(@PathVariable Long postId) {
        logger.info("Lấy số lượt xem cho postId: {}", postId);
        try {
            long count = postViewService.countViewsByPostId(postId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy số lượt xem cho postId: {} - {}", postId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}