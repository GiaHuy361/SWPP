package com.example.SWPP.controller;

import com.example.SWPP.dto.CommentDTO;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.UserRepository;
import com.example.SWPP.service.CommentService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/blogposts/{postId}/comments")
public class CommentController {

    private static final Logger logger = LoggerFactory.getLogger(CommentController.class);
    private final CommentService commentService;
    private final UserRepository userRepository;

    public CommentController(CommentService commentService, UserRepository userRepository) {
        this.commentService = commentService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<CommentDTO>> getCommentsByPost(@PathVariable Long postId) {
        List<CommentDTO> comments = commentService.getCommentsByPost(postId);
        return ResponseEntity.ok(comments);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_COMMENTS')")
    public ResponseEntity<CommentDTO> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentDTO dto,
            Authentication authentication) {

        logger.info("===> Principal: {}", authentication != null ? authentication.getName() : "NULL");
        logger.info("===> Authorities: {}", authentication != null ? authentication.getAuthorities() : "NULL");

        String principal = authentication.getName();

        User user = userRepository.findByUsername(principal)
                .or(() -> userRepository.findByEmail(principal))
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy user: " + principal));

        Long userId = user.getUserId();

        CommentDTO comment = commentService.createComment(postId, dto, userId);

        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }
}