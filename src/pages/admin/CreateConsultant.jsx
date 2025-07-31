import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createConsultant } from '../../services/AppointmentService';
import apiClient from '../../utils/axios';

function CreateConsultant() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: '',
    qualification: '',
    experienceYears: '',
    isActive: true,
    fullName: '',
    email: '',
    phone: ''
  });
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiClient.get('/auth/users');
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        }
      } catch (err) {
        toast.error('Không thể tải danh sách người dùng');
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleUserSelect = (e) => {
    const selectedUser = users.find(u => u.userId === parseInt(e.target.value));
    if (selectedUser) {
      setFormData({
        ...formData,
        userId: selectedUser.userId,
        fullName: selectedUser.fullName || '',
        email: selectedUser.email || '',
        phone: selectedUser.phone || ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createConsultant(formData);
      toast.success('Tạo tư vấn viên thành công');
      navigate('/admin/consultant-management', { state: { refresh: true } });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Tạo tư vấn viên thất bại';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="pt-24 pb-12 px-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-extrabold text-blue-800 mb-6">Tạo tư vấn viên mới</h1>
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        {loadingUsers ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Chọn người dùng</label>
              <select
                name="userId"
                value={formData.userId}
                onChange={handleUserSelect}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Chọn người dùng</option>
                {users.map(u => (
                  <option key={u.userId} value={u.userId}>{u.fullName} ({u.email})</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Họ tên</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled // Làm readonly vì lấy từ user
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Số điện thoại</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Trình độ</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Số năm kinh nghiệm</label>
              <input
                type="number"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="mr-2"
                />
                Hoạt động
              </label>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Tạo tư vấn viên
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default CreateConsultant;