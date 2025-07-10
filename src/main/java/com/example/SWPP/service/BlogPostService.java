package com.example.SWPP.service;

import com.example.SWPP.dto.BlogPostDTO;
import com.example.SWPP.entity.BlogPost;
import com.example.SWPP.entity.Category;
import com.example.SWPP.entity.User;
import com.example.SWPP.mapper.BlogPostMapper;
import com.example.SWPP.repository.BlogPostRepository;
import com.example.SWPP.repository.CategoryRepository;
import com.example.SWPP.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class BlogPostService {

    private static final Logger logger = LoggerFactory.getLogger(BlogPostService.class);

    private final BlogPostRepository blogPostRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public BlogPostService(BlogPostRepository blogPostRepository, CategoryRepository categoryRepository, UserRepository userRepository) {
        this.blogPostRepository = blogPostRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    /**
     * Lấy danh sách bài viết đã xuất bản, phân trang.
     * @param pageable Đối tượng phân trang.
     * @return Page chứa danh sách BlogPostDTO.
     */
    public Page<BlogPostDTO> getPublishedPosts(Pageable pageable) {
        logger.info("Lấy danh sách bài viết đã xuất bản, page: {}", pageable.getPageNumber());
        Page<BlogPost> posts = blogPostRepository.findPublishedPosts(LocalDateTime.now(), pageable);
        return posts.map(BlogPostMapper::toDto);
    }

    /**
     * Lấy tất cả bài viết (bao gồm bản nháp và đã xuất bản), phân trang.
     * @param pageable Đối tượng phân trang.
     * @return Page chứa danh sách BlogPostDTO.
     */
    public Page<BlogPostDTO> getAllPosts(Pageable pageable) {
        logger.info("Lấy tất cả bài viết, page: {}", pageable.getPageNumber());
        Page<BlogPost> posts = blogPostRepository.findAll(pageable);
        return posts.map(BlogPostMapper::toDto);
    }

    /**
     * Lấy chi tiết bài viết theo slug.
     * @param slug Slug của bài viết.
     * @return BlogPostDTO của bài viết.
     */
    public BlogPostDTO getPostBySlug(String slug) {
        logger.info("Lấy bài viết với slug: {}", slug);
        BlogPost post = blogPostRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài viết: " + slug));
        return BlogPostMapper.toDto(post);
    }

    /**
     * Lấy chi tiết bài viết theo ID.
     * @param id ID của bài viết.
     * @return BlogPostDTO của bài viết.
     */
    public BlogPostDTO getPostById(Long id) {
        logger.info("Lấy bài viết với ID: {}", id);
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài viết với ID: " + id));
        return BlogPostMapper.toDto(post);
    }

    /**
     * Tạo bài viết mới.
     * @param dto BlogPostDTO chứa thông tin bài viết.
     * @param userId ID của người dùng tạo bài viết.
     * @return BlogPostDTO của bài viết đã tạo.
     */
    @Transactional
    public BlogPostDTO createPost(BlogPostDTO dto, Long userId) {
        logger.info("Tạo bài viết với tiêu đề: {}, userId: {}", dto.getTitle(), userId);

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại với ID: " + userId));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Danh mục không tồn tại với ID: " + dto.getCategoryId()));

        BlogPost post = BlogPostMapper.toEntity(dto, author, category);
        post.setSlug(generateUniqueSlug(dto.getTitle()));
        post.setAuthorName(dto.getAuthorName() != null ? dto.getAuthorName() : author.getFullName());

        post = blogPostRepository.save(post);

        logger.info("Đã tạo bài viết ID: {}", post.getId());
        return BlogPostMapper.toDto(post);
    }

    /**
     * Cập nhật bài viết.
     * @param id ID của bài viết.
     * @param dto BlogPostDTO chứa thông tin cập nhật.
     * @param principal Username hoặc email của người dùng.
     * @return BlogPostDTO của bài viết đã cập nhật.
     */
    @Transactional
    public BlogPostDTO updatePost(Long id, BlogPostDTO dto, String principal) {
        logger.info("Cập nhật bài viết ID: {}", id);

        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài viết với ID: " + id));

        User user = userRepository.findByUsername(principal)
                .or(() -> userRepository.findByEmail(principal))
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));

        post.setTitle(dto.getTitle());
        post.setExcerpt(dto.getExcerpt());
        post.setContent(dto.getContent());
        post.setImageUrl(dto.getImageUrl());
        post.setUpdatedAt(LocalDateTime.now());
        post.setAuthorName(dto.getAuthorName() != null ? dto.getAuthorName() : user.getFullName());

        if (dto.getPublishedAt() != null) {
            post.setPublishedAt(dto.getPublishedAt());
        } else if (post.getPublishedAt() == null) {
            post.setPublishedAt(LocalDateTime.now());
        }

        if (!post.getCategory().getId().equals(dto.getCategoryId())) {
            Category cat = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Danh mục không tồn tại"));
            post.setCategory(cat);
        }

        if (dto.getSlug() != null && !dto.getSlug().isBlank()) {
            String newSlug = generateUniqueSlug(dto.getSlug());
            post.setSlug(newSlug);
        }

        BlogPost updated = blogPostRepository.save(post);
        logger.info("Đã cập nhật bài viết ID: {}", id);
        return BlogPostMapper.toDto(updated);
    }

    /**
     * Xóa bài viết.
     * @param id ID của bài viết.
     * @param principal Username hoặc email của người dùng.
     */
    @Transactional
    public void deletePost(Long id, String principal) {
        logger.info("Xóa bài viết ID: {}", id);

        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài viết"));

        User user = userRepository.findByUsername(principal)
                .or(() -> userRepository.findByEmail(principal))
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));

        blogPostRepository.delete(post);
        logger.info("Đã xóa bài viết ID: {}", id);
    }

    /**
     * Xuất bản bài viết.
     * @param postId ID của bài viết.
     * @param principal Username hoặc email của người dùng.
     * @return BlogPostDTO của bài viết đã xuất bản.
     */
    @Transactional
    public BlogPostDTO publishPost(Long postId, String principal) {
        logger.info("Xuất bản bài viết ID: {}", postId);

        BlogPost post = blogPostRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bài viết"));

        User user = userRepository.findByUsername(principal)
                .or(() -> userRepository.findByEmail(principal))
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));

        if (post.getPublishedAt() == null) {
            post.setPublishedAt(LocalDateTime.now());
            post.setUpdatedAt(LocalDateTime.now());
            logger.info("Bài viết ID {} đã được publish bởi {}", postId, principal);
        }

        BlogPost updated = blogPostRepository.save(post);
        return BlogPostMapper.toDto(updated);
    }

    /**
     * Tạo slug duy nhất từ tiêu đề hoặc slug tùy chỉnh.
     * @param title Tiêu đề hoặc slug gốc.
     * @return Slug duy nhất.
     */
    private String generateUniqueSlug(String title) {
        String baseSlug = title.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("-+$", "");
        String slug = baseSlug;
        int count = 1;
        while (blogPostRepository.findBySlug(slug).isPresent()) {
            slug = baseSlug + "-" + count++;
        }
        return slug;
    }
}