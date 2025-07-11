import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import BlogService from "../services/BlogService";
import { useAuth } from "../context/AuthContext";

const BlogDetailPage = () => {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const canCreateComments = isAuthenticated && user?.permissions?.includes('CREATE_COMMENTS');
  const canBookmarkPosts = isAuthenticated && user?.permissions?.includes('BOOKMARK_POSTS');
  const canReactPosts = isAuthenticated && user?.permissions?.includes('REACT_POSTS');
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyCommentId, setReplyCommentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userReaction, setUserReaction] = useState(null);
  const [reactionCounts, setReactionCounts] = useState({ LIKE: 0, LOVE: 0, APPLAUSE: 0 });
  const [viewCount, setViewCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const postData = await BlogService.getPostBySlug(slug);
        setPost(postData);
        // Lấy số lượt xem (công khai)
        const viewCountData = await BlogService.getViewCount(postData.id);
        setViewCount(viewCountData);
        const commentsData = await BlogService.getCommentsByPost(postData.id);
        setComments(commentsData);
        const counts = await BlogService.getReactionCounts(postData.id);
        setReactionCounts(counts || { LIKE: 0, LOVE: 0, APPLAUSE: 0 });
        if (isAuthenticated && canReactPosts) {
          const reactionData = await BlogService.getUserReaction(postData.id);
          setUserReaction(reactionData?.type || null);
        }
      } catch (err) {
        console.error("Lỗi khi tải bài viết hoặc dữ liệu liên quan:", err);
        setError("Không thể tải bài viết hoặc bình luận.");
      } finally {
        setLoading(false);
      }
    };
    console.log("useEffect BlogDetailPage chạy, slug:", slug); // Log để kiểm tra
    fetchPostAndComments();
  }, [slug, isAuthenticated, canReactPosts]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError("Vui lòng đăng nhập để bình luận.");
      navigate("/login");
      return;
    }
    if (!canCreateComments) {
      setError("Bạn không có quyền bình luận.");
      return;
    }
    try {
      const comment = await BlogService.addComment(post.id, newComment, replyCommentId);
      setComments([...comments, comment]);
      setNewComment("");
      setReplyCommentId(null);
    } catch (err) {
      setError("Lỗi khi thêm bình luận.");
    }
  };

  const handleBookmark = async () => {
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
      await BlogService.addBookmark(post.id);
      setPost({ ...post, isBookmarked: true });
    } catch (err) {
      setError("Lỗi khi thêm bookmark.");
    }
  };

  const handleRemoveBookmark = async () => {
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
      await BlogService.removeBookmark(post.id);
      setPost({ ...post, isBookmarked: false });
    } catch (err) {
      setError("Lỗi khi xóa bookmark.");
    }
  };

  const handleReaction = async (type) => {
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
      await BlogService.addReaction(post.id, type);
      setUserReaction(type);
      const counts = await BlogService.getReactionCounts(post.id);
      setReactionCounts(counts || { LIKE: 0, LOVE: 0, APPLAUSE: 0 });
    } catch (err) {
      setError("Lỗi khi thêm reaction.");
    }
  };

  const handleRemoveReaction = async () => {
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
      await BlogService.removeReaction(post.id);
      setUserReaction(null);
      const counts = await BlogService.getReactionCounts(post.id);
      setReactionCounts(counts || { LIKE: 0, LOVE: 0, APPLAUSE: 0 });
    } catch (err) {
      setError("Lỗi khi xóa reaction.");
    }
  };

  const renderComments = (comments, parentId = null, level = 0) => {
    return comments
      .filter(comment => comment.parentId === parentId)
      .map(comment => (
        <div key={comment.id} className={`bg-white p-4 rounded-lg shadow mb-4 ${level > 0 ? 'ml-8' : ''}`}>
          <p className="text-gray-700">{comment.content}</p>
          <p className="text-sm text-gray-500">Bởi: {comment.authorName} - {new Date(comment.createdAt).toLocaleDateString()}</p>
          {canCreateComments && (
            <button
              onClick={() => setReplyCommentId(comment.id)}
              className="text-blue-600 hover:underline text-sm"
            >
              Trả lời
            </button>
          )}
          {renderComments(comments, comment.id, level + 1)}
        </div>
      ));
  };

  if (loading) return <p className="text-center py-20">Đang tải...</p>;
  if (error) return <p className="text-center py-20 text-red-600">{error}</p>;
  if (!post) return <p className="text-center py-20">Bài viết không tồn tại.</p>;

  return (
    <div className="min-h-screen py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/blog" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Quay lại danh sách
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
        {post.imageUrl && (
          <img src={post.imageUrl} alt={post.title} className="w-full h-64 object-cover mb-4" />
        )}
        <p className="text-sm text-gray-500 mb-2">Tác giả: {post.authorName || 'Không xác định'}</p>
        <p className="text-sm text-gray-500 mb-2">Danh mục: {post.categoryName || 'Chưa phân loại'}</p>
        <p className="text-sm text-gray-500 mb-4">Ngày đăng: {new Date(post.createdAt).toLocaleDateString()}</p>
        <div className="prose max-w-none text-gray-700 mb-6" dangerouslySetInnerHTML={{ __html: post.content }} />
        <div className="mb-6">
          <p className="text-gray-500">Lượt xem: {viewCount}</p>
          <p className="text-gray-500">
            Thích: {reactionCounts.LIKE} | Yêu: {reactionCounts.LOVE} | Vỗ tay: {reactionCounts.APPLAUSE}
          </p>
        </div>
        <div className="flex space-x-4 mb-6">
          {canBookmarkPosts && (
            <button
              onClick={() => post.isBookmarked ? handleRemoveBookmark() : handleBookmark()}
              className={`text-blue-600 hover:text-blue-800 ${post.isBookmarked ? 'font-bold' : ''}`}
            >
              {post.isBookmarked ? "Bỏ bookmark" : "Bookmark"}
            </button>
          )}
          {canReactPosts && (
            <>
              <button
                onClick={() => userReaction === 'LIKE' ? handleRemoveReaction() : handleReaction("LIKE")}
                className={`text-green-600 hover:text-green-800 ${userReaction === 'LIKE' ? 'font-bold bg-green-100 rounded px-2' : ''}`}
              >
                {userReaction === 'LIKE' ? 'Đã thích' : 'Thích'}
              </button>
              <button
                onClick={() => userReaction === 'LOVE' ? handleRemoveReaction() : handleReaction("LOVE")}
                className={`text-red-600 hover:text-red-800 ${userReaction === 'LOVE' ? 'font-bold bg-red-100 rounded px-2' : ''}`}
              >
                {userReaction === 'LOVE' ? 'Đã yêu' : 'Yêu'}
              </button>
              <button
                onClick={() => userReaction === 'APPLAUSE' ? handleRemoveReaction() : handleReaction("APPLAUSE")}
                className={`text-yellow-600 hover:text-yellow-800 ${userReaction === 'APPLAUSE' ? 'font-bold bg-yellow-100 rounded px-2' : ''}`}
              >
                {userReaction === 'APPLAUSE' ? 'Đã vỗ tay' : 'Vỗ tay'}
              </button>
            </>
          )}
        </div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Bình luận</h3>
          {renderComments(comments)}
          {canCreateComments ? (
            <form onSubmit={handleAddComment} className="mt-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                placeholder={replyCommentId ? "Viết trả lời..." : "Viết bình luận của bạn..."}
                required
              />
              {replyCommentId && (
                <button
                  onClick={() => setReplyCommentId(null)}
                  className="text-red-600 hover:underline text-sm mb-2"
                >
                  Hủy trả lời
                </button>
              )}
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Gửi
              </button>
            </form>
          ) : (
            <p className="text-gray-500">Vui lòng <Link to="/login" className="text-blue-600 hover:underline">đăng nhập</Link> để bình luận.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;