import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { Modal } from '../../components/ui/Modal';
import lessonService from '../../services/lessonService';

export default function LessonManagement() {
  const { courseId, moduleId } = useParams();
  const [course, setCourse] = useState(null);
  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [lessonCount, setLessonCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    contentType: 'TEXT',
    videoUrl: '',
    duration: '',
    orderIndex: 0,
    isRequired: true,
    resources: []
  });

  const contentTypes = [
    { value: 'TEXT', label: 'Văn bản' },
    { value: 'VIDEO', label: 'Video' },
    { value: 'DOCUMENT', label: 'Tài liệu' },
    { value: 'INTERACTIVE', label: 'Tương tác' }
  ];

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId, moduleId]);

  const fetchData = async () => {
    setLoading(true);
    console.log('Đang tải dữ liệu cho courseId:', courseId, 'moduleId:', moduleId);
    
    try {
      // Lấy dữ liệu song song từ các API
      console.log('Đang gọi các API đồng thời');
      const [courseResponse, lessonsData, modulesData] = await Promise.all([
        axios.get(`/courses/${courseId}`),
        lessonService.getLessonsByModuleId(moduleId),
        axios.get(`/courses/${courseId}/modules`)
      ]);
      
      setCourse(courseResponse.data);
      setLessons(lessonsData || []);
      setLessonCount(lessonsData?.length || 0);
      console.log('Đã tải được', lessonsData?.length || 0, 'bài học');
      
      // Tìm thông tin module từ API modules trực tiếp
      const modules = modulesData.data || [];
      const currentModule = modules.find(m => m.id == moduleId);
      
      if (currentModule) {
        console.log('✅ Tìm thấy module từ API modules:', currentModule);
        setModule(currentModule);
      } else {
        // Thử tìm từ course.modules
        if (courseResponse.data?.modules) {
          const foundModule = courseResponse.data.modules.find(m => m.id == moduleId);
          if (foundModule) {
            console.log('✅ Tìm thấy module từ course.modules:', foundModule);
            setModule(foundModule);
          } else {
            console.log('⚠️ Không tìm thấy module, sử dụng thông tin cơ bản');
            setModule({ title: `Module ${moduleId}`, id: moduleId });
          }
        } else {
          // Nếu không có thông tin modules, tạo module giả
          console.log('⚠️ Không có danh sách modules, tạo module giả');
          setModule({ title: `Module ${moduleId}`, id: moduleId });
        }
      }
      
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      if (error.response?.status === 404) {
        toast.error('Không tìm thấy dữ liệu. Vui lòng kiểm tra lại.');
      } else if (error.response?.status === 403) {
        toast.error('Bạn không có quyền truy cập.');
      } else if (error.response?.status === 405) {
        toast.error('API không hỗ trợ. Một số tính năng có thể bị hạn chế.');
        // Vẫn cố gắng lấy lessons
        try {
          const lessons = await lessonService.getLessonsByModuleId(moduleId);
          setLessons(lessons || []);
          setModule({ title: `Module ${moduleId}`, id: moduleId });
        } catch (lessonError) {
          toast.error('Không thể tải danh sách bài học');
        }
      } else {
        toast.error('Có lỗi khi tải dữ liệu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) return;
    setSubmitting(true);
    
    try {
      // Đảm bảo dữ liệu đúng với CourseLesson DTO ở backend
      const lessonData = {
        title: formData.title,
        content: formData.content,
        videoUrl: formData.contentType === 'VIDEO' ? formData.videoUrl : '',
        // Quan trọng: Dùng position thay vì orderIndex
        position: parseInt(formData.orderIndex) || 0
      };

      console.log('Dữ liệu gửi đi:', lessonData);

      if (editingLesson) {
        await lessonService.updateLesson(moduleId, editingLesson.id, lessonData);
        toast.success('Cập nhật bài học thành công');
      } else {
        await lessonService.createLesson(moduleId, lessonData);
        toast.success('Tạo bài học thành công');
      }

      resetForm();
      fetchData();
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(`Lỗi: ${error.response.data.message}`);
      } else {
        toast.error('Có lỗi xảy ra khi lưu bài học');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (lesson) => {
    // Chuyển đổi từ model backend sang form frontend
    setFormData({
      title: lesson.title || '',
      content: lesson.content || '',
      videoUrl: lesson.videoUrl || '',
      contentType: lesson.videoUrl ? 'VIDEO' : 'TEXT',
      // Map position thành orderIndex
      orderIndex: lesson.position || 0,
      duration: '', // Backend không có trường này
      isRequired: true // Backend không có trường này
    });
    setEditingLesson(lesson);
    setShowCreateModal(true);
  };

  const handleDelete = async (lessonId) => {
    try {
      await lessonService.deleteLesson(moduleId, lessonId);
      toast.success('Xóa bài học thành công');
      fetchData();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Lỗi khi xóa bài học:', error);
      if (error.response?.status === 404) {
        toast.error('Bài học không tồn tại');
      } else if (error.response?.status === 403) {
        toast.error('Bạn không có quyền xóa bài học này');
      } else if (error.response?.status === 500) {
        // Lỗi foreign key constraint
        if (error.response?.data?.message?.includes('foreign key constraint') || 
            error.response?.data?.message?.includes('Cannot delete')) {
          toast.error('Không thể xóa bài học này vì có học viên đã hoàn thành. Vui lòng liên hệ admin.');
        } else {
          toast.error('Lỗi server khi xóa bài học');
        }
      } else {
        toast.error('Có lỗi khi xóa bài học');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      videoUrl: '',
      contentType: 'TEXT',
      orderIndex: 0, // Đây sẽ được map thành position khi gửi request
      duration: '',
      isRequired: true
    });
    setEditingLesson(null);
    setShowCreateModal(false);
  };

  const handleReorder = async (lessonId, newOrderIndex) => {
    // Note: Using regular update since dedicated reorder endpoint not available
    try {
      const lesson = lessons.find(l => l.id === lessonId);
      if (lesson) {
        const updatedLesson = { ...lesson, orderIndex: newOrderIndex };
        await lessonService.updateLesson(moduleId, lessonId, updatedLesson);
        toast.success('Cập nhật thứ tự thành công');
        fetchData();
      }
    } catch (error) {
      console.error('Error reordering lesson:', error);
      toast.error('Có lỗi khi cập nhật thứ tự');
    }
  };

  const getContentTypeIcon = (contentType) => {
    const icons = {
      TEXT: '📝',
      VIDEO: '🎥',
      DOCUMENT: '📄',
      INTERACTIVE: '⚡'
    };
    return icons[contentType] || '📝';
  };

  const getContentTypeLabel = (contentType) => {
    const type = contentTypes.find(t => t.value === contentType);
    return type ? type.label : 'Văn bản';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <nav className="text-sm text-gray-600 mb-2">
            <Link to="/admin/courses" className="hover:text-blue-600">Quản lý khóa học</Link>
            <span className="mx-2">/</span>
            <Link to={`/admin/courses/${courseId}`} className="hover:text-blue-600">
              {course?.title}
            </Link>
            <span className="mx-2">/</span>
            <Link to={`/admin/courses/${courseId}/modules`} className="hover:text-blue-600">
              Quản lý Module
            </Link>
            <span className="mx-2">/</span>
            <span>Bài học</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý Bài học - {module?.title}
          </h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? '🔄' : '🔄'} Tải lại
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            + Thêm Bài học
          </button>
        </div>
      </div>

      {/* Module Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{module?.title || 'Đang tải...'}</h2>
            <p className="text-gray-600">{module?.description || 'Mô tả module'}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>Tổng số bài học: {lessons.length}</span>
              <span>Thời lượng: {lessons.reduce((total, l) => total + (l.duration || 0), 0)} phút</span>
              {module?.orderIndex !== undefined && (
                <span>Thứ tự module: {module.orderIndex + 1}</span>
              )}
            </div>
          </div>
          <div className="text-right">
            {module?.isRequired !== undefined && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                module.isRequired 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {module.isRequired ? 'Bắt buộc' : 'Tùy chọn'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="bg-white rounded-lg shadow-md">
        {lessons.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium mb-2">Chưa có bài học nào</h3>
            <p className="mb-4">Hãy thêm bài học đầu tiên cho module này</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Thêm Bài học
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {lessons.map((lesson, index) => (
              <div key={lesson.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Bài {(lesson.orderIndex !== undefined ? lesson.orderIndex : index) + 1}
                      </span>
                      <span className="flex items-center space-x-1 bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded">
                        <span>{getContentTypeIcon(lesson.contentType)}</span>
                        <span>{getContentTypeLabel(lesson.contentType)}</span>
                      </span>
                      {lesson.isRequired && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Bắt buộc
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {lesson.title}
                    </h3>
                    
                    {lesson.content && (
                      <p className="text-gray-600 mb-3 line-clamp-3">
                        {lesson.content.length > 150 
                          ? lesson.content.substring(0, 150) + '...' 
                          : lesson.content
                        }
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      {lesson.duration && (
                        <span>Thời lượng: {lesson.duration} phút</span>
                      )}
                      {lesson.videoUrl && (
                        <span>🎥 Có video</span>
                      )}
                      <span>Thứ tự: {(lesson.orderIndex !== undefined ? lesson.orderIndex : index) + 1}</span>
                    </div>

                    {lesson.videoUrl && (
                      <div className="mt-3">
                        <a 
                          href={lesson.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          🔗 Xem video
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {/* Reorder buttons */}
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleReorder(lesson.id, Math.max(0, (lesson.orderIndex !== undefined ? lesson.orderIndex : index) - 1))}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Di chuyển lên"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleReorder(lesson.id, Math.min(lessons.length - 1, (lesson.orderIndex !== undefined ? lesson.orderIndex : index) + 1))}
                        disabled={index === lessons.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Di chuyển xuống"
                      >
                        ↓
                      </button>
                    </div>
                    
                    <Link
                      to={`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/quizzes`}
                      className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 rounded text-sm font-medium"
                    >
                      Quiz
                    </Link>
                    
                    <Link
                      to={`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/edit`}
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded text-sm font-medium"
                    >
                      Sửa
                    </Link>
                    
                    <button
                      onClick={() => setDeleteConfirm(lesson)}
                      className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded text-sm font-medium"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={resetForm}
          title={editingLesson ? 'Chỉnh sửa Bài học' : 'Thêm Bài học Mới'}
          size="large"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề Bài học *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại nội dung
              </label>
              <select
                value={formData.contentType}
                onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {contentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nội dung bài học
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows="6"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập nội dung chi tiết của bài học..."
              />
            </div>

            {formData.contentType === 'VIDEO' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Video *
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://youtube.com/watch?v=... hoặc https://vimeo.com/..."
                  required={formData.contentType === 'VIDEO'}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thứ tự
                </label>
                <input
                  type="number"
                  value={formData.orderIndex}
                  onChange={(e) => setFormData({ ...formData, orderIndex: e.target.value })}
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời lượng (phút)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRequired"
                checked={formData.isRequired}
                onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isRequired" className="ml-2 block text-sm text-gray-900">
                Bài học bắt buộc
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg font-medium"
              >
                {submitting ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingLesson ? 'Đang cập nhật...' : 'Đang tạo...'}
                  </span>
                ) : (
                  editingLesson ? 'Cập nhật' : 'Tạo Bài học'
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Xác nhận xóa"
        >
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Bạn có chắc chắn muốn xóa bài học này?
            </h3>
            <p className="text-gray-600 mb-4">
              Bài học "<strong>{deleteConfirm.title}</strong>" sẽ bị xóa vĩnh viễn. 
              {deleteConfirm.hasQuizzes && (
                <span className="block text-red-600 mt-1">
                  ⚠️ Tất cả quiz và kết quả quiz liên quan cũng sẽ bị xóa.
                </span>
              )}
              {deleteConfirm.hasProgress && (
                <span className="block text-red-600 mt-1">
                  ⚠️ Tiến độ học tập của học viên cho bài học này sẽ bị xóa.
                </span>
              )}
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              >
                Xóa Bài học
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
