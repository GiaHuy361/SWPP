import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { communicationApi } from '../../../services/communicationApi';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSave, FaCalendar, FaFile, FaUsers } from 'react-icons/fa';

const CommunicationProgramForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [program, setProgram] = useState({
    title: '',
    description: '',
    content: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE', // Sửa thành chữ in hoa để khớp với API
    targetAudience: '',
    expectedOutcome: '',
    budget: '',
    location: '',
    contactInfo: ''
  });

  const isEditing = !!id;
  const canManagePrograms = user?.permissions?.includes('MANAGE_PROGRAMS');

  // Debug ID
  useEffect(() => {
    console.log('Program ID:', id, 'isEditing:', isEditing);
  }, [id, isEditing]);

  useEffect(() => {
    if (!canManagePrograms) {
      setError('Bạn không có quyền quản lý chương trình truyền thông');
      return;
    }

    if (isEditing) {
      fetchProgram();
    }
  }, [id, canManagePrograms, isEditing]);

  const fetchProgram = async () => {
    try {
      setLoading(true);
      const response = await communicationApi.getProgramById(id);
      
      // Format dates for input fields
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };
      
      setProgram({
        title: response.title || '',
        description: response.description || '',
        content: response.content || '',
        startDate: formatDateForInput(response.startDate),
        endDate: formatDateForInput(response.endDate),
        status: response.status || 'ACTIVE', // Sửa thành chữ in hoa để khớp với API
        targetAudience: response.targetAudience || '',
        expectedOutcome: response.expectedOutcome || '',
        budget: response.budget || '',
        location: response.location || '',
        contactInfo: response.contactInfo || ''
      });
    } catch (error) {
      console.error('Error fetching program:', error);
      setError('Có lỗi xảy ra khi tải thông tin chương trình');
      toast.error('Có lỗi xảy ra khi tải thông tin chương trình');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProgram(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!program.title.trim()) {
      errors.title = 'Tiêu đề là bắt buộc';
    }
    
    if (program.title.trim().length < 3) {
      errors.title = 'Tiêu đề phải có ít nhất 3 ký tự';
    }
    
    if (!program.description.trim()) {
      errors.description = 'Mô tả là bắt buộc';
    }
    
    if (program.description.trim().length < 10) {
      errors.description = 'Mô tả phải có ít nhất 10 ký tự';
    }
    
    if (!program.startDate) {
      errors.startDate = 'Ngày bắt đầu là bắt buộc';
    }
    
    if (!program.endDate) {
      errors.endDate = 'Ngày kết thúc là bắt buộc';
    }
    
    if (program.startDate && program.endDate && new Date(program.startDate) > new Date(program.endDate)) {
      errors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
    
    if (program.budget && (isNaN(program.budget) || parseFloat(program.budget) < 0)) {
      errors.budget = 'Ngân sách phải là số không âm';
    }
    
    // Validate ID when editing
    if (isEditing && !id) {
      errors.id = 'ID chương trình không hợp lệ';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      // Display error messages
      Object.values(errors).forEach(errorMessage => toast.error(errorMessage));
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Prepare data for API
      const formatDateTime = (dateStr) => {
        if (!dateStr) return null;
        // Convert to LocalDateTime format for Java backend
        if (dateStr.length === 10) {
          return `${dateStr}T00:00:00`;
        }
        return dateStr;
      };

      const programData = {
        title: program.title.trim(),
        description: program.description.trim(),
        content: program.content.trim() || null,
        startDate: formatDateTime(program.startDate),
        endDate: formatDateTime(program.endDate),
        status: program.status,
        targetAudience: program.targetAudience.trim() || null,
        expectedOutcome: program.expectedOutcome.trim() || null,
        budget: program.budget ? parseFloat(program.budget) : null,
        location: program.location.trim() || null,
        contactInfo: program.contactInfo.trim() || null,
        // Add required fields with default values
        participantCount: 0,
        interactionCount: 0,
        feedbackCount: 0
      };
      
      if (isEditing) {
        console.log('Updating program with ID:', id, 'Data:', programData);
        const updatedProgram = await communicationApi.updateProgram(id, programData);
        console.log('Updated program result:', updatedProgram);
        toast.success('Cập nhật chương trình thành công!');
        // Sau khi cập nhật, chuyển đến trang chi tiết chương trình
        navigate(`/admin/communication/programs/${id}`);
      } else {
        console.log('Creating program with data:', programData);
        const newProgram = await communicationApi.createProgram(programData);
        toast.success('Tạo chương trình thành công!');
        // Sau khi tạo, chuyển đến trang danh sách
        navigate('/admin/communication/programs');
      }
    } catch (error) {
      console.error('Error saving program:', error);
      const errorMessage = error.response?.data?.message || 
        `Có lỗi xảy ra khi ${isEditing ? 'cập nhật' : 'tạo'} chương trình`;
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!canManagePrograms) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Truy cập bị từ chối</h2>
          <p className="text-gray-600">Bạn không có quyền quản lý chương trình truyền thông.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/admin/communication/programs')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/admin/communication/programs')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <FaArrowLeft className="w-4 h-4" />
              Quay lại danh sách
            </button>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditing ? 'Chỉnh sửa chương trình' : 'Tạo chương trình mới'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Cập nhật thông tin chương trình truyền thông' : 'Tạo chương trình truyền thông mới'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FaFile className="w-5 h-5" />
              Thông tin cơ bản
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề chương trình <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={program.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tiêu đề chương trình"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả chương trình <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={program.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Nhập mô tả chương trình"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung chi tiết
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={program.content}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Nhập nội dung chi tiết chương trình"
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={program.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Không hoạt động</option>
                  <option value="COMPLETED">Đã hoàn thành</option>
                  <option value="PENDING">Chờ duyệt</option>
                  <option value="DRAFT">Bản nháp</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FaCalendar className="w-5 h-5" />
              Thời gian
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={program.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={program.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FaUsers className="w-5 h-5" />
              Thông tin bổ sung
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-2">
                  Đối tượng mục tiêu
                </label>
                <input
                  type="text"
                  id="targetAudience"
                  name="targetAudience"
                  value={program.targetAudience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập đối tượng mục tiêu"
                />
              </div>
              
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                  Ngân sách (VND)
                </label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={program.budget}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập ngân sách"
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Địa điểm
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={program.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập địa điểm"
                />
              </div>
              
              <div>
                <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700 mb-2">
                  Thông tin liên hệ
                </label>
                <input
                  type="text"
                  id="contactInfo"
                  name="contactInfo"
                  value={program.contactInfo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập thông tin liên hệ"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="expectedOutcome" className="block text-sm font-medium text-gray-700 mb-2">
                  Kết quả mong đợi
                </label>
                <textarea
                  id="expectedOutcome"
                  name="expectedOutcome"
                  value={program.expectedOutcome}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Nhập kết quả mong đợi"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/admin/communication/programs')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-md transition-colors flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isEditing ? 'Đang cập nhật...' : 'Đang tạo...'}
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4" />
                    {isEditing ? 'Cập nhật' : 'Tạo chương trình'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunicationProgramForm;
