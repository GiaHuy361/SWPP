import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { Modal } from '../../components/ui/Modal';

export default function LessonManagement() {
  const { courseId, moduleId } = useParams();
  const [course, setCourse] = useState(null);
  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
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

  useEffect(() => {
    fetchData();
  }, [courseId, moduleId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseResponse, moduleResponse, lessonsResponse] = await Promise.all([
        axios.get(`/courses/${courseId}`),
        axios.get(`/courses/${courseId}/modules/${moduleId}`),
        axios.get(`/courses/${courseId}/modules/${moduleId}/lessons`)
      ]);
      
      setCourse(courseResponse.data);
      setModule(moduleResponse.data);
      setLessons(lessonsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Có lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const lessonData = {
        ...formData,
        orderIndex: parseInt(formData.orderIndex),
        duration: formData.duration ? parseInt(formData.duration) : null
      };

      if (editingLesson) {
        await axios.put(
          `/courses/${courseId}/modules/${moduleId}/lessons/${editingLesson.id}`,
          lessonData
        );
        toast.success('Cập nhật bài học thành công');
      } else {
        await axios.post(
          `/courses/${courseId}/modules/${moduleId}/lessons`,
          lessonData
        );
        toast.success('Tạo bài học thành công');
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error(editingLesson ? 'Có lỗi khi cập nhật bài học' : 'Có lỗi khi tạo bài học');
    }
  };

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      content: lesson.content || '',
      contentType: lesson.contentType || 'TEXT',
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration || '',
      orderIndex: lesson.orderIndex,
      isRequired: lesson.isRequired !== false,
      resources: lesson.resources || []
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (lessonId) => {
    try {
      await axios.delete(
        `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`
      );
      toast.success('Xóa bài học thành công');
      fetchData();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('Có lỗi khi xóa bài học');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      contentType: 'TEXT',
      videoUrl: '',
      duration: '',
      orderIndex: lessons.length,
      isRequired: true,
      resources: []
    });
    setEditingLesson(null);
    setShowCreateModal(false);
  };

  const handleReorder = async (lessonId, newOrderIndex) => {
    try {
      await axios.put(
        `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/reorder`,
        { orderIndex: newOrderIndex }
      );
      toast.success('Cập nhật thứ tự thành công');
      fetchData();
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
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Thêm Bài học
        </button>
      </div>

      {/* Module Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{module?.title}</h2>
            <p className="text-gray-600">{module?.description}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>Tổng số bài học: {lessons.length}</span>
              <span>Thời lượng: {lessons.reduce((total, l) => total + (l.duration || 0), 0)} phút</span>
              <span>Thứ tự module: {module?.orderIndex + 1}</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              module?.isRequired 
                ? 'bg-red-100 text-red-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {module?.isRequired ? 'Bắt buộc' : 'Tùy chọn'}
            </span>
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
                        Bài {lesson.orderIndex + 1}
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
                      <span>Thứ tự: {lesson.orderIndex + 1}</span>
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
                        onClick={() => handleReorder(lesson.id, Math.max(0, lesson.orderIndex - 1))}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Di chuyển lên"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleReorder(lesson.id, Math.min(lessons.length - 1, lesson.orderIndex + 1))}
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
                    
                    <button
                      onClick={() => handleEdit(lesson)}
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded text-sm font-medium"
                    >
                      Sửa
                    </button>
                    
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
                  URL Video
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://youtube.com/watch?v=..."
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                {editingLesson ? 'Cập nhật' : 'Tạo Bài học'}
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
              Bài học "{deleteConfirm.title}" và tất cả quiz liên quan sẽ bị xóa vĩnh viễn.
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
