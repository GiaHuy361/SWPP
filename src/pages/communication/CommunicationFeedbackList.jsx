import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { communicationApi } from '../../services/communicationApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaStar, FaCalendar, FaUser, FaComment, FaEye } from 'react-icons/fa';
import { LoadingPage } from '../../components/LoadingSpinner';

const CommunicationFeedbackList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    rating: '',
    search: '',
    page: 0,
    size: 10
  });
  const [totalPages, setTotalPages] = useState(0);

  const canViewPrograms = user?.permissions?.includes('VIEW_PROGRAMS');

  useEffect(() => {
    if (canViewPrograms) {
      fetchFeedbacks();
    } else {
      setError('Bạn không có quyền xem phản hồi');
      setLoading(false);
    }
  }, [canViewPrograms, filters]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const params = {
        page: filters.page,
        size: filters.size,
        ...(filters.rating && { rating: filters.rating }),
        ...(filters.search && { search: filters.search })
      };
      
      const response = await communicationApi.getAllFeedbacks(params);
      
      if (response.content) {
        setFeedbacks(response.content);
        setTotalPages(response.totalPages || 0);
      } else if (Array.isArray(response)) {
        setFeedbacks(response);
        setTotalPages(1);
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setError('Có lỗi xảy ra khi tải danh sách phản hồi');
      toast.error('Có lỗi xảy ra khi tải danh sách phản hồi');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 0 // Reset page when filter changes
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingPage message="Đang tải danh sách phản hồi..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/communication')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Quay lại Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/communication')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FaArrowLeft />
              <span>Quay lại</span>
            </button>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Phản hồi chương trình</h1>
              <p className="text-gray-600 mt-2">Xem tất cả phản hồi về các chương trình truyền thông</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Tìm theo nhận xét..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo đánh giá
              </label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange({ rating: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả đánh giá</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => handleFilterChange({ search: '', rating: '' })}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        {feedbacks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FaComment className="text-gray-400 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có phản hồi</h3>
            <p className="text-gray-600 mb-6">Chưa có phản hồi nào được gửi cho các chương trình.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {feedbacks.map((feedback) => (
              <div key={feedback.feedbackId || feedback.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-1">
                        {renderStars(feedback.rating)}
                        <span className="ml-2 text-sm text-gray-600">
                          ({feedback.rating}/5)
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FaCalendar className="w-4 h-4" />
                        <span>{formatDate(feedback.createdAt)}</span>
                      </div>
                    </div>
                    
                    {feedback.programTitle && (
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {feedback.programTitle}
                      </h3>
                    )}
                    
                    {feedback.userFullName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <FaUser className="w-4 h-4" />
                        <span>Bởi: {feedback.userFullName}</span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => navigate(`/communication/feedback/${feedback.feedbackId || feedback.id}`)}
                    className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-md transition-colors text-sm"
                  >
                    <FaEye className="w-4 h-4" />
                    Xem chi tiết
                  </button>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Nhận xét:</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {feedback.comment || 'Không có nhận xét'}
                  </p>
                </div>
                
                {feedback.suggestions && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Đề xuất cải thiện:</h4>
                    <p className="text-gray-700 leading-relaxed">
                      {feedback.suggestions}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 0}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index)}
                  className={`px-4 py-2 border rounded-md ${
                    index === filters.page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page >= totalPages - 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationFeedbackList;
