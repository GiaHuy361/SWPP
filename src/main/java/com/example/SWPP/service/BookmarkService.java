package com.example.SWPP.service;

import com.example.SWPP.dto.BookmarkDTO;
import com.example.SWPP.entity.BlogPost;
import com.example.SWPP.entity.Bookmark;
import com.example.SWPP.entity.User;
import com.example.SWPP.mapper.BookmarkMapper;
import com.example.SWPP.repository.BlogPostRepository;
import com.example.SWPP.repository.BookmarkRepository;
import com.example.SWPP.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service cho Bookmark, xử lý logic nghiệp vụ liên quan đến bookmark.
 * Bao gồm kiểm tra, tạo, và xóa bookmark.
 */
@Service
public class BookmarkService {
    private static final Logger logger = LoggerFactory.getLogger(BookmarkService.class);
    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final BlogPostRepository blogPostRepository;

    public BookmarkService(BookmarkRepository bookmarkRepository, UserRepository userRepository, BlogPostRepository blogPostRepository) {
        this.bookmarkRepository = bookmarkRepository;
        this.userRepository = userRepository;
        this.blogPostRepository = blogPostRepository;
    }

    /**
     * Kiểm tra xem người dùng đã bookmark bài viết chưa.
     * @param userId ID của người dùng.
     * @param postId ID của bài viết.
     * @return true nếu đã bookmark, false nếu chưa.
     */
    public boolean isBookmarked(Long userId, Long postId) {
        logger.info("Kiểm tra bookmark cho user ID: {}, post ID: {}", userId, postId);
        return bookmarkRepository.findByUserUserIdAndPostId(userId, postId).isPresent();
    }

    /**
     * Tạo bookmark mới, yêu cầu quyền BOOKMARK_POSTS.
     * @param userId ID của người dùng.
     * @param postId ID của bài viết.
     * @return BookmarkDTO chứa thông tin bookmark vừa tạo.
     * @throws IllegalArgumentException nếu người dùng hoặc bài viết không tồn tại.
     */
    @Transactional
    public BookmarkDTO createBookmark(Long userId, Long postId) {
        logger.info("Tạo bookmark cho user ID: {}, post ID: {}", userId, postId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        BlogPost post = blogPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Bài viết không tồn tại"));
        if (bookmarkRepository.findByUserUserIdAndPostId(userId, postId).isPresent()) {
            throw new IllegalStateException("Bài viết đã được bookmark");
        }
        Bookmark bookmark = new Bookmark();
        bookmark.setUser(user);
        bookmark.setPost(post);
        bookmark = bookmarkRepository.save(bookmark);
        return BookmarkMapper.toDto(bookmark);
    }

    /**
     * Xóa bookmark, yêu cầu quyền BOOKMARK_POSTS.
     * @param userId ID của người dùng.
     * @param postId ID của bài viết.
     * @throws IllegalArgumentException nếu bookmark không tồn tại.
     */
    @Transactional
    public void deleteBookmark(Long userId, Long postId) {
        logger.info("Xóa bookmark cho user ID: {}, post ID: {}", userId, postId);
        Bookmark bookmark = bookmarkRepository.findByUserUserIdAndPostId(userId, postId)
                .orElseThrow(() -> new IllegalArgumentException("Bookmark không tồn tại"));
        bookmarkRepository.delete(bookmark);
    }
}