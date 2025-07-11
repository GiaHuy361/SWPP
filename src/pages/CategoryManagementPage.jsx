import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import BlogService from "../services/BlogService";
import { useAuth } from "../context/AuthContext";

const CategoryManagementPage = () => {
  const { user } = useAuth();
  const canManageCategories = user?.permissions?.includes('MANAGE_CATEGORIES');
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", slug: "", parentId: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!canManageCategories) {
      setError("Bạn không có quyền quản lý danh mục.");
      setLoading(false);
      return;
    }
    const fetchCategories = async () => {
      try {
        const data = await BlogService.getCategories();
        setCategories(data);
      } catch (err) {
        setError("Không thể tải danh sách danh mục.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [canManageCategories]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name) {
      setError("Tên danh mục là bắt buộc.");
      return;
    }
    try {
      const createdCategory = await BlogService.createCategory(newCategory);
      setCategories([...categories, createdCategory]);
      setNewCategory({ name: "", slug: "", parentId: "" });
    } catch (err) {
      setError("Lỗi khi tạo danh mục.");
    }
  };

  if (loading) return <p className="text-center py-20">Đang tải...</p>;
  if (error) return <p className="text-center py-20 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Danh mục</h1>
        </div>
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Tạo Danh mục Mới</h3>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="block text-gray-700">Tên danh mục</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Slug</label>
              <input
                type="text"
                value={newCategory.slug}
                onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700">Danh mục cha</label>
              <select
                value={newCategory.parentId}
                onChange={(e) => setNewCategory({ ...newCategory, parentId: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="">Không có danh mục cha</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Tạo danh mục
            </button>
          </form>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
              <p className="text-gray-600 mb-2">Slug: {category.slug}</p>
              <p className="text-sm text-gray-500 mb-2">Danh mục cha: {category.parentId ? categories.find(c => c.id === category.parentId)?.name || 'Không xác định' : 'Không có'}</p>
              <p className="text-sm text-gray-500 mb-2">Ngày tạo: {new Date(category.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryManagementPage;