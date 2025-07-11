import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BlogService from "../services/BlogService";
import { useAuth } from "../context/AuthContext";

const BlogPage = () => {
  const { user, isAuthenticated } = useAuth();
  const canBookmarkPosts = isAuthenticated && user?.permissions?.includes('BOOKMARK_POSTS');
  const canReactPosts = isAuthenticated && user?.permissions?.includes('REACT_POSTS');
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const data = await BlogService.getPublishedPosts(page);
        const postsWithReactionsAndViews = await Promise.all(
          data.content.map(async (post) => {
            let reaction = null;
            let counts = { LIKE: 0, LOVE: 0, APPLAUSE: 0 };
            let viewCount = 0;
            if (isAuthenticated && canReactPosts) {
              const reactionData = await BlogService.getUserReaction(post.id);
              reaction = reactionData?.type || null;
            }
            counts = await BlogService.getReactionCounts(post.id);
            viewCount = await BlogService.getViewCount(post.id); // Lấy số lượt xem
            return { ...post, reaction, reactionCounts: counts || { LIKE: 0, LOVE: 0, APPLAUSE: 0 }, viewCount };
          })
        );
        setBlogPosts(postsWithReactionsAndViews);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError("Không thể tải danh sách bài viết. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogPosts();
  }, [page, isAuthenticated, canReactPosts]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const handleBookmark = async (postId) => {
    if (!isAuthenticated) {
      setError("Vui lòng đăng nhập để thêm bookmark.");
      navigate("/login");
      return;
    }
    if (!canBookmarkPosts) {
      setError("Bạn không có quyền thêm bookmark.");
      return;
    }
    try {
      await BlogService.addBookmark(postId);
      setBlogPosts(blogPosts.map(post => 
        post.id === postId ? { ...post, isBookmarked: true } : post
      ));
    } catch (err) {
      setError("Lỗi khi thêm bookmark.");
    }
  };

  const handleRemoveBookmark = async (postId) => {
    if (!isAuthenticated) {
      setError("Vui lòng đăng nhập để xóa bookmark.");
      navigate("/login");
      return;
    }
    if (!canBookmarkPosts) {
      setError("Bạn không có quyền xóa bookmark.");
      return;
    }
    try {
      await BlogService.removeBookmark(postId);
      setBlogPosts(blogPosts.map(post => 
        post.id === postId ? { ...post, isBookmarked: false } : post
      ));
    } catch (err) {
      setError("Lỗi khi xóa bookmark.");
    }
  };

  const handleReaction = async (postId, type) => {
    if (!isAuthenticated) {
      setError("Vui lòng đăng nhập để thêm reaction.");
      navigate("/login");
      return;
    }
    if (!canReactPosts) {
      setError("Bạn không có quyền thêm reaction.");
      return;
    }
    try {
      await BlogService.addReaction(postId, type);
      const counts = await BlogService.getReactionCounts(postId);
      setBlogPosts(blogPosts.map(post => 
        post.id === postId ? { ...post, reaction: type, reactionCounts: counts || { LIKE: 0, LOVE: 0, APPLAUSE: 0 } } : post
      ));
    } catch (err) {
      setError("Lỗi khi thêm reaction.");
    }
  };

  const handleRemoveReaction = async (postId) => {
    if (!isAuthenticated) {
      setError("Vui lòng đăng nhập để xóa reaction.");
      navigate("/login");
      return;
    }
    if (!canReactPosts) {
      setError("Bạn không có quyền xóa reaction.");
      return;
    }
    try {
      await BlogService.removeReaction(postId);
      const counts = await BlogService.getReactionCounts(postId);
      setBlogPosts(blogPosts.map(post => 
        post.id === postId ? { ...post, reaction: null, reactionCounts: counts || { LIKE: 0, LOVE: 0, APPLAUSE: 0 } } : post
      ));
    } catch (err) {
      setError("Lỗi khi xóa reaction.");
    }
  };

  return (
    <div className="min-h-screen py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blog Của Chúng Tôi
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Khám phá các bài viết và thông tin hữu ích nhất
          </p>
        </motion.div>

        {loading && <p className="text-center">Đang tải...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && !error && (
          <>
            {blogPosts.length === 0 && <p className="text-center text-gray-500">Chưa có bài viết nào.</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {blogPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="p-6">
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover mb-4" />
                    )}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      <Link to={`/blog/${post.slug}`} className="hover:text-blue-600">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 mb-2">{post.excerpt}</p>
                    <p className="text-sm text-gray-500 mb-2">Tác giả: {post.authorName || 'Không xác định'}</p>
                    <p className="text-sm text-gray-500 mb-2">Danh mục: {post.categoryName || 'Chưa phân loại'}</p>
                    <p className="text-sm text-gray-500 mb-2">Ngày đăng: {new Date(post.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500 mb-2">
                      Thích: {post.reactionCounts.LIKE} | Yêu: {post.reactionCounts.LOVE} | Vỗ tay: {post.reactionCounts.APPLAUSE}
                    </p>
                    <div className="flex space-x-4 mb-4">
                      {canBookmarkPosts && (
                        <button
                          onClick={() => post.isBookmarked ? handleRemoveBookmark(post.id) : handleBookmark(post.id)}
                          className={`text-blue-600 hover:text-blue-800 ${post.isBookmarked ? 'font-bold' : ''}`}
                        >
                          {post.isBookmarked ? "Bỏ bookmark" : "Bookmark"}
                        </button>
                      )}
                      {canReactPosts && (
                        <>
                          <button
                            onClick={() => post.reaction === 'LIKE' ? handleRemoveReaction(post.id) : handleReaction(post.id, "LIKE")}
                            className={`text-green-600 hover:text-green-800 ${post.reaction === 'LIKE' ? 'font-bold bg-green-100 rounded px-2' : ''}`}
                          >
                            {post.reaction === 'LIKE' ? 'Đã thích' : 'Thích'}
                          </button>
                          <button
                            onClick={() => post.reaction === 'LOVE' ? handleRemoveReaction(post.id) : handleReaction(post.id, "LOVE")}
                            className={`text-red-600 hover:text-red-800 ${post.reaction === 'LOVE' ? 'font-bold bg-red-100 rounded px-2' : ''}`}
                          >
                            {post.reaction === 'LOVE' ? 'Đã yêu' : 'Yêu'}
                          </button>
                          <button
                            onClick={() => post.reaction === 'APPLAUSE' ? handleRemoveReaction(post.id) : handleReaction(post.id, "APPLAUSE")}
                            className={`text-yellow-600 hover:text-yellow-800 ${post.reaction === 'APPLAUSE' ? 'font-bold bg-yellow-100 rounded px-2' : ''}`}
                          >
                            {post.reaction === 'APPLAUSE' ? 'Đã vỗ tay' : 'Vỗ tay'}
                          </button>
                        </>
                      )}
                      <span className="text-gray-500">Lượt xem: {post.viewCount || 0}</span> {/* Cập nhật hiển thị số lượt xem */}
                    </div>
                    <Link to={`/blog/${post.slug}`} className="text-blue-600 hover:underline">
                      Đọc thêm
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-l-lg disabled:opacity-50 hover:bg-gray-400"
              >
                Trước
              </button>
              <span className="px-4 py-2 bg-gray-200">{page + 1} / {totalPages}</span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page + 1 >= totalPages}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-r-lg disabled:opacity-50 hover:bg-gray-400"
              >
                Sau
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BlogPage;