import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BlogService from "../services/BlogService";
import { useAuth } from "../context/AuthContext";

const BlogManagementPage = () => {
  const { user, isAuthenticated } = useAuth();
  const canManageBlogs = isAuthenticated && user?.permissions?.includes('MANAGE_BLOGS');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (!canManageBlogs) {
      setError("Bạn không có quyền quản lý bài viết.");
      setLoading(false);
      return;
    }
    const fetchAllPosts = async () => {
      try {
        const data = await BlogService.getAllPosts(page);
        setPosts(data.content || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError("Không thể tải danh sách bài viết.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllPosts();
  }, [page, canManageBlogs]);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa bài viết này?")) {
      try {
        await BlogService.deletePost(id);
        setPosts(posts.filter(post => post.id !== id));
      } catch (err) {
        setError("Lỗi khi xóa bài viết.");
      }
    }
  };

  const handlePublish = async (id) => {
    try {
      await BlogService.publishPost(id);
      setPosts(posts.map(post => post.id === id ? { ...post, publishedAt: new Date() } : post));
    } catch (err) {
      setError("Lỗi khi xuất bản bài viết.");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  if (!canManageBlogs) return (
    <p className="text-center py-20 text-red-600">
      Bạn không có quyền truy cập trang này. <Link to="/login" className="text-blue-600 hover:underline">Đăng nhập</Link> với tài khoản phù hợp.
    </p>
  );
  if (loading) return <p className="text-center py-20">Đang tải...</p>;
  if (error) return <p className="text-center py-20 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Bài Viết</h1>
          <Link to="/blog/create" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Tạo Bài Viết Mới
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {posts.length === 0 && <p className="text-center text-gray-500">Chưa có bài viết nào.</p>}
          {posts.map((post) => (
            <div key={post.id} className="bg-white p-4 rounded-lg shadow">
              {post.imageUrl && (
                <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover mb-4 rounded" />
              )}
              <h3 className="text-xl font-semibold text-gray-900">
                <Link to={`/blog/${post.slug}`} className="hover:text-blue-600">
                  {post.title}
                </Link>
              </h3>
              <p className="text-gray-600 mb-2">{post.excerpt}</p>
              <p className="text-sm text-gray-500 mb-2">Trạng thái: {post.publishedAt ? 'Đã xuất bản' : 'Bản nháp'}</p>
              <p className="text-sm text-gray-500 mb-2">Tác giả: {post.authorName || 'Không xác định'}</p>
              <p className="text-sm text-gray-500 mb-2">Danh mục: {post.categoryName || 'Chưa phân loại'}</p>
              <p className="text-sm text-gray-500 mb-2">Ngày tạo: {new Date(post.createdAt).toLocaleDateString()}</p>
              <div className="flex space-x-4">
                <Link to={`/blog/edit/${post.id}`} className="text-blue-600 hover:underline">
                  Sửa
                </Link>
                <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:underline">
                  Xóa
                </button>
                {!post.publishedAt && (
                  <button onClick={() => handlePublish(post.id)} className="text-green-600 hover:underline">
                    Xuất bản
                  </button>
                )}
              </div>
            </div>
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
      </div>
    </div>
  );
};

export default BlogManagementPage;