import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getSurveyById, submitSurveyResponse, getUserSurveyResponse, getSurveyResponseById } from '../services/surveyService';
import { getUserProfile } from '../services/profileService';
import { useAuth } from '../context/AuthContext';

const SurveyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [previousResponse, setPreviousResponse] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/surveys/${id}` } });
      return;
    }
    if (!user?.permissions?.includes('VIEW_SURVEYS')) {
      navigate('/access-denied');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        if (!user.permissions.includes('ROLE_Admin')) {
          try {
            const profile = await getUserProfile(user.userId);
            if (!profile.profileId) {
              toast.warning('Vui lòng cập nhật hồ sơ trước khi làm khảo sát.');
              navigate('/profile');
              return;
            }
          } catch (error) {
            console.error('Profile check error:', error);
            toast.error('Không thể kiểm tra hồ sơ. Vui lòng thử lại.');
            navigate('/profile');
            return;
          }
        }
        setProfileChecked(true);

        const surveyResponse = await getSurveyById(id);
        const surveyData = surveyResponse.data;
        setSurvey(surveyData);

        if (!surveyData.questions || surveyData.questions.length === 0) {
          throw new Error('Khảo sát không có câu hỏi.');
        }

        try {
          const responseResponse = await getUserSurveyResponse(id);
          if (responseResponse.data?.responses?.length > 0) {
            const latestResponseId = responseResponse.data.responses[0];
            const responseDetails = await getSurveyResponseById(latestResponseId);
            setPreviousResponse(responseDetails.data);
            const initialAnswers = {};
            responseDetails.data.answers.forEach(answer => {
              if (answer.questionType === 'CHECKBOX_MULTIPLE') {
                initialAnswers[answer.questionId] = answer.optionIds ? JSON.parse(answer.optionIds) : [];
              } else if (answer.questionType === 'TEXT') {
                initialAnswers[answer.questionId] = answer.textAnswer || '';
              } else {
                initialAnswers[answer.questionId] = answer.optionId;
              }
            });
            setAnswers(initialAnswers);
          }
        } catch (responseError) {
          if (responseError.response?.status === 404) {
            console.log('No previous response found for survey:', id);
          } else {
            console.error('Fetch response error:', responseError);
            toast.error('Không thể tải dữ liệu phản hồi. Vui lòng thử lại.');
          }
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || 'Không thể tải khảo sát.';
        console.error('Fetch survey error:', error);
        toast.error(errorMsg);
        navigate('/surveys');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isAuthenticated, user, navigate]);

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleCheckboxAnswer = (questionId, value) => {
    setAnswers(prev => {
      const current = prev[questionId] ? [...prev[questionId]] : [];
      if (current.includes(value)) {
        return { ...prev, [questionId]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [questionId]: [...current, value] };
      }
    });
  };

  const handleTextAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < survey.questions.length - 1) {
      if (!answers[survey.questions[currentStep].id]) {
        toast.warning('Vui lòng trả lời câu hỏi trước khi tiếp tục.');
        return;
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < survey.questions.length) {
      toast.warning(`Vui lòng trả lời tất cả ${survey.questions.length} câu hỏi.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const formattedAnswers = Object.keys(answers).map(questionId => {
        const question = survey.questions.find(q => q.id === parseInt(questionId));
        return {
          questionId: parseInt(questionId),
          optionIds: question?.questionType === 'CHECKBOX_MULTIPLE' ? JSON.stringify(answers[questionId]) : null,
          optionId: question?.questionType === 'MULTIPLE_CHOICE' || question?.questionType === 'TRUE_FALSE' ? answers[questionId] : null,
          textAnswer: question?.questionType === 'TEXT' ? answers[questionId] : null
        };
      });
      const responseData = {
        surveyId: parseInt(id),
        userId: user.userId,
        submittedAt: new Date().toISOString(),
        answers: formattedAnswers
      };
      console.log('Submitting survey response:', JSON.stringify(responseData, null, 2)); // Debug log
      const submitResponse = await submitSurveyResponse(responseData);
      const responseId = submitResponse.data.id; // Lấy responseId
      console.log('Submit response:', JSON.stringify(submitResponse.data, null, 2)); // Debug log
      try {
        await getUserProfile(user.userId);
      } catch (profileError) {
        console.error('Profile sync error:', profileError);
        toast.warn('Không thể đồng bộ kết quả khảo sát với hồ sơ.');
      }
      toast.success('Nộp khảo sát thành công!');
      navigate(`/survey-results/${responseId}`, { state: { refresh: true } });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Không thể nộp khảo sát.';
      console.error('Submit survey error:', error);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !profileChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Đang tải...</p>
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
          <p className="text-gray-600 mb-6">Khảo sát không tồn tại hoặc đã bị xóa.</p>
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

  if (!survey.questions || survey.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-16">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <svg className="w-16 h-16 text-yellow-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold mt-4 mb-2">Khảo sát không có câu hỏi</h2>
          <p className="text-gray-600 mb-6">Khảo sát này hiện không có câu hỏi nào để thực hiện.</p>
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
          <div className="bg-blue-600 p-6 text-white">
            <h1 className="text-2xl font-bold">{survey.title}</h1>
            <p className="mt-2 text-blue-100">{survey.description}</p>
            {previousResponse && (
              <p className="mt-2 text-blue-200 text-sm">
                Bạn đã bắt đầu khảo sát này vào {new Date(previousResponse.submittedAt).toLocaleString('vi-VN')}.
              </p>
            )}
          </div>
          <div className="w-full bg-gray-200 h-2">
            <div
              className="bg-blue-600 h-2 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / survey.questions.length) * 100}%` }}
            ></div>
          </div>
          <div className="p-6">
            <div className="flex justify-between text-sm mb-4">
              <span className="text-gray-500">Câu hỏi {currentStep + 1}/{survey.questions.length}</span>
            </div>
            <h2 className="text-xl font-semibold mb-6">{currentQuestion.questionText}</h2>
            <div className="space-y-3">
              {currentQuestion.questionType === 'TRUE_FALSE' || currentQuestion.questionType === 'MULTIPLE_CHOICE' ? (
                currentQuestion.options.map((option, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleAnswer(currentQuestion.id, option.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      answers[currentQuestion.id] === option.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                          answers[currentQuestion.id] === option.id
                            ? 'border-blue-600'
                            : 'border-gray-400'
                        }`}
                      >
                        {answers[currentQuestion.id] === option.id && (
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      <span>{option.optionText}</span>
                    </div>
                  </div>
                ))
              ) : currentQuestion.questionType === 'CHECKBOX_MULTIPLE' ? (
                currentQuestion.options.map((option, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleCheckboxAnswer(currentQuestion.id, option.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      answers[currentQuestion.id]?.includes(option.id)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 border-2 flex items-center justify-center mr-3 ${
                          answers[currentQuestion.id]?.includes(option.id)
                            ? 'border-blue-600'
                            : 'border-gray-400'
                        }`}
                      >
                        {answers[currentQuestion.id]?.includes(option.id) && (
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span>{option.optionText}</span>
                    </div>
                  </div>
                ))
              ) : currentQuestion.questionType === 'TEXT' ? (
                <textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleTextAnswer(currentQuestion.id, e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:ring-blue-600"
                  placeholder="Nhập câu trả lời của bạn..."
                  rows="4"
                />
              ) : (
                <p className="text-red-600">Loại câu hỏi không được hỗ trợ: {currentQuestion.questionType}</p>
              )}
            </div>
          </div>
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