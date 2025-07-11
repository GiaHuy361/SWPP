import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';

export default function QuestionManagement() {
  const { courseId, quizId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // State cho quản lý đáp án
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [answerFormData, setAnswerFormData] = useState({
    answerText: '',
    isCorrect: false
  });
  const [editingAnswer, setEditingAnswer] = useState(null);
  
  // Debug params
  useEffect(() => {
    console.log('🔍 QuestionManagement - Tham số:', { courseId, quizId });
    if (!courseId || !quizId) {
      console.error('❌ Thiếu tham số bắt buộc:', { courseId, quizId });
      toast.error('Thiếu tham số courseId hoặc quizId');
    }
  }, [courseId, quizId]);
  
  const [formData, setFormData] = useState({
    questionText: '',
    explanation: '',
    position: 1,
    questionType: 'MULTIPLE_CHOICE'
  });

  // Các loại câu hỏi
  const questionTypes = [
    { value: 'MULTIPLE_CHOICE', label: 'Trả lời trắc nghiệm' },
    { value: 'MULTIPLE_SELECT', label: 'Nhiều lựa chọn' },
    { value: 'TRUE_FALSE', label: 'Đúng/Sai' },
    { value: 'SHORT_ANSWER', label: 'Câu trả lời ngắn' },
    { value: 'ESSAY', label: 'Tự luận' }
  ];

  useEffect(() => {
    if (courseId && quizId) {
      fetchQuestions();
      fetchQuizInfo();
      fetchCourseInfo();
    }
  }, [courseId, quizId]);

  // Lấy thông tin khóa học
  const fetchCourseInfo = async () => {
    try {
      const response = await axios.get(`/courses/${courseId}`);
      setCourse(response.data);
      console.log('✅ Đã tải thông tin khóa học:', response.data);
    } catch (error) {
      console.error('❌ Lỗi khi tải thông tin khóa học:', error);
    }
  };

  // Lấy thông tin quiz
  const fetchQuizInfo = async () => {
    try {
      const response = await axios.get(`/courses/${courseId}/quizzes`);
      const quizzes = response.data || [];
      const currentQuiz = quizzes.find(quiz => quiz.id == quizId);
      
      if (currentQuiz) {
        setQuiz(currentQuiz);
        console.log('✅ Đã tải thông tin quiz:', currentQuiz);
      } else {
        console.warn(`❌ Không tìm thấy quiz có ID ${quizId} trong khóa học ${courseId}`);
        setQuiz({ id: quizId, title: `Quiz ${quizId}` });
      }
    } catch (error) {
      console.error('❌ Lỗi khi tải thông tin quiz:', error);
      setQuiz({ id: quizId, title: `Quiz ${quizId}` });
    }
  };

  // Lấy danh sách câu hỏi - sử dụng API endpoint chính xác
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      console.log('🔍 Đang tải câu hỏi từ URL:', `/quizzes/${quizId}/questions`);
      const response = await axios.get(`/quizzes/${quizId}/questions`);
      console.log('✅ Dữ liệu câu hỏi:', response.data);
      setQuestions(response.data || []);
    } catch (error) {
      console.error('❌ Lỗi khi tải câu hỏi:', error);
      console.error('❌ Phản hồi lỗi:', error.response?.data);
      
      if (error.response?.status === 404) {
        toast.error('Không tìm thấy câu hỏi cho quiz này');
      } else {
        toast.error('Không thể tải danh sách câu hỏi');
      }
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách đáp án cho câu hỏi
  const fetchAnswers = async (questionId) => {
    try {
      console.log('🔍 Đang tải đáp án từ URL:', `/questions/${questionId}/answers`);
      const response = await axios.get(`/questions/${questionId}/answers`);
      console.log('✅ Dữ liệu đáp án:', response.data);
      setAnswers(response.data || []);
    } catch (error) {
      console.error('❌ Lỗi khi tải đáp án:', error);
      setAnswers([]);
      toast.error('Không thể tải danh sách đáp án');
    }
  };

  // Tạo hoặc cập nhật câu hỏi
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const questionData = {
        questionText: formData.questionText,
        explanation: formData.explanation,
        position: parseInt(formData.position),
        questionType: formData.questionType
      };

      console.log('🔍 Đang gửi dữ liệu câu hỏi:', questionData);

      if (editingQuestion) {
        const url = `/quizzes/${quizId}/questions/${editingQuestion.id}`;
        console.log('🔍 Đang cập nhật câu hỏi tại URL:', url);
        await axios.put(url, questionData);
        toast.success('Cập nhật câu hỏi thành công');
      } else {
        const url = `/quizzes/${quizId}/questions`;
        console.log('🔍 Đang tạo câu hỏi tại URL:', url);
        await axios.post(url, questionData);
        toast.success('Tạo câu hỏi thành công');
      }

      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error('❌ Lỗi khi lưu câu hỏi:', error);
      console.error('❌ Phản hồi lỗi:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Có lỗi khi lưu câu hỏi';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Xóa câu hỏi
  const handleDelete = async (questionId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;
    
    setActionLoading(true);
    try {
      const url = `/quizzes/${quizId}/questions/${questionId}`;
      console.log('🔍 Đang xóa câu hỏi tại URL:', url);
      await axios.delete(url);
      toast.success('Xóa câu hỏi thành công');
      fetchQuestions();
    } catch (error) {
      console.error('❌ Lỗi khi xóa câu hỏi:', error);
      console.error('❌ Phản hồi lỗi:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Không thể xóa câu hỏi';
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  // Tạo hoặc cập nhật đáp án
  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (submitting || !selectedQuestion) return;
    setSubmitting(true);

    try {
      const answerData = {
        answerText: answerFormData.answerText,
        isCorrect: answerFormData.isCorrect
      };

      console.log('🔍 Đang gửi dữ liệu đáp án:', answerData);

      if (editingAnswer) {
        const url = `/questions/${selectedQuestion.id}/answers/${editingAnswer.id}`;
        console.log('🔍 Đang cập nhật đáp án tại URL:', url);
        await axios.put(url, answerData);
        toast.success('Cập nhật đáp án thành công');
      } else {
        const url = `/questions/${selectedQuestion.id}/answers`;
        console.log('🔍 Đang tạo đáp án tại URL:', url);
        await axios.post(url, answerData);
        toast.success('Tạo đáp án thành công');
      }

      resetAnswerForm();
      fetchAnswers(selectedQuestion.id);
    } catch (error) {
      console.error('❌ Lỗi khi lưu đáp án:', error);
      const errorMsg = error.response?.data?.message || 'Có lỗi khi lưu đáp án';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Xóa đáp án
  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đáp án này?')) return;
    
    try {
      const url = `/questions/${selectedQuestion.id}/answers/${answerId}`;
      console.log('🔍 Đang xóa đáp án tại URL:', url);
      await axios.delete(url);
      toast.success('Xóa đáp án thành công');
      fetchAnswers(selectedQuestion.id);
    } catch (error) {
      console.error('❌ Lỗi khi xóa đáp án:', error);
      const errorMsg = error.response?.data?.message || 'Không thể xóa đáp án';
      toast.error(errorMsg);
    }
  };

  // Reset form câu hỏi
  const resetForm = () => {
    setFormData({
      questionText: '',
      explanation: '',
      position: 1,
      questionType: 'MULTIPLE_CHOICE'
    });
    setEditingQuestion(null);
    setShowCreateModal(false);
  };

  // Reset form đáp án
  const resetAnswerForm = () => {
    setAnswerFormData({
      answerText: '',
      isCorrect: false
    });
    setEditingAnswer(null);
  };

  // Mở modal quản lý đáp án
  const openAnswerModal = (question) => {
    setSelectedQuestion(question);
    setShowAnswerModal(true);
    fetchAnswers(question.id);
    resetAnswerForm();
  };

  // Sửa câu hỏi
  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      questionText: question.questionText,
      explanation: question.explanation || '',
      position: question.position || 1,
      questionType: question.questionType || 'MULTIPLE_CHOICE'
    });
    setShowCreateModal(true);
  };

  // Sửa đáp án
  const handleEditAnswer = (answer) => {
    setEditingAnswer(answer);
    setAnswerFormData({
      answerText: answer.answerText,
      isCorrect: answer.isCorrect
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu câu hỏi...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb Navigation */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <nav className="text-sm text-gray-600 mb-2">
            <Link to="/admin/courses" className="hover:text-blue-600">Quản lý khóa học</Link>
            <span className="mx-2">/</span>
            <Link to={`/admin/courses/${courseId}`} className="hover:text-blue-600">
              {course?.title || 'Khóa học'}
            </Link>
            <span className="mx-2">/</span>
            <Link to={`/admin/courses/${courseId}/quizzes`} className="hover:text-blue-600">
              Quản lý Quiz
            </Link>
            <span className="mx-2">/</span>
            <span>Câu hỏi - {quiz?.title || `Quiz ${quizId}`}</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý câu hỏi Quiz
          </h1>
          <p className="text-gray-600 mt-1">
            Quiz: {quiz?.title || `Quiz ${quizId}`} | Khóa học: {course?.title || `Khóa học ${courseId}`}
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/admin/courses/${courseId}/quizzes`}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium"
          >
            ← Quay lại Quiz
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            + Thêm câu hỏi
          </button>
        </div>
      </div>

      {/* Quiz Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Khóa học</h3>
            <p className="text-gray-600">{course?.title || 'Đang tải...'}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Quiz</h3>
            <p className="text-gray-600">{quiz?.title || `Quiz ${quizId}`}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Thời gian</h3>
            <p className="text-gray-600">{quiz?.durationMinutes || 30} phút</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Tổng câu hỏi</h3>
            <p className="text-gray-600">{questions.length} câu</p>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-lg shadow-md">
        {questions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-6xl mb-4">❓</div>
            <h3 className="text-lg font-medium mb-2">Chưa có câu hỏi nào</h3>
            <p className="mb-4">Hãy thêm câu hỏi đầu tiên cho quiz này</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Thêm câu hỏi
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {questions.map((question, index) => (
              <div key={question.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Câu {index + 1}
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded">
                        {questionTypes.find(t => t.value === question.questionType)?.label || question.questionType}
                      </span>
                      <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded">
                        Vị trí: {question.position}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {question.questionText}
                    </h3>
                    
                    {question.explanation && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-blue-800">Giải thích:</span>
                        <p className="text-sm text-blue-700 mt-1">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => openAnswerModal(question)}
                      className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded text-sm font-medium"
                    >
                      Đáp án
                    </button>
                    
                    <button
                      onClick={() => handleEdit(question)}
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded text-sm font-medium"
                    >
                      Sửa
                    </button>
                    
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded text-sm font-medium"
                      disabled={actionLoading}
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

      {/* Modal Tạo/Sửa Câu hỏi */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung câu hỏi *
                </label>
                <textarea
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="Nhập nội dung câu hỏi..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại câu hỏi *
                  </label>
                  <select
                    value={formData.questionType}
                    onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {questionTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vị trí
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giải thích (tùy chọn)
                </label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Giải thích đáp án hoặc gợi ý..."
                />
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
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : (editingQuestion ? 'Cập nhật' : 'Tạo câu hỏi')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Quản lý Đáp án */}
      {showAnswerModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                Quản lý đáp án - {selectedQuestion.questionText.substring(0, 50)}...
              </h2>
              <button
                onClick={() => setShowAnswerModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Form thêm đáp án */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingAnswer ? 'Chỉnh sửa đáp án' : 'Thêm đáp án mới'}
                </h3>
                <form onSubmit={handleAnswerSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nội dung đáp án *
                    </label>
                    <textarea
                      value={answerFormData.answerText}
                      onChange={(e) => setAnswerFormData({ ...answerFormData, answerText: e.target.value })}
                      rows="2"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      placeholder="Nhập nội dung đáp án..."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isCorrect"
                      checked={answerFormData.isCorrect}
                      onChange={(e) => setAnswerFormData({ ...answerFormData, isCorrect: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="isCorrect" className="ml-2 text-sm text-gray-700">
                      Đây là đáp án đúng
                    </label>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                    >
                      {submitting ? 'Đang lưu...' : (editingAnswer ? 'Cập nhật' : 'Thêm đáp án')}
                    </button>
                    {editingAnswer && (
                      <button
                        type="button"
                        onClick={resetAnswerForm}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium"
                      >
                        Hủy sửa
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Danh sách đáp án */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Danh sách đáp án ({answers.length})
                </h3>
                {answers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Chưa có đáp án nào</p>
                ) : (
                  <div className="space-y-3">
                    {answers.map((answer, index) => (
                      <div key={answer.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                                Đáp án {index + 1}
                              </span>
                              {answer.isCorrect && (
                                <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
                                  ✓ Đúng
                                </span>
                              )}
                            </div>
                            <p className="text-gray-900">{answer.answerText}</p>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleEditAnswer(answer)}
                              className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded text-sm font-medium"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteAnswer(answer.id)}
                              className="bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded text-sm font-medium"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}