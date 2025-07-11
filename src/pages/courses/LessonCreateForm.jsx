import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';

export default function LessonCreateForm() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    duration: 30, // Thời lượng mặc định 30 phút
    position: 1,
    lessonType: 'VIDEO'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      console.log('🔍 Đang tạo bài học với dữ liệu:', formData);
      console.log('🔍 Module ID:', moduleId);
      console.log('🔍 Course ID:', courseId);
      
      // Chuẩn hóa dữ liệu theo DTO
      const lessonData = {
        title: formData.title,
        content: formData.content || '',
        duration: parseInt(formData.duration || 30),
        position: parseInt(formData.position || 1),
        lessonType: formData.lessonType || 'VIDEO',
        moduleId: parseInt(moduleId)
      };
      
      console.log('🔍 Dữ liệu bài học cuối cùng:', lessonData);
      
      await axios.post(`/api/modules/${moduleId}/lessons`, lessonData);
      toast.success('Tạo bài học thành công');
      navigate(`/admin/courses/${courseId}/modules/${moduleId}/lessons`);
    } catch (error) {
      console.error('❌ Lỗi khi tạo bài học:', error);
      console.error('❌ Chi tiết lỗi:', error.response?.data);
      toast.error(error.response?.data?.message || 'Có lỗi khi tạo bài học');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tạo Bài Học Mới</h1>
        <button 
          onClick={() => navigate(`/admin/courses/${courseId}/modules/${moduleId}/lessons`)} 
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
              Nội dung *
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required
            ></textarea>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Thời lượng (phút) *
              </label>
              <input
                type="number"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                min="1"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Vị trí thứ tự *
              </label>
              <input
                type="number"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: parseInt(e.target.value) || 0})}
                min="1"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Loại bài học *
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              value={formData.lessonType}
              onChange={(e) => setFormData({...formData, lessonType: e.target.value})}
              required
            >
              <option value="VIDEO">Video</option>
              <option value="TEXT">Văn bản</option>
              <option value="PRESENTATION">Trình chiếu</option>
              <option value="INTERACTIVE">Tương tác</option>
            </select>
          </div>
          
          <div className="flex items-center justify-end">
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
              onClick={() => navigate(`/admin/courses/${courseId}/modules/${moduleId}/lessons`)}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={submitting}
            >
              {submitting ? 'Đang tạo...' : 'Tạo bài học'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}