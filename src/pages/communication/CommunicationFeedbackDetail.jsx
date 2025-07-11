import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { communicationApi } from '../../services/communicationApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaStar, FaCalendar, FaUser, FaComment, FaLightbulb } from 'react-icons/fa';
import { LoadingPage } from '../../components/LoadingSpinner';

const CommunicationFeedbackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const canViewPrograms = user?.permissions?.includes('VIEW_PROGRAMS');

  useEffect(() => {
    if (!id) {
      setError('ID phản hồi không hợp lệ');
      setLoading(false);
      return;
    }
    
    if (canViewPrograms) {
      fetchFeedback();
    } else {
      setError('Bạn không có quyền xem phản hồi');
      setLoading(false);
    }
  }, [id, canViewPrograms]);

  const fetchFeedback = async () => {
    if (!id) {
      setError('ID phản hồi không hợp lệ');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await communicationApi.getFeedbackById(id);
      setFeedback(response);
      setError(null);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      if (error.response?.status === 404) {
        setError('Không tìm thấy phản hồi');
      } else {
        setError('Có lỗi xảy ra khi tải chi tiết phản hồi');
      }
      toast.error('Có lỗi xảy ra khi tải chi tiết phản hồi');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`text-xl ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
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
    return <LoadingPage message="Đang tải chi tiết phản hồi..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/communication/feedback')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy</h2>
          <p className="text-gray-600 mb-4">Phản hồi không tồn tại hoặc đã bị xóa</p>
          <button
            onClick={() => navigate('/communication/feedback')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/communication/feedback')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FaArrowLeft />
              <span>Quay lại danh sách</span>
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">Chi tiết phản hồi</h1>
          <p className="text-gray-600 mt-2">Xem chi tiết phản hồi về chương trình truyền thông</p>
        </div>

        {/* Feedback Detail Card */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header Section */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {renderStars(feedback.rating)}
                <span className="text-xl font-semibold text-gray-900">
                  {feedback.rating}/5
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FaCalendar className="w-4 h-4" />
                <span>{formatDate(feedback.createdAt)}</span>
              </div>
            </div>
            
            {feedback.programTitle && (
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Chương trình: {feedback.programTitle}
              </h2>
            )}
            
            {feedback.userFullName && (
              <div className="flex items-center gap-2 text-gray-600">
                <FaUser className="w-4 h-4" />
                <span>Phản hồi bởi: <strong>{feedback.userFullName}</strong></span>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-6">
            {/* Comment Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FaComment className="text-blue-600 w-5 h-5" />
                <h3 className="text-lg font-semibold text-gray-900">Nhận xét</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {feedback.comment || 'Không có nhận xét nào được cung cấp.'}
                </p>
              </div>
            </div>

            {/* Suggestions Section */}
            {feedback.suggestions && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FaLightbulb className="text-yellow-500 w-5 h-5" />
                  <h3 className="text-lg font-semibold text-gray-900">Đề xuất cải thiện</h3>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {feedback.suggestions}
                  </p>
                </div>
              </div>
            )}

            {/* Additional Info */}
            {feedback.programId && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    ID Phản hồi: {feedback.id}
                  </span>
                  <button
                    onClick={() => navigate(`/communication/programs/${feedback.programId}`)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-md transition-colors text-sm"
                  >
                    Xem chương trình
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate('/communication/feedback')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-md transition-colors"
          >
            Quay lại danh sách phản hồi
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunicationFeedbackDetail;
