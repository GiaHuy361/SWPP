import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { communicationApi } from '../../services/communicationApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaStar, FaComment, FaPaperPlane } from 'react-icons/fa';

const CommunicationFeedback = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: '',
    suggestions: ''
  });

  const canViewPrograms = user?.permissions?.includes('VIEW_PROGRAMS');

  useEffect(() => {
    if (!id) {
      setError('ID chương trình không hợp lệ');
      setLoading(false);
      return;
    }
    
    if (canViewPrograms) {
      fetchProgram();
    } else {
      setError('Bạn không có quyền xem chương trình truyền thông');
      setLoading(false);
    }
  }, [id, canViewPrograms]);

  const fetchProgram = async () => {
    if (!id) {
      setError('ID chương trình không hợp lệ');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await communicationApi.getProgramById(id);
      setProgram(response);
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
    setFeedback(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setFeedback(prev => ({
      ...prev,
      rating
    }));
  };

  const validateForm = () => {
    if (!feedback.rating || feedback.rating < 1 || feedback.rating > 5) {
      toast.error('Vui lòng chọn đánh giá từ 1 đến 5 sao');
      return false;
    }
    
    if (!feedback.comment.trim()) {
      toast.error('Vui lòng nhập nhận xét');
      return false;
    }
    
    if (feedback.comment.trim().length < 10) {
      toast.error('Nhận xét phải có ít nhất 10 ký tự');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!id) {
      toast.error('ID chương trình không hợp lệ');
      return;
    }
    
    if (!validateForm()) return;
    
    if (!user?.id) {
      toast.error('Không thể xác định người dùng. Vui lòng đăng nhập lại.');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const feedbackData = {
        rating: parseInt(feedback.rating),
        comment: feedback.comment.trim(),
        suggestions: feedback.suggestions.trim() || null
      };
      
      await communicationApi.submitFeedback(id, feedbackData, user.userId);
      toast.success('Gửi phản hồi thành công!');
      navigate(`/communication/programs/${id}`);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi gửi phản hồi';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={interactive ? () => handleRatingChange(i) : undefined}
          className={`text-2xl ${
            i <= rating 
              ? 'text-yellow-400' 
              : 'text-gray-300'
          } ${interactive ? 'hover:text-yellow-400 cursor-pointer' : ''} transition-colors`}
          disabled={!interactive}
        >
          <FaStar />
        </button>
      );
    }
    return stars;
  };

  if (!canViewPrograms) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Truy cập bị từ chối</h2>
          <p className="text-gray-600">Bạn không có quyền xem chương trình truyền thông.</p>
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
            onClick={() => navigate('/communication/programs')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Không tìm thấy chương trình</h2>
          <p className="text-gray-600">Chương trình không tồn tại hoặc đã bị xóa.</p>
          <button
            onClick={() => navigate('/communication/programs')}
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
              onClick={() => navigate(`/communication/programs/${id}`)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <FaArrowLeft className="w-4 h-4" />
              Quay lại chi tiết chương trình
            </button>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gửi phản hồi</h1>
            <p className="text-gray-600 mb-4">Chương trình: {program.title}</p>
          </div>
        </div>

        {/* Program Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin chương trình</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{program.title}</h3>
            <p className="text-gray-600 mb-2">{program.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Bắt đầu: {new Date(program.startDate).toLocaleDateString('vi-VN')}</span>
              <span>Kết thúc: {new Date(program.endDate).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Đánh giá và phản hồi</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đánh giá chất lượng chương trình <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2 mb-2">
                {renderStars(feedback.rating, true)}
                <span className="ml-2 text-sm text-gray-600">
                  {feedback.rating > 0 ? `${feedback.rating}/5 sao` : 'Chưa chọn'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Nhấn vào sao để chọn đánh giá (1 sao = rất kém, 5 sao = rất tốt)
              </p>
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Nhận xét về chương trình <span className="text-red-500">*</span>
              </label>
              <textarea
                id="comment"
                name="comment"
                value={feedback.comment}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Chia sẻ nhận xét của bạn về chương trình..."
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Tối thiểu 10 ký tự. Hiện tại: {feedback.comment.length} ký tự
              </p>
            </div>

            {/* Suggestions */}
            <div>
              <label htmlFor="suggestions" className="block text-sm font-medium text-gray-700 mb-2">
                Đề xuất cải thiện (tùy chọn)
              </label>
              <textarea
                id="suggestions"
                name="suggestions"
                value={feedback.suggestions}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Bạn có đề xuất gì để cải thiện chương trình?"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(`/communication/programs/${id}`)}
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
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="w-4 h-4" />
                    Gửi phản hồi
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Guidelines */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h3 className="font-semibold text-blue-900 mb-2">Hướng dẫn viết phản hồi</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Hãy trung thực và khách quan trong đánh giá</li>
            <li>• Chia sẻ những điểm tích cực và tiêu cực về chương trình</li>
            <li>• Đề xuất cải thiện sẽ giúp chương trình tốt hơn</li>
            <li>• Tránh sử dụng ngôn ngữ không phù hợp</li>
            <li>• Phản hồi của bạn sẽ giúp cải thiện chất lượng chương trình</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CommunicationFeedback;
