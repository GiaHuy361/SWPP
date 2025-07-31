import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import { FiEdit, FiTrash2 } from 'react-icons/fi'; // Loại bỏ các icon không cần thiết
import { toast } from 'react-toastify';
import { updateConsultant, getConsultantById } from '../../services/AppointmentService';

function EditConsultant() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [formData, setFormData] = useState({
    qualification: '',
    experienceYears: '',
    isActive: true,
    fullName: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultant = async () => {
      try {
        const response = await getConsultantById(id);
        const consultant = response.data;
        setFormData({
          qualification: consultant.qualification || '',
          experienceYears: consultant.experienceYears || '',
          isActive: consultant.isActive || true,
          fullName: consultant.fullName || '',
          email: consultant.email || '',
          phone: consultant.phone || ''
        });
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Lấy thông tin tư vấn viên thất bại';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchConsultant();
  }, [id]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateConsultant(id, formData);
      toast.success('Cập nhật tư vấn viên thành công');
      navigate('/admin/consultant-management', { state: { refresh: true } });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Cập nhật tư vấn viên thất bại';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-12 px-4">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-extrabold text-blue-800 mb-6">Chỉnh sửa tư vấn viên</h1>
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Họ tên</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
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
              required
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
            Cập nhật tư vấn viên
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditConsultant;