import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { Modal } from '../../components/ui/Modal';


export default function ModuleManagement() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    orderIndex: 0,
    isRequired: true,
    estimatedTime: ''
  });

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseResponse, modulesResponse] = await Promise.all([
        axios.get(`/courses/${courseId}`),
        axios.get(`/courses/${courseId}/modules`)
      ]);
      
      setCourse(courseResponse.data);
      setModules(modulesResponse.data || []);
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
      console.log('🔍 Đang gửi dữ liệu module:', formData);
      
      // Chuẩn hóa payload đúng với CourseModuleDTO
      const moduleData = {
        title: formData.title,
        description: formData.description || '',
        position: parseInt(formData.orderIndex || 0),
        courseId: parseInt(courseId)
      };

      // Thêm id nếu đang chỉnh sửa module
      if (editingModule && editingModule.id) {
        moduleData.id = editingModule.id;
      }

      console.log('🔍 Dữ liệu module cuối cùng:', moduleData);

      let response;
      if (editingModule) {
        console.log(`🔄 Đang cập nhật module ${editingModule.id}`);
        response = await axios.put(`/courses/${courseId}/modules/${editingModule.id}`, moduleData);
        toast.success('Cập nhật module thành công');
      } else {
        console.log('➕ Đang tạo module mới');
        response = await axios.post(`/courses/${courseId}/modules`, moduleData);
        toast.success('Tạo module thành công');
      }

      console.log('✅ Phản hồi từ server:', response.data);
      
      resetForm();
      fetchData();
    } catch (error) {
      console.error('❌ Lỗi khi lưu module:', error);
      console.error('❌ Chi tiết lỗi:', error.response?.data);
      toast.error(editingModule ? 'Có lỗi khi cập nhật module' : 'Có lỗi khi tạo module');
    }
  };

  const handleEdit = (module) => {
    setEditingModule(module);
    setFormData({
      title: module.title,
      description: module.description || '',
      orderIndex: module.orderIndex,
      isRequired: module.isRequired !== false,
      estimatedTime: module.estimatedTime || ''
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (moduleId) => {
    try {
      console.log(`🗑️ Đang xóa module ${moduleId}`);
      await axios.delete(`/courses/${courseId}/modules/${moduleId}`);
      toast.success('Xóa module thành công');
      fetchData();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('❌ Lỗi khi xóa module:', error);
      console.error('❌ Chi tiết lỗi:', error.response?.data);
      toast.error('Có lỗi khi xóa module');
    }
  };
  
  const handleReorder = async (moduleId, newOrderIndex) => {
    try {
      console.log(`🔄 Đang thay đổi thứ tự module ${moduleId} sang vị trí ${newOrderIndex}`);
      
      // Find the module to update
      const moduleToUpdate = modules.find(m => m.id === moduleId);
      if (!moduleToUpdate) {
        console.error(`❌ Không tìm thấy module với ID ${moduleId}`);
        return;
      }
      
      // Cập nhật module với position mới
      const updateData = {
        ...moduleToUpdate,
        position: newOrderIndex
      };
      
      // Gọi API để cập nhật position
      await axios.put(`/courses/${courseId}/modules/${moduleId}`, updateData);
      toast.success('Thay đổi thứ tự thành công');
      
      // Refresh data to show the new order
      fetchData();
    } catch (error) {
      console.error('❌ Lỗi khi thay đổi thứ tự module:', error);
      console.error('❌ Chi tiết lỗi:', error.response?.data);
      toast.error('Có lỗi khi thay đổi thứ tự module');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      orderIndex: modules.length,
      isRequired: true,
      estimatedTime: ''
    });
    setEditingModule(null);
    setShowCreateModal(false);
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
            <span>Quản lý Module</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý Module - {course?.title}
          </h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Thêm Module
        </button>
      </div>

      {/* Course Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{course?.title}</h2>
            <p className="text-gray-600">{course?.description}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>Tổng số module: {modules.length}</span>
              <span>Thời lượng ước tính: {modules.reduce((total, m) => total + (parseInt(m.estimatedTime) || 0), 0)} phút</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              course?.status === 'PUBLISHED' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {course?.status}
            </span>
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div className="bg-white rounded-lg shadow-md">
        {modules.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium mb-2">Chưa có module nào</h3>
            <p className="mb-4">Hãy thêm module đầu tiên cho khóa học này</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Thêm Module
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {modules.map((module, index) => (
              <div key={module.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Module {module.orderIndex + 1}
                      </span>
                      {module.isRequired && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Bắt buộc
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {module.title}
                    </h3>
                    
                    {module.description && (
                      <p className="text-gray-600 mb-3">{module.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span>Bài học: {module.lessons?.length || 0}</span>
                      {module.estimatedTime && (
                        <span>Thời lượng: {module.estimatedTime} phút</span>
                      )}
                      <span>Thứ tự: {module.orderIndex + 1}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {/* Reorder buttons */}
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleReorder(module.id, Math.max(0, module.orderIndex - 1))}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Di chuyển lên"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleReorder(module.id, Math.min(modules.length - 1, module.orderIndex + 1))}
                        disabled={index === modules.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Di chuyển xuống"
                      >
                        ↓
                      </button>
                    </div>
                    
                    <Link
                      to={`/admin/courses/${courseId}/modules/${module.id}/lessons`}
                      className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded text-sm font-medium"
                    >
                      Quản lý bài học
                    </Link>
                    
                    <button
                      onClick={() => handleEdit(module)}
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded text-sm font-medium"
                    >
                      Sửa
                    </button>
                    
                    <button
                      onClick={() => setDeleteConfirm(module)}
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
          title={editingModule ? 'Chỉnh sửa Module' : 'Thêm Module Mới'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề Module *
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
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

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
                  Thời lượng ước tính (phút)
                </label>
                <input
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
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
                Module bắt buộc
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
                {editingModule ? 'Cập nhật' : 'Tạo Module'}
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
              Bạn có chắc chắn muốn xóa module này?
            </h3>
            <p className="text-gray-600 mb-4">
              Module "{deleteConfirm.title}" và tất cả bài học trong module sẽ bị xóa vĩnh viễn.
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
                Xóa Module
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
