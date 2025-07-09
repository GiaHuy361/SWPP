package com.example.SWPP.service;

import com.example.SWPP.dto.ReactionDTO;
import com.example.SWPP.entity.BlogPost;
import com.example.SWPP.entity.Reaction;
import com.example.SWPP.entity.User;
import com.example.SWPP.mapper.ReactionMapper;
import com.example.SWPP.repository.BlogPostRepository;
import com.example.SWPP.repository.ReactionRepository;
import com.example.SWPP.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service cho Reaction, xử lý logic nghiệp vụ liên quan đến reaction.
 * Bao gồm thiết lập và xóa reaction của người dùng cho bài viết.
 */
@Service
public class ReactionService {
    private static final Logger logger = LoggerFactory.getLogger(ReactionService.class);
    private final ReactionRepository reactionRepository;
    private final UserRepository userRepository;
    private final BlogPostRepository blogPostRepository;

    public ReactionService(ReactionRepository reactionRepository, UserRepository userRepository, BlogPostRepository blogPostRepository) {
        this.reactionRepository = reactionRepository;
        this.userRepository = userRepository;
        this.blogPostRepository = blogPostRepository;
    }

    /**
     * Lấy reaction của người dùng cho bài viết.
     * @param userId ID của người dùng.
     * @param postId ID của bài viết.
     * @return Optional chứa ReactionDTO nếu tồn tại, không thì Optional.empty().
     */
    public Optional<ReactionDTO> getUserReaction(Long userId, Long postId) {
        logger.info("Lấy reaction của user ID: {} cho post ID: {}", userId, postId);
        return reactionRepository.findByUserUserIdAndPostId(userId, postId)
                .map(ReactionMapper::toDto);
    }

    /**
     * Thiết lập reaction của người dùng cho bài viết, tạo mới hoặc cập nhật nếu đã tồn tại.
     * @param userId ID của người dùng.
     * @param postId ID của bài viết.
     * @param type Loại reaction.
     * @return ReactionDTO chứa thông tin reaction.
     * @throws IllegalArgumentException nếu người dùng hoặc bài viết không tồn tại.
     */
    @Transactional
    public ReactionDTO setUserReaction(Long userId, Long postId, Reaction.ReactionType type) {
        logger.info("Thiết lập reaction {} cho user ID: {} và post ID: {}", type, userId, postId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        BlogPost post = blogPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Bài viết không tồn tại"));
        Optional<Reaction> existing = reactionRepository.findByUserUserIdAndPostId(userId, postId);
        Reaction reaction;
        if (existing.isPresent()) {
            reaction = existing.get();
            reaction.setType(type);
        } else {
            reaction = new Reaction();
            reaction.setUser(user);
            reaction.setPost(post);
            reaction.setType(type);
        }
        reaction = reactionRepository.save(reaction);
        return ReactionMapper.toDto(reaction);
    }

    /**
     * Xóa reaction của người dùng cho bài viết.
     * @param userId ID của người dùng.
     * @param postId ID của bài viết.
     * @throws IllegalArgumentException nếu reaction không tồn tại.
     */
    @Transactional
    public void removeUserReaction(Long userId, Long postId) {
        logger.info("Xóa reaction của user ID: {} cho post ID: {}", userId, postId);
        Reaction reaction = reactionRepository.findByUserUserIdAndPostId(userId, postId)
                .orElseThrow(() -> new IllegalArgumentException("Reaction không tồn tại"));
        reactionRepository.delete(reaction);
    }
}