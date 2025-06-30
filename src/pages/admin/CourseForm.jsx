import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';

export default function CourseForm() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(courseId);
  
  // Chỉ giữ các trường BE yêu cầu
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: '',
    recommendedMinScore: 0,
    recommendedMaxScore: 0,
    ageGroup: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && courseId) {
      fetchCourse();
    }
    // eslint-disable-next-line
  }, [isEdit, courseId]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/courses/${courseId}`);
      // Chỉ lấy các trường cần thiết
      setFormData({
        title: res.data.title || '',
        description: res.data.description || '',
        level: res.data.level || '',
        recommendedMinScore: res.data.recommendedMinScore || 0,
        recommendedMaxScore: res.data.recommendedMaxScore || 0,
        ageGroup: res.data.ageGroup || '',
      });
    } catch (err) {
      alert('Không thể tải thông tin khóa học');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.title) errs.title = 'Vui lòng nhập tên khóa học';
    if (!formData.description) errs.description = 'Vui lòng nhập mô tả';
    if (!formData.level) errs.level = 'Vui lòng nhập cấp độ';
    if (!formData.ageGroup) errs.ageGroup = 'Vui lòng nhập nhóm tuổi';
    if (formData.recommendedMaxScore < formData.recommendedMinScore) errs.recommendedMaxScore = 'Điểm tối đa phải lớn hơn hoặc bằng điểm tối thiểu';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitLoading(true);
    try {
      if (isEdit) {
        await axios.put(`/courses/${courseId}`, formData);
        alert('Cập nhật khóa học thành công!');
      } else {
        await axios.post('/courses', formData);
        alert('Tạo khóa học thành công!');
      }
      navigate('/admin/courses');
    } catch (err) {
      alert('Có lỗi khi lưu khóa học');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{isEdit ? 'Chỉnh sửa' : 'Tạo'} khóa học</h2>
      <div className="mb-4">
        <label className="block font-medium mb-1">Tên khóa học *</label>
        <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full border rounded px-3 py-2" />
        {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Mô tả *</label>
        <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full border rounded px-3 py-2" />
        {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Cấp độ *</label>
        <input type="text" name="level" value={formData.level} onChange={handleInputChange} className="w-full border rounded px-3 py-2" />
        {errors.level && <div className="text-red-500 text-sm mt-1">{errors.level}</div>}
      </div>
      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <label className="block font-medium mb-1">Điểm tối thiểu *</label>
          <input type="number" name="recommendedMinScore" value={formData.recommendedMinScore} onChange={handleInputChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="flex-1">
          <label className="block font-medium mb-1">Điểm tối đa *</label>
          <input type="number" name="recommendedMaxScore" value={formData.recommendedMaxScore} onChange={handleInputChange} className="w-full border rounded px-3 py-2" />
          {errors.recommendedMaxScore && <div className="text-red-500 text-sm mt-1">{errors.recommendedMaxScore}</div>}
        </div>
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Nhóm tuổi *</label>
        <input type="text" name="ageGroup" value={formData.ageGroup} onChange={handleInputChange} className="w-full border rounded px-3 py-2" />
        {errors.ageGroup && <div className="text-red-500 text-sm mt-1">{errors.ageGroup}</div>}
      </div>
      <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded" disabled={submitLoading}>
        {submitLoading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
      </button>
    </form>
  );
}
