package com.example.SWPP.controller;

import com.example.SWPP.dto.BookmarkDTO;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.UserRepository;
import com.example.SWPP.service.BookmarkService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

/**
 * Controller cho Bookmark: check, tạo, xóa bookmark.
 */
@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    private static final Logger logger = LoggerFactory.getLogger(BookmarkController.class);

    private final BookmarkService bookmarkService;
    private final UserRepository userRepository;

    public BookmarkController(BookmarkService bookmarkService, UserRepository userRepository) {
        this.bookmarkService = bookmarkService;
        this.userRepository = userRepository;
    }

    @GetMapping("/check/{postId}")
    @PreAuthorize("hasAuthority('VIEW_BLOGS')")
    public ResponseEntity<Boolean> isBookmarked(
            @PathVariable Long postId,
            Authentication authentication
    ) {
        Long userId = getUserId(authentication);
        boolean isBookmarked = bookmarkService.isBookmarked(userId, postId);
        return ResponseEntity.ok(isBookmarked);
    }

    @PostMapping("/{postId}")
    @PreAuthorize("hasAuthority('BOOKMARK_POSTS')")
    public ResponseEntity<BookmarkDTO> createBookmark(
            @PathVariable Long postId,
            Authentication authentication
    ) {
        Long userId = getUserId(authentication);
        BookmarkDTO bookmark = bookmarkService.createBookmark(userId, postId);
        return ResponseEntity.status(HttpStatus.CREATED).body(bookmark);
    }

    @DeleteMapping("/{postId}")
    @PreAuthorize("hasAuthority('BOOKMARK_POSTS')")
    public ResponseEntity<Void> deleteBookmark(
            @PathVariable Long postId,
            Authentication authentication
    ) {
        Long userId = getUserId(authentication);
        bookmarkService.deleteBookmark(userId, postId);
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
