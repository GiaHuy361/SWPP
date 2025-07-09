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

import java.util.Optional;

/**
 * Service cho PostView, xử lý logic nghiệp vụ liên quan đến lượt xem bài viết.
 * Bao gồm ghi nhận lượt xem từ người dùng hoặc IP.
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
     * Ghi nhận một lượt xem cho bài viết.
     * @param postId ID của bài viết.
     * @param userId ID của người dùng (nếu có).
     * @param ipAddress Địa chỉ IP của người xem.
     * @return PostView entity vừa tạo.
     * @throws IllegalArgumentException nếu bài viết không tồn tại.
     */
    @Transactional
    public PostView recordView(Long postId, Optional<Long> userId, String ipAddress) {
        logger.info("Ghi nhận lượt xem cho post ID: {}, user ID: {}, IP: {}", postId, userId.orElse(null), ipAddress);
        BlogPost post = blogPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Bài viết không tồn tại"));
        PostView view = new PostView();
        view.setPost(post);
        if (userId.isPresent()) {
            User user = userRepository.findById(userId.get())
                    .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
            view.setUser(user);
        }
        view.setIpAddress(ipAddress);
        return postViewRepository.save(view);
    }

    /**
     * Đếm số lượt xem của bài viết.
     * @param postId ID của bài viết.
     * @return Số lượt xem.
     */
    public long countViewsByPostId(Long postId) {
        return postViewRepository.countByPostId(postId);
    }
}