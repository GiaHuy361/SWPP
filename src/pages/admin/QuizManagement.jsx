import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { lessonService } from '../../services/lessonService';
import { 
  createQuizForCourse, 
  getQuizQuestions, 
  createQuizQuestion, 
  updateQuizQuestion, 
  deleteQuizQuestion,
  getQuestionAnswers,
  createQuestionAnswer,
  updateQuestionAnswer,
  deleteQuestionAnswer
} from '../../services/courseService';
import '../../TailwindCSS/QuizManagement.css';

export default function QuizManagement() {
  const { courseId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info' hoặc 'questions' hoặc 'answers'
  
  // State cho quiz
  const [formData, setFormData] = useState({
    durationMinutes: 5,
    shuffleQuestions: true,
    shuffleAnswers: true,
    passingPercentage: 70
  });

  // State cho questions
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionFormData, setQuestionFormData] = useState({
    questionText: '',
    explanation: '',
    position: 0,
    questionType: 'MULTIPLE_CHOICE'
  });
  
  // State cho answers
  const [answers, setAnswers] = useState([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState(null);
  const [answerFormData, setAnswerFormData] = useState({
    answerText: '',
    isCorrect: false
  });

  useEffect(() => {
    fetchQuiz();
  }, [courseId]);

  useEffect(() => {
    if (quiz && activeTab === 'questions') {
      fetchQuestions();
    }
  }, [quiz, activeTab]);
  
  useEffect(() => {
    if (selectedQuestion && activeTab === 'answers') {
      fetchAnswers(selectedQuestion.id);
    }
  }, [selectedQuestion, activeTab]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const data = await lessonService.getQuizzesByCourseId(courseId);
      console.log('Quiz data:', data);
      
      if (data && data.length > 0) {
        setQuiz(data[0]);
      } else {
        setQuiz(null);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Không thể tải thông tin quiz');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    if (!quiz || !quiz.id) return;
    
    setLoadingQuestions(true);
    try {
      const response = await getQuizQuestions(quiz.id);
      console.log('Câu hỏi quiz:', response.data);
      setQuestions(response.data || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách câu hỏi:', error);
      toast.error('Không thể tải danh sách câu hỏi');
    } finally {
      setLoadingQuestions(false);
    }
  };
  
  const fetchAnswers = async (questionId) => {
    if (!questionId) return;
    
    setLoadingAnswers(true);
    try {
      const response = await getQuestionAnswers(questionId);
      console.log(`Đáp án cho câu hỏi ${questionId}:`, response.data);
      setAnswers(response.data || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đáp án:', error);
      toast.error('Không thể tải danh sách đáp án');
    } finally {
      setLoadingAnswers(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const quizData = {
        durationMinutes: parseInt(formData.durationMinutes),
        shuffleQuestions: formData.shuffleQuestions,
        shuffleAnswers: formData.shuffleAnswers,
        passingPercentage: parseInt(formData.passingPercentage)
      };

      if (quiz) {
        await lessonService.updateQuiz(courseId, quiz.id, quizData);
        toast.success('Cập nhật quiz thành công');
      } else {
        await createQuizForCourse(courseId, quizData);
        toast.success('Tạo quiz thành công');
      }

      setShowCreateModal(false);
      fetchQuiz();
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error(error.response?.data?.message || 'Có lỗi khi lưu quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa quiz này?')) return;
    
    try {
      await lessonService.deleteQuiz(courseId, quiz.id);
      toast.success('Xóa quiz thành công');
      setQuiz(null);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Không thể xóa quiz');
    }
  };

  const handleEdit = () => {
    if (quiz) {
      setFormData({
        durationMinutes: quiz.durationMinutes,
        shuffleQuestions: quiz.shuffleQuestions,
        shuffleAnswers: quiz.shuffleAnswers,
        passingPercentage: quiz.passingPercentage
      });
    }
    setShowCreateModal(true);
  };

  // Xử lý câu hỏi quiz
  const handleQuestionInputChange = (e) => {
    const { name, value } = e.target;
    setQuestionFormData({...questionFormData, [name]: value});
  };

  const resetQuestionForm = () => {
    setQuestionFormData({
      questionText: '',
      explanation: '',
      position: questions.length,
      questionType: 'MULTIPLE_CHOICE'
    });
    setEditingQuestion(null);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionFormData({
      questionText: question.questionText,
      explanation: question.explanation || '',
      position: question.position,
      questionType: question.questionType
    });
    setShowQuestionModal(true);
  };
  
  const handleViewAnswers = (question) => {
    setSelectedQuestion(question);
    setActiveTab('answers');
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!quiz || !quiz.id) {
      toast.error('Vui lòng tạo quiz trước khi thêm câu hỏi');
      return;
    }

    try {
      const questionData = {
        questionText: questionFormData.questionText,
        explanation: questionFormData.explanation || '',
        position: parseInt(questionFormData.position),
        questionType: questionFormData.questionType,
        quizId: parseInt(quiz.id)
      };

      if (editingQuestion) {
        await updateQuizQuestion(quiz.id, editingQuestion.id, questionData);
        toast.success('Cập nhật câu hỏi thành công');
      } else {
        await createQuizQuestion(quiz.id, questionData);
        toast.success('Tạo câu hỏi mới thành công');
      }

      setShowQuestionModal(false);
      resetQuestionForm();
      fetchQuestions();
    } catch (error) {
      console.error('Lỗi khi lưu câu hỏi:', error);
      toast.error('Có lỗi khi lưu câu hỏi');
    }
  };

  const confirmDeleteQuestion = async (questionId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;

    try {
      await deleteQuizQuestion(quiz.id, questionId);
      toast.success('Xóa câu hỏi thành công');
      fetchQuestions();
    } catch (error) {
      console.error('Lỗi khi xóa câu hỏi:', error);
      toast.error('Có lỗi khi xóa câu hỏi');
    }
  };
  
  // Xử lý đáp án
  const handleAnswerInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAnswerFormData({
      ...answerFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const resetAnswerForm = () => {
    setAnswerFormData({
      answerText: '',
      isCorrect: false
    });
    setEditingAnswer(null);
  };
  
  const handleEditAnswer = (answer) => {
    setEditingAnswer(answer);
    setAnswerFormData({
      answerText: answer.answerText,
      isCorrect: answer.isCorrect
    });
    setShowAnswerModal(true);
  };
  
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!selectedQuestion || !selectedQuestion.id) {
      toast.error('Vui lòng chọn câu hỏi trước khi thêm đáp án');
      return;
    }

    try {
      const answerData = {
        answerText: answerFormData.answerText,
        isCorrect: answerFormData.isCorrect,
        questionId: selectedQuestion.id
      };

      if (editingAnswer) {
        await updateQuestionAnswer(selectedQuestion.id, editingAnswer.id, answerData);
        toast.success('Cập nhật đáp án thành công');
      } else {
        await createQuestionAnswer(selectedQuestion.id, answerData);
        toast.success('Tạo đáp án mới thành công');
      }

      setShowAnswerModal(false);
      resetAnswerForm();
      fetchAnswers(selectedQuestion.id);
    } catch (error) {
      console.error('Lỗi khi lưu đáp án:', error);
      toast.error('Có lỗi khi lưu đáp án');
    }
  };
  
  const confirmDeleteAnswer = async (answerId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đáp án này?')) return;

    try {
      await deleteQuestionAnswer(selectedQuestion.id, answerId);
      toast.success('Xóa đáp án thành công');
      fetchAnswers(selectedQuestion.id);
    } catch (error) {
      console.error('Lỗi khi xóa đáp án:', error);
      toast.error('Có lỗi khi xóa đáp án');
    }
  };
  
  const handleBackToQuestions = () => {
    setSelectedQuestion(null);
    setActiveTab('questions');
  };

  // Hàm quay lại trang trước
  const handleGoBack = () => {
    window.history.back();
  };

  // Phần UI
  return (
    <div className="quiz-container">
      {/* Nút quay lại trang trước */}
      <button
        onClick={handleGoBack}
        className="quiz-btn-secondary mb-4 flex items-center font-semibold transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Quay lại
      </button>

      <div className="quiz-card">
        <h1 className="quiz-title flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Quản lý Quiz
        </h1>
      
        {loading ? (
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : !quiz ? (
          <div className="mt-4 bg-blue-50 p-8 rounded-lg border border-blue-200 text-center">
            <div className="mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-lg mb-6 text-gray-600">Khóa học này chưa có quiz.</p>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md flex items-center mx-auto"
              onClick={() => setShowCreateModal(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo Quiz Mới
            </button>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <ul className="flex flex-wrap -mb-px">
                <li className="mr-2">
                  <button
                    className={`inline-block p-4 font-medium rounded-t-lg ${activeTab === 'info' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'}`}
                    onClick={() => setActiveTab('info')}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Thông tin Quiz
                    </div>
                  </button>
                </li>
                <li className="mr-2">
                  <button
                    className={`inline-block p-4 font-medium rounded-t-lg ${activeTab === 'questions' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'}`}
                    onClick={() => setActiveTab('questions')}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Câu hỏi Quiz
                    </div>
                  </button>
                </li>
                {selectedQuestion && (
                <li className="mr-2">
                  <button
                    className={`inline-block p-4 font-medium rounded-t-lg ${activeTab === 'answers' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'}`}
                    onClick={() => setActiveTab('answers')}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Đáp án
                    </div>
                  </button>
                </li>
                )}
              </ul>
            </div>

            {/* Quiz Info Tab */}
            {activeTab === 'info' && (
              <div className="mt-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Thông tin Quiz
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium mb-1">Thời gian làm bài:</p>
                    <p className="text-xl font-bold text-blue-800">{quiz.durationMinutes} phút</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-700 font-medium mb-1">Điểm đạt:</p>
                    <p className="text-xl font-bold text-green-800">{quiz.passingPercentage}%</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-700 font-medium mb-1">Xáo trộn câu hỏi:</p>
                    <p className="text-xl font-bold text-purple-800">
                      {quiz.shuffleQuestions ? (
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Có
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Không
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm text-indigo-700 font-medium mb-1">Xáo trộn đáp án:</p>
                    <p className="text-xl font-bold text-indigo-800">
                      {quiz.shuffleAnswers ? (
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Có
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Không
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg flex items-center shadow-sm transition-colors"
                    onClick={handleEdit}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Sửa Quiz
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center shadow-sm transition-colors"
                    onClick={handleDelete}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Xóa Quiz
                  </button>
                </div>
              </div>
            )}

            {/* Questions Tab */}
            {activeTab === 'questions' && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Câu hỏi Quiz
                  </h2>
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
                    onClick={() => {
                      resetQuestionForm();
                      setShowQuestionModal(true);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Thêm câu hỏi
                  </button>
                </div>

                {loadingQuestions ? (
                  <div className="text-center p-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-3 text-gray-600">Đang tải danh sách câu hỏi...</p>
                  </div>
                ) : questions.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-6 rounded-lg text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-yellow-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="font-semibold text-lg mb-2">Chưa có câu hỏi nào</p>
                    <p className="text-sm">Hãy thêm câu hỏi mới để tạo quiz hoàn chỉnh!</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Câu hỏi</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {questions.map((question, index) => (
                          <tr key={question.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {question.questionText}
                              {question.explanation && (
                                <p className="text-xs text-gray-500 mt-1 italic">Giải thích: {question.explanation}</p>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                question.questionType === 'MULTIPLE_CHOICE' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {question.questionType === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 'Đúng/Sai'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button 
                                onClick={() => handleViewAnswers(question)}
                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded"
                                title="Quản lý đáp án"
                              >
                                <span className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                  Đáp án
                                </span>
                              </button>
                              <button 
                                onClick={() => handleEditQuestion(question)}
                                className="text-yellow-600 hover:text-yellow-900 bg-yellow-50 px-3 py-1 rounded"
                                title="Sửa câu hỏi"
                              >
                                <span className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                  Sửa
                                </span>
                              </button>
                              <button 
                                onClick={() => confirmDeleteQuestion(question.id)}
                                className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded"
                                title="Xóa câu hỏi"
                              >
                                <span className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Xóa
                                </span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {/* Answers Tab */}
            {activeTab === 'answers' && selectedQuestion && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <button 
                      onClick={handleBackToQuestions}
                      className="text-blue-600 hover:text-blue-900 mb-3 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Quay lại danh sách câu hỏi
                    </button>
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Đáp án cho câu hỏi
                    </h2>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="font-medium text-gray-800">{selectedQuestion.questionText}</p>
                      {selectedQuestion.explanation && (
                        <p className="text-sm text-gray-600 mt-1 italic">Giải thích: {selectedQuestion.explanation}</p>
                      )}
                    </div>
                  </div>
                  <button 
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
                    onClick={() => {
                      resetAnswerForm();
                      setShowAnswerModal(true);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Thêm đáp án
                  </button>
                </div>

                {loadingAnswers ? (
                  <div className="text-center p-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-3 text-gray-600">Đang tải danh sách đáp án...</p>
                  </div>
                ) : answers.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-6 rounded-lg text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-yellow-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="font-semibold text-lg mb-2">Chưa có đáp án nào</p>
                    <p className="text-sm">Hãy thêm đáp án để hoàn thiện câu hỏi!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {answers.map((answer) => (
                      <div 
                        key={answer.id} 
                        className={`p-4 rounded-lg border ${answer.isCorrect ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'} shadow-sm`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-grow">
                            <div className="flex items-center mb-2">
                              {answer.isCorrect ? (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Đáp án đúng
                                </span>
                              ) : (
                                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Đáp án sai
                                </span>
                              )}
                            </div>
                            <p className="text-gray-800">{answer.answerText}</p>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            <button 
                              onClick={() => handleEditAnswer(answer)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Sửa đáp án"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => confirmDeleteAnswer(answer.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Xóa đáp án"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Modal tạo/sửa quiz */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {quiz ? 'Chỉnh sửa Quiz' : 'Tạo Quiz mới'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block mb-2 text-gray-700">Thời gian làm bài (phút) *</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500 transition-all"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({...formData, durationMinutes: e.target.value})}
                    min="1"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2 text-gray-700">Điểm đạt yêu cầu (%) *</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500 transition-all"
                    value={formData.passingPercentage}
                    onChange={(e) => setFormData({...formData, passingPercentage: e.target.value})}
                    min="0"
                    max="100"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center p-3 border rounded-lg bg-gray-50">
                    <input
                      type="checkbox"
                      id="shuffleQuestions"
                      checked={formData.shuffleQuestions}
                      onChange={(e) => setFormData({...formData, shuffleQuestions: e.target.checked})}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="shuffleQuestions" className="ml-2 text-gray-700">Xáo trộn câu hỏi</label>
                  </div>
                  
                  <div className="flex items-center p-3 border rounded-lg bg-gray-50">
                    <input
                      type="checkbox"
                      id="shuffleAnswers"
                      checked={formData.shuffleAnswers}
                      onChange={(e) => setFormData({...formData, shuffleAnswers: e.target.checked})}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="shuffleAnswers" className="ml-2 text-gray-700">Xáo trộn đáp án</label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg transition-colors"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {quiz ? 'Cập nhật' : 'Tạo Quiz'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal tạo/sửa câu hỏi */}
        {showQuestionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
              </h2>
              
              <form onSubmit={handleSubmitQuestion}>
                <div className="mb-4">
                  <label className="block mb-2 text-gray-700">Nội dung câu hỏi *</label>
                  <textarea
                    name="questionText"
                    value={questionFormData.questionText}
                    onChange={handleQuestionInputChange}
                    className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500 transition-all"
                    rows="3"
                    required
                    placeholder="Nhập nội dung câu hỏi..."
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2 text-gray-700">Giải thích (tùy chọn)</label>
                  <textarea
                    name="explanation"
                    value={questionFormData.explanation}
                    onChange={handleQuestionInputChange}
                    className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500 transition-all"
                    rows="2"
                    placeholder="Giải thích đáp án đúng..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block mb-2 text-gray-700">Vị trí *</label>
                    <input
                      type="number"
                      name="position"
                      value={questionFormData.position}
                      onChange={handleQuestionInputChange}
                      className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500 transition-all"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-gray-700">Loại câu hỏi *</label>
                    <select
                      name="questionType"
                      value={questionFormData.questionType}
                      onChange={handleQuestionInputChange}
                      className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500 transition-all bg-white"
                      required
                    >
                      <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                      <option value="TRUE_FALSE">Đúng/Sai</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg transition-colors"
                    onClick={() => setShowQuestionModal(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {editingQuestion ? 'Cập nhật' : 'Tạo câu hỏi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Modal tạo/sửa đáp án */}
        {showAnswerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {editingAnswer ? 'Chỉnh sửa đáp án' : 'Thêm đáp án mới'}
              </h2>
              
              <form onSubmit={handleSubmitAnswer}>
                <div className="mb-4">
                  <label className="block mb-2 text-gray-700">Nội dung đáp án *</label>
                  <textarea
                    name="answerText"
                    value={answerFormData.answerText}
                    onChange={handleAnswerInputChange}
                    className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200 focus:border-blue-500 transition-all"
                    rows="3"
                    required
                    placeholder="Nhập nội dung đáp án..."
                  />
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center p-3 border rounded-lg bg-gray-50">
                    <input
                      type="checkbox"
                      id="isCorrect"
                      name="isCorrect"
                      checked={answerFormData.isCorrect}
                      onChange={handleAnswerInputChange}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <label htmlFor="isCorrect" className="ml-2 text-gray-700 font-medium">
                      Đây là đáp án đúng
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg transition-colors"
                    onClick={() => setShowAnswerModal(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {editingAnswer ? 'Cập nhật' : 'Tạo đáp án'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
