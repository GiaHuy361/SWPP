import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import BlogService from "../services/BlogService";
import { useAuth } from "../context/AuthContext";

const BlogFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const canManageBlogs = isAuthenticated && user?.permissions?.includes('MANAGE_BLOGS');
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    categoryId: "",
    slug: "",
    imageUrl: "",
    publishedAt: "",
    authorName: user?.fullName || "", // Mặc định là fullName của user
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!canManageBlogs) {
      setError("Bạn không có quyền quản lý bài viết.");
      setLoading(false);
      return;
    }

    const fetchCategories = async () => {
      try {
        const data = await BlogService.getCategories();
        setCategories(data);
      } catch (err) {
        setError("Không thể tải danh mục.");
      }
    };

    const fetchPost = async () => {
      if (id) {
        try {
          const post = await BlogService.getPostById(id);
          setFormData({
            title: post.title || "",
            excerpt: post.excerpt || "",
            content: post.content || "",
            categoryId: post.categoryId || "",
            slug: post.slug || "",
            imageUrl: post.imageUrl || "",
            publishedAt: post.publishedAt || "",
            authorName: post.authorName || "", // Lấy authorName từ API
          });
        } catch (err) {
          setError("Không thể tải bài viết.");
        }
      }
      setLoading(false);
    };

    fetchCategories();
    fetchPost();
  }, [id, canManageBlogs, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.excerpt || !formData.content || !formData.categoryId) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }
    try {
      if (id) {
        await BlogService.updatePost(id, formData);
      } else {
        await BlogService.createPost(formData);
      }
      navigate("/blog/manage");
    } catch (err) {
      setError("Lỗi khi lưu bài viết.");
    }
  };

  if (!canManageBlogs) return <p className="text-center py-20 text-red-600">Bạn không có quyền truy cập trang này. <Link to="/login" className="text-blue-600 hover:underline">Đăng nhập</Link> với tài khoản phù hợp.</p>;
  if (loading) return <p className="text-center py-20">Đang tải...</p>;
  if (error) return <p className="text-center py-20 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/blog/manage" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Quay lại
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{id ? "Sửa Bài Viết" : "Tạo Bài Viết Mới"}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Tiêu đề</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Tóm tắt</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Nội dung</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full p-2 border rounded h-40"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Hình ảnh (URL)</label>
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Danh mục</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Tác giả</label>
            <input
              type="text"
              value={formData.authorName}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Nhập tên tác giả"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {id ? "Cập nhật" : "Tạo mới"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BlogFormPage;