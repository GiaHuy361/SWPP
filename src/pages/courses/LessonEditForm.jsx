import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';

export default function LessonEditForm() {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    videoUrl: '',
    position: 1
  });

  useEffect(() => {
    fetchLessonDetails();
  }, [moduleId, lessonId]);

  const fetchLessonDetails = async () => {
    setLoading(true);
    try {
      console.log(`Đang tải bài học với moduleId=${moduleId}, lessonId=${lessonId}`);
      
      // Log chi tiết trước khi gọi API
      console.log(`Gửi GET request đến: /modules/${moduleId}/lessons`);
      
      // Lấy danh sách tất cả bài học của module
      const response = await axios.get(`/modules/${moduleId}/lessons`);
      console.log('Danh sách bài học:', response.data);
      
      // Lọc ra bài học cần chỉnh sửa
      const lesson = response.data.find(lesson => lesson.id == lessonId);
      console.log('Bài học đã tìm thấy:', lesson);
      
      if (lesson) {
        setFormData({
          title: lesson.title || '',
          content: lesson.content || '',
          videoUrl: lesson.videoUrl || '',
          position: lesson.position || 1
        });
        console.log('Đã thiết lập form data:', {
          title: lesson.title || '',
          content: lesson.content || '',
          videoUrl: lesson.videoUrl || '',
          position: lesson.position || 1
        });
      } else {
        console.error(`Không tìm thấy bài học với id=${lessonId} trong danh sách bài học của module`);
        toast.error('Không tìm thấy bài học');
        navigate(`/admin/courses/${courseId}/modules/${moduleId}/lessons`);
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin bài học:', error);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      toast.error('Không thể tải thông tin bài học');
    } finally {
      setLoading(false);
    }
  };

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
      // Tạo đối tượng Lesson để cập nhật - chỉ gửi những trường cần thiết
      const lessonData = {
        title: formData.title.trim(),
        content: formData.content ? formData.content.trim() : '',
        videoUrl: formData.videoUrl ? formData.videoUrl.trim() : '',
        position: position
      };
      
      console.log('Dữ liệu gửi đi:', lessonData);
      
      // Log chi tiết request để debug
      console.log(`Gửi PUT request đến: /modules/${moduleId}/lessons/${lessonId}`);
      
      const response = await axios.put(`/modules/${moduleId}/lessons/${lessonId}`, lessonData);
      console.log('Response:', response.data);
      toast.success('Cập nhật bài học thành công');
      navigate(`/admin/courses/${courseId}/modules/${moduleId}/lessons`);
    } catch (error) {
      console.error('Lỗi khi cập nhật bài học:', error);
      if (error.response) {
        console.log('Error response status:', error.response.status);
        console.log('Error response data:', error.response.data);
        if (error.response.data && error.response.data.message) {
          toast.error(`Lỗi: ${error.response.data.message}`);
        } else {
          toast.error('Có lỗi khi cập nhật bài học');
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

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3">Đang tải thông tin bài học...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Chỉnh sửa Bài học</h1>
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
              Nội dung
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              URL Video
            </label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              value={formData.videoUrl}
              onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          
          <div className="mb-4">
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
              {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}