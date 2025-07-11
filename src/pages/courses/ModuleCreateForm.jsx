import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';

export default function ModuleCreateForm() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    position: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    
    // Validate position to ensure it's a number and at least 1
    const position = parseInt(formData.position);
    if (isNaN(position) || position < 1) {
      toast.error('Vị trí thứ tự phải là số nguyên lớn hơn hoặc bằng 1');
      return;
    }
    
    // Validate required fields
    if (!formData.title || !formData.title.trim()) {
      toast.error('Tiêu đề không được để trống');
      return;
    }

    setSubmitting(true);

    try {
      // Debug backend DTO format
      console.log('CourseModuleMapper.toEntity() backend function:', {
        expectedFormat: {
          title: 'string', 
          description: 'string', 
          position: 'number'
        },
        comment: 'Backend sẽ tự set course relationship từ URL params'
      });
      
      // Chuẩn bị dữ liệu gửi đi, tương ứng với phương thức toEntity trong CourseModuleMapper
      const moduleData = {
        title: formData.title.trim(),
        description: formData.description ? formData.description.trim() : "",
        position: position
      };
      
      console.log('Dữ liệu gửi đi:', moduleData);
      console.log('Kiểu dữ liệu:', {
        title: typeof moduleData.title,
        description: typeof moduleData.description,
        position: typeof moduleData.position
      });
      console.log(`Gửi POST request đến: /courses/${courseId}/modules`);
      
      const response = await axios.post(`/courses/${courseId}/modules`, moduleData);
      console.log('Response:', response.data);
      toast.success('Tạo module thành công');
      navigate(`/admin/courses/${courseId}`);
    } catch (error) {
      console.error('Lỗi khi tạo module:', error);
      if (error.response) {
        console.log('Error response status:', error.response.status);
        console.log('Error response data:', error.response.data);
        console.log('Error response headers:', error.response.headers);
        if (error.response.data && error.response.data.message) {
          toast.error(`Lỗi: ${error.response.data.message}`);
        } else {
          toast.error('Có lỗi khi tạo module');
        }
      } else if (error.request) {
        console.log('Error request:', error.request);
        toast.error('Không nhận được phản hồi từ máy chủ');
      } else {
        console.log('Error message:', error.message);
        toast.error('Lỗi khi gửi yêu cầu');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tạo Module Mới</h1>
        <button 
          onClick={() => navigate(`/admin/courses/${courseId}`)} 
          className="text-blue-500 hover:underline"
        >
          ← Quay lại
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Tiêu đề *
            </label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Mô tả
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Vị trí thứ tự *
            </label>
            <input
              type="number"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              value={formData.position}
              onChange={(e) => {
                const value = e.target.value;
                const parsed = parseInt(value);
                // Only update if it's a valid number or empty (to allow clearing the field)
                if (value === '' || !isNaN(parsed)) {
                  setFormData({...formData, position: value === '' ? '' : parsed});
                }
              }}
              min="1"
              required
            />
          </div>
          
          <div className="flex items-center justify-end">
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
              onClick={() => navigate(`/admin/courses/${courseId}`)}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={submitting}
            >
              {submitting ? 'Đang tạo...' : 'Tạo module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}