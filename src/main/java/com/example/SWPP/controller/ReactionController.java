package com.example.SWPP.controller;

import com.example.SWPP.dto.ReactionDTO;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.UserRepository;
import com.example.SWPP.service.ReactionService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Optional;

/**
 * Controller cho Reaction, cung cấp các API RESTful để quản lý reaction của người dùng cho bài viết.
 * Bao gồm lấy reaction của người dùng, thiết lập reaction, và xóa reaction.
 * Yêu cầu quyền REACT_POSTS cho tất cả các hành động.
 */
@RestController
@RequestMapping("/api/posts/{postId}/reactions")
public class ReactionController {

    private static final Logger logger = LoggerFactory.getLogger(ReactionController.class);

    private final ReactionService reactionService;
    private final UserRepository userRepository;

    public ReactionController(ReactionService reactionService, UserRepository userRepository) {
        this.reactionService = reactionService;
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('REACT_POSTS')")
    public ResponseEntity<ReactionDTO> getUserReaction(
            @PathVariable Long postId,
            Authentication authentication) {

        Long userId = getUserId(authentication);

        Optional<ReactionDTO> reaction = reactionService.getUserReaction(userId, postId);
        return reaction.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('REACT_POSTS')")
    public ResponseEntity<ReactionDTO> setUserReaction(
            @PathVariable Long postId,
            @Valid @RequestBody ReactionDTO dto,
            Authentication authentication) {

        Long userId = getUserId(authentication);

        ReactionDTO reaction = reactionService.setUserReaction(userId, postId, dto.getType());
        return ResponseEntity.status(HttpStatus.CREATED).body(reaction);
    }

    @DeleteMapping
    @PreAuthorize("hasAuthority('REACT_POSTS')")
    public ResponseEntity<Void> removeUserReaction(
            @PathVariable Long postId,
            Authentication authentication) {

        Long userId = getUserId(authentication);

        reactionService.removeUserReaction(userId, postId);
        return ResponseEntity.noContent().build();
    }

    private Long getUserId(Authentication authentication) {
        String principal = authentication.getName();

        logger.info("===> Principal: {}", principal);
        logger.info("===> Authorities: {}", authentication.getAuthorities());

        User user = userRepository.findByUsername(principal)
                .or(() -> userRepository.findByEmail(principal))
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy user: " + principal));

        return user.getUserId();
    }
}
