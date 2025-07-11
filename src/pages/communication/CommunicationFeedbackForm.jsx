import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { communicationApi } from '../../services/communicationApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaStar, FaArrowLeft, FaSave } from 'react-icons/fa';

const CommunicationFeedbackForm = () => {
  const { id: programId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: '',
    suggestions: '',
    wouldRecommend: false
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (programId) {
      fetchProgram();
    }
  }, [programId]);

  const fetchProgram = async () => {
    try {
      setLoading(true);
      const response = await communicationApi.getProgramById(programId);
      setProgram(response);
    } catch (error) {
      console.error('Error fetching program:', error);
      toast.error('Có lỗi khi tải thông tin chương trình');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!feedback.rating || feedback.rating < 1 || feedback.rating > 5) {
      newErrors.rating = 'Vui lòng chọn đánh giá từ 1 đến 5 sao';
    }
    
    if (!feedback.comment.trim()) {
      newErrors.comment = 'Vui lòng nhập nhận xét';
    }
    
    if (feedback.comment.trim().length < 10) {
      newErrors.comment = 'Nhận xét phải có ít nhất 10 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user?.userId) {
      toast.error('Vui lòng đăng nhập để gửi phản hồi');
      return;
    }

    try {
      setSubmitting(true);
      
      const feedbackData = {
        rating: feedback.rating,
        comment: feedback.comment.trim(),
        suggestions: feedback.suggestions.trim() || null,
        wouldRecommend: feedback.wouldRecommend
      };

      console.log('Submitting feedback:', feedbackData);
      
      await communicationApi.submitFeedback(parseInt(programId), feedbackData, user.userId);
      toast.success('Gửi phản hồi thành công!');
      
      // Navigate back to program detail
      navigate(`/communication/programs/${programId}`);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi khi gửi phản hồi';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingClick = (rating) => {
    setFeedback(prev => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: null }));
    }
  };

  const handleInputChange = (field, value) => {
    setFeedback(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h2>
          <p className="text-gray-600">Không tìm thấy chương trình</p>
          <button
            onClick={() => navigate('/communication/programs')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Quay lại
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
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(`/communication/programs/${programId}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <FaArrowLeft />
              Quay lại
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Đánh giá chương trình</h1>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{program.title}</h2>
            <p className="text-gray-600">{program.description}</p>
          </div>
        </div>

        {/* Feedback Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đánh giá của bạn *
              </label>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }, (_, index) => {
                  const starValue = index + 1;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => handleRatingClick(starValue)}
                      className={`text-2xl transition-colors ${
                        starValue <= feedback.rating 
                          ? 'text-yellow-400 hover:text-yellow-500' 
                          : 'text-gray-300 hover:text-gray-400'
                      }`}
                    >
                      <FaStar />
                    </button>
                  );
                })}
                {feedback.rating > 0 && (
                  <span className="ml-2 text-sm text-gray-600">
                    {feedback.rating}/5 sao
                  </span>
                )}
              </div>
              {errors.rating && (
                <p className="text-red-600 text-sm mt-1">{errors.rating}</p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhận xét của bạn *
              </label>
              <textarea
                value={feedback.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về chương trình..."
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.comment ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.comment && (
                  <p className="text-red-600 text-sm">{errors.comment}</p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {feedback.comment.length}/500 ký tự
                </p>
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đề xuất cải thiện (tùy chọn)
              </label>
              <textarea
                value={feedback.suggestions}
                onChange={(e) => handleInputChange('suggestions', e.target.value)}
                placeholder="Bạn có đề xuất gì để cải thiện chương trình không?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Would Recommend */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={feedback.wouldRecommend}
                  onChange={(e) => handleInputChange('wouldRecommend', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Tôi sẽ giới thiệu chương trình này cho người khác
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(`/communication/programs/${programId}`)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Gửi phản hồi
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommunicationFeedbackForm;
