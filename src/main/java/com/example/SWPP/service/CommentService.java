package com.example.SWPP.service;

import com.example.SWPP.dto.CommentDTO;
import com.example.SWPP.entity.BlogPost;
import com.example.SWPP.entity.Comment;
import com.example.SWPP.entity.User;
import com.example.SWPP.mapper.CommentMapper;
import com.example.SWPP.repository.BlogPostRepository;
import com.example.SWPP.repository.CommentRepository;
import com.example.SWPP.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private static final Logger logger = LoggerFactory.getLogger(CommentService.class);

    private final CommentRepository commentRepository;
    private final BlogPostRepository blogPostRepository;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository, BlogPostRepository blogPostRepository, UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.blogPostRepository = blogPostRepository;
        this.userRepository = userRepository;
    }

    public List<CommentDTO> getCommentsByPost(Long postId) {
        logger.info("Lấy bình luận cho bài viết ID: {}", postId);
        List<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
        return comments.stream().map(CommentMapper::toDto).collect(Collectors.toList());
    }

    @Transactional
    public CommentDTO createComment(Long postId, CommentDTO dto, Long userId) {
        logger.info("Tạo bình luận cho bài viết ID: {}, user ID: {}", postId, userId);

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));

        BlogPost post = blogPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Bài viết không tồn tại"));

        Comment parent = null;
        if (dto.getParentId() != null) {
            parent = commentRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Bình luận cha không tồn tại"));
            if (!parent.getPost().getId().equals(postId)) {
                throw new IllegalArgumentException("Bình luận cha không thuộc bài viết này");
            }
        }

        Comment comment = CommentMapper.toEntity(dto, author, post, parent);
        comment = commentRepository.save(comment);

        logger.info("Đã tạo bình luận ID: {}", comment.getId());

        return CommentMapper.toDto(comment);
    }
}
