import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getSurveyById, submitSurveyResponse } from '../services/surveyService';
import { useAuth } from '../context/AuthContext';

const SurveyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Lấy dữ liệu khảo sát từ API
    const fetchSurvey = async () => {
      try {
        setLoading(true);
        const response = await getSurveyById(id);
        setSurvey(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu khảo sát:', error);
        toast.error('Không thể tải khảo sát. Vui lòng thử lại sau!');
        
        // Nếu API lỗi, sử dụng dữ liệu mẫu để demo UI
        setSurvey({
          id: 1,
          title: 'Đánh giá mức độ nghiện game',
          description: 'Khảo sát này sẽ giúp xác định mức độ nghiện game của bạn dựa trên các tiêu chuẩn quốc tế.',
          questions: [
            {
              id: 1,
              text: 'Bạn dành bao nhiêu giờ mỗi ngày để chơi game?',
              type: 'radio',
              options: [
                { value: '0', text: 'Dưới 1 giờ' },
                { value: '1', text: '1-2 giờ' },
                { value: '2', text: '3-4 giờ' },
                { value: '3', text: '5-6 giờ' },
                { value: '4', text: 'Trên 6 giờ' }
              ]
            },
            {
              id: 2,
              text: 'Bạn có thường bỏ qua các hoạt động xã hội để dành thời gian chơi game không?',
              type: 'radio',
              options: [
                { value: '0', text: 'Không bao giờ' },
                { value: '1', text: 'Hiếm khi' },
                { value: '2', text: 'Thỉnh thoảng' },
                { value: '3', text: 'Thường xuyên' },
                { value: '4', text: 'Luôn luôn' }
              ]
            },
            {
              id: 3,
              text: 'Bạn có cảm thấy bồn chồn, khó chịu hoặc cáu kỉnh khi không thể chơi game không?',
              type: 'radio',
              options: [
                { value: '0', text: 'Không bao giờ' },
                { value: '1', text: 'Hiếm khi' },
                { value: '2', text: 'Thỉnh thoảng' },
                { value: '3', text: 'Thường xuyên' },
                { value: '4', text: 'Luôn luôn' }
              ]
            },
            {
              id: 4,
              text: 'Bạn có thường xuyên nghĩ về các trò chơi khi không đang chơi không?',
              type: 'radio',
              options: [
                { value: '0', text: 'Không bao giờ' },
                { value: '1', text: 'Hiếm khi' },
                { value: '2', text: 'Thỉnh thoảng' },
                { value: '3', text: 'Thường xuyên' },
                { value: '4', text: 'Luôn luôn' }
              ]
            },
            {
              id: 5,
              text: 'Việc chơi game có ảnh hưởng tiêu cực đến công việc/học tập của bạn không?',
              type: 'radio',
              options: [
                { value: '0', text: 'Không ảnh hưởng' },
                { value: '1', text: 'Ảnh hưởng nhỏ' },
                { value: '2', text: 'Ảnh hưởng vừa phải' },
                { value: '3', text: 'Ảnh hưởng đáng kể' },
                { value: '4', text: 'Ảnh hưởng nghiêm trọng' }
              ]
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [id]);

  // Xử lý khi người dùng chọn câu trả lời
  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Xử lý khi người dùng chuyển bước
  const handleNext = () => {
    if (currentStep < survey.questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Xử lý khi người dùng nộp bài khảo sát
  const handleSubmit = async () => {
    // Kiểm tra xem người dùng đã trả lời tất cả câu hỏi chưa
    const answeredQuestions = Object.keys(answers).length;
    if (answeredQuestions < survey.questions.length) {
      toast.warning(`Vui lòng trả lời tất cả ${survey.questions.length} câu hỏi trước khi nộp bài!`);
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Gửi câu trả lời khảo sát lên API
      if (user) {
        await submitSurveyResponse(survey.id, answers);
      } else {
        // Nếu không đăng nhập, chỉ lưu vào localStorage để demo UI
        localStorage.setItem('surveyResult', JSON.stringify({
          surveyId: survey.id,
          totalScore: Object.values(answers).reduce((sum, val) => sum + parseInt(val), 0),
          maxPossibleScore: survey.questions.length * 4,
          answers
        }));
      }
      
      toast.success('Nộp bài khảo sát thành công!');
      navigate('/surveys/results');
    } catch (error) {
      console.error('Lỗi khi nộp khảo sát:', error);
      toast.error('Không thể nộp bài khảo sát. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Đang tải khảo sát...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-16">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold mt-4 mb-2">Không tìm thấy khảo sát</h2>
          <p className="text-gray-600 mb-6">Khảo sát bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <button 
            onClick={() => navigate('/surveys')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay về danh sách khảo sát
          </button>
        </div>
      </div>
    );
  }

  // Lấy câu hỏi hiện tại
  const currentQuestion = survey.questions[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 py-12 mt-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-blue-600 p-6 text-white">
            <h1 className="text-2xl font-bold">{survey.title}</h1>
            <p className="mt-2 text-blue-100">{survey.description}</p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 h-2">
            <div 
              className="bg-blue-600 h-2 transition-all duration-300" 
              style={{ width: `${((currentStep + 1) / survey.questions.length) * 100}%` }}
            ></div>
          </div>

          {/* Question */}
          <div className="p-6">
            <div className="flex justify-between text-sm mb-4">
              <span className="text-gray-500">Câu hỏi {currentStep + 1}/{survey.questions.length}</span>
            </div>
            
            <h2 className="text-xl font-semibold mb-6">{currentQuestion.text}</h2>
            
            <div className="space-y-3">
              {currentQuestion.type === 'radio' && 
                currentQuestion.options.map((option, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleAnswer(currentQuestion.id, option.value)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      answers[currentQuestion.id] === option.value 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                        answers[currentQuestion.id] === option.value 
                          ? 'border-blue-600' 
                          : 'border-gray-400'
                      }`}>
                        {answers[currentQuestion.id] === option.value && (
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      <span>{option.text}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Navigation */}
          <div className="p-6 bg-gray-50 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`px-5 py-2 rounded-lg ${
                currentStep === 0 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Câu trước
            </button>
            
            {currentStep < survey.questions.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]}
                className={`px-5 py-2 rounded-lg ${
                  !answers[currentQuestion.id] 
                    ? 'bg-blue-300 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Câu tiếp theo
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !answers[currentQuestion.id]}
                className={`px-5 py-2 rounded-lg ${
                  isSubmitting || !answers[currentQuestion.id]
                    ? 'bg-green-300 cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Hoàn thành khảo sát'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SurveyDetail;