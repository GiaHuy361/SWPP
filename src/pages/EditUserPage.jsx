import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

function EditUserPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    roleId: '' // Sử dụng roleId thay vì role
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/edit-user/${id}` } });
      return;
    }
    if (!user?.permissions?.includes('MANAGE_USERS')) {
      navigate('/access-denied');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const email = location.state?.email; // Lấy email từ state
        if (!email) throw new Error('Không tìm thấy email người dùng.');
        const [userResponse, rolesResponse] = await Promise.all([
          apiClient.get(`/auth/users/${email}`),
          apiClient.get('/admin/roles')
        ]);
        const currentRole = rolesResponse.data.find(r => r.roleName === userResponse.data.role);
        setFormData({
          username: userResponse.data.username || '',
          fullName: userResponse.data.fullName || '',
          email: userResponse.data.email || '',
          phone: userResponse.data.phone || '',
          roleId: currentRole ? currentRole.roleName : '' // Lưu roleName tạm thời
        });
        setRoles(rolesResponse.data || []);
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Không thể tải thông tin người dùng.';
        setServerError(errorMsg);
        console.error('Fetch user error:', err);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isAuthenticated, user, navigate, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập địa chỉ email';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Địa chỉ email không hợp lệ';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Số điện thoại phải có 10-11 số';
      }
    }
    if (!formData.roleId) {
      newErrors.roleId = 'Vui lòng chọn vai trò';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    setServerError('');
    try {
      const updateResponse = await apiClient.put(`/auth/users/${id}`, {
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone
      });
      const selectedRole = roles.find(role => role.roleName === formData.roleId);
      if (selectedRole && selectedRole.roleName !== updateResponse.data.role) {
        await apiClient.post(`/admin/users/${id}/role/${selectedRole.roleId}`);
      }
      toast.success('Cập nhật người dùng thành công.');
      navigate('/user-management', { state: { refresh: true } });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Cập nhật người dùng thất bại.';
      setServerError(errorMsg);
      console.error('Update user error:', error);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Sửa thông tin người dùng</h2>
        {serverError && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {serverError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Tên đăng nhập
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
          </div>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Họ và tên
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Số điện thoại
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>
          <div>
            <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">
              Vai trò
            </label>
            <select
              id="roleId"
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${errors.roleId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            >
              <option value="">Chọn vai trò</option>
              {roles.map((role) => (
                <option key={role.roleId} value={role.roleName}>{role.roleName}</option>
              ))}
            </select>
            {errors.roleId && <p className="mt-1 text-sm text-red-600">{errors.roleId}</p>}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserPage;