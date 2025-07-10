package com.example.SWPP.service;

import com.example.SWPP.entity.BlogPost;
import com.example.SWPP.entity.PostView;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.BlogPostRepository;
import com.example.SWPP.repository.PostViewRepository;
import com.example.SWPP.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service xử lý logic liên quan đến lượt xem bài viết.
 */
@Service
public class PostViewService {
    private static final Logger logger = LoggerFactory.getLogger(PostViewService.class);
    private final PostViewRepository postViewRepository;
    private final BlogPostRepository blogPostRepository;
    private final UserRepository userRepository;

    public PostViewService(PostViewRepository postViewRepository, BlogPostRepository blogPostRepository, UserRepository userRepository) {
        this.postViewRepository = postViewRepository;
        this.blogPostRepository = blogPostRepository;
        this.userRepository = userRepository;
    }

    /**
     * Ghi nhận lượt xem cho bài viết, chỉ khi người dùng đăng nhập.
     * Chỉ ghi nhận nếu chưa có lượt xem từ cùng userId trong 24 giờ.
     * @param postId ID bài viết.
     * @param userId ID người dùng (bắt buộc).
     * @param ipAddress Địa chỉ IP (không sử dụng nếu chỉ cần đăng nhập).
     * @return PostView entity vừa tạo hoặc null nếu không ghi nhận.
     * @throws IllegalArgumentException nếu bài viết hoặc người dùng không tồn tại.
     */
    @Transactional
    public PostView recordView(Long postId, Long userId, String ipAddress) {
        logger.info("Bắt đầu ghi nhận lượt xem: postId={}, userId={}, ip={}", postId, userId, ipAddress);

        if (userId == null) {
            logger.warn("Không ghi nhận lượt xem: Yêu cầu đăng nhập (userId null)");
            throw new IllegalArgumentException("Yêu cầu đăng nhập để ghi nhận lượt xem.");
        }

        BlogPost post = blogPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Bài viết không tồn tại: " + postId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại: " + userId));

        // Kiểm tra xem có lượt xem nào từ cùng userId trong 24 giờ qua không
        LocalDateTime oneDayAgo = LocalDateTime.now().minusHours(24);
        boolean viewExists = postViewRepository.existsByPostIdAndUserUserIdAndViewedAtAfter(postId, userId, oneDayAgo);

        if (viewExists) {
            logger.info("Lượt xem đã tồn tại cho postId={} từ userId={}", postId, userId);
            return null; // Không ghi nhận lượt xem mới
        }

        PostView view = new PostView();
        view.setPost(post);
        view.setUser(user);
        view.setIpAddress(ipAddress);

        PostView savedView = postViewRepository.save(view);
        logger.info("Đã lưu lượt xem: postId={}, viewId={}, userId={}", postId, savedView.getId(), userId);
        return savedView;
    }

    /**
     * Đếm số lượt xem của bài viết.
     * @param postId ID bài viết.
     * @return Số lượt xem.
     */
    public long countViewsByPostId(Long postId) {
        logger.info("Đếm lượt xem cho postId: {}", postId);
        long count = postViewRepository.countByPostId(postId);
        logger.info("Số lượt xem cho postId {}: {}", postId, count);
        return count;
    }
}