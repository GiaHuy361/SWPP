import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { Modal } from '../../components/ui/Modal';

export default function QuizManagement() {
  const { courseId, moduleId, lessonId } = useParams();
  const [course, setCourse] = useState(null);
  const [module, setModule] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimit: '',
    passingScore: 70,
    maxAttempts: 3,
    isRequired: true,
    showResultsImmediately: true
  });

  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    questionType: 'MULTIPLE_CHOICE',
    options: ['', '', '', ''],
    correctAnswers: [0],
    explanation: '',
    points: 1
  });

  const questionTypes = [
    { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm (1 đáp án)' },
    { value: 'MULTIPLE_SELECT', label: 'Trắc nghiệm (nhiều đáp án)' },
    { value: 'TRUE_FALSE', label: 'Đúng/Sai' },
    { value: 'SHORT_ANSWER', label: 'Câu trả lời ngắn' }
  ];

  useEffect(() => {
    fetchData();
  }, [courseId, moduleId, lessonId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseResponse, moduleResponse, lessonResponse, quizzesResponse] = await Promise.all([
        axios.get(`/courses/${courseId}`),
        axios.get(`/modules/${moduleId}`),
        axios.get(`/lessons/${lessonId}`),
        axios.get(`/lessons/${lessonId}/quizzes`)
      ]);
      
      setCourse(courseResponse.data);
      setModule(moduleResponse.data);
      setLesson(lessonResponse.data);
      setQuizzes(quizzesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Có lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (quizId) => {
    try {
      const response = await axios.get(`/quizzes/${quizId}/questions`);
      setQuestions(response.data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Có lỗi khi tải câu hỏi');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const quizData = {
        ...formData,
        lessonId: parseInt(lessonId),
        timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : null,
        passingScore: parseInt(formData.passingScore),
        maxAttempts: parseInt(formData.maxAttempts)
      };

      if (editingQuiz) {
        await axios.put(`/quizzes/${editingQuiz.id}`, quizData);
        toast.success('Cập nhật quiz thành công');
      } else {
        await axios.post('/quizzes', quizData);
        toast.success('Tạo quiz thành công');
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error(editingQuiz ? 'Có lỗi khi cập nhật quiz' : 'Có lỗi khi tạo quiz');
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      const questionData = {
        ...questionForm,
        quizId: selectedQuiz.id,
        points: parseInt(questionForm.points)
      };

      // Process options and correct answers based on question type
      if (questionForm.questionType === 'TRUE_FALSE') {
        questionData.options = ['Đúng', 'Sai'];
      } else if (questionForm.questionType === 'SHORT_ANSWER') {
        questionData.options = [];
      }

      await axios.post('/quiz-questions', questionData);
      toast.success('Thêm câu hỏi thành công');
      
      // Reset question form
      setQuestionForm({
        questionText: '',
        questionType: 'MULTIPLE_CHOICE',
        options: ['', '', '', ''],
        correctAnswers: [0],
        explanation: '',
        points: 1
      });
      
      fetchQuestions(selectedQuiz.id);
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Có lỗi khi thêm câu hỏi');
    }
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description || '',
      timeLimit: quiz.timeLimit || '',
      passingScore: quiz.passingScore || 70,
      maxAttempts: quiz.maxAttempts || 3,
      isRequired: quiz.isRequired !== false,
      showResultsImmediately: quiz.showResultsImmediately !== false
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (quizId) => {
    try {
      await axios.delete(`/quizzes/${quizId}`);
      toast.success('Xóa quiz thành công');
      fetchData();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Có lỗi khi xóa quiz');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await axios.delete(`/quiz-questions/${questionId}`);
      toast.success('Xóa câu hỏi thành công');
      fetchQuestions(selectedQuiz.id);
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Có lỗi khi xóa câu hỏi');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      timeLimit: '',
      passingScore: 70,
      maxAttempts: 3,
      isRequired: true,
      showResultsImmediately: true
    });
    setEditingQuiz(null);
    setShowCreateModal(false);
  };

  const openQuestionsModal = (quiz) => {
    setSelectedQuiz(quiz);
    setShowQuestionsModal(true);
    fetchQuestions(quiz.id);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const handleCorrectAnswerToggle = (index) => {
    const newCorrectAnswers = questionForm.questionType === 'MULTIPLE_CHOICE' 
      ? [index] 
      : questionForm.correctAnswers.includes(index)
        ? questionForm.correctAnswers.filter(i => i !== index)
        : [...questionForm.correctAnswers, index];
    
    setQuestionForm({ ...questionForm, correctAnswers: newCorrectAnswers });
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
            <Link to={`/admin/courses/${courseId}/modules`} className="hover:text-blue-600">
              Quản lý Module
            </Link>
            <span className="mx-2">/</span>
            <Link to={`/admin/courses/${courseId}/modules/${moduleId}/lessons`} className="hover:text-blue-600">
              Bài học
            </Link>
            <span className="mx-2">/</span>
            <span>Quiz</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý Quiz - {lesson?.title}
          </h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Thêm Quiz
        </button>
      </div>

      {/* Lesson Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{lesson?.title}</h2>
            <p className="text-gray-600 mb-2">Module: {module?.title}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Loại: {lesson?.contentType}</span>
              {lesson?.duration && <span>Thời lượng: {lesson.duration} phút</span>}
              <span>Tổng số quiz: {quizzes.length}</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              lesson?.isRequired 
                ? 'bg-red-100 text-red-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {lesson?.isRequired ? 'Bắt buộc' : 'Tùy chọn'}
            </span>
          </div>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="bg-white rounded-lg shadow-md">
        {quizzes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">Chưa có quiz nào</h3>
            <p className="mb-4">Hãy thêm quiz đầu tiên cho bài học này</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Thêm Quiz
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Quiz
                      </span>
                      {quiz.isRequired && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Bắt buộc
                        </span>
                      )}
                      {quiz.timeLimit && (
                        <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {quiz.timeLimit} phút
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {quiz.title}
                    </h3>
                    
                    {quiz.description && (
                      <p className="text-gray-600 mb-3">{quiz.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span>Điểm qua: {quiz.passingScore}%</span>
                      <span>Số lần thử: {quiz.maxAttempts}</span>
                      <span>Câu hỏi: {quiz.questionCount || 0}</span>
                      {quiz.showResultsImmediately && (
                        <span>✓ Hiện kết quả ngay</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => openQuestionsModal(quiz)}
                      className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded text-sm font-medium"
                    >
                      Câu hỏi ({quiz.questionCount || 0})
                    </button>
                    
                    <button
                      onClick={() => handleEdit(quiz)}
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded text-sm font-medium"
                    >
                      Sửa
                    </button>
                    
                    <button
                      onClick={() => setDeleteConfirm(quiz)}
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

      {/* Create/Edit Quiz Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={resetForm}
          title={editingQuiz ? 'Chỉnh sửa Quiz' : 'Thêm Quiz Mới'}
          size="large"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề Quiz *
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
                placeholder="Mô tả về quiz này..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian (phút)
                </label>
                <input
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Không giới hạn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Điểm qua (%)
                </label>
                <input
                  type="number"
                  value={formData.passingScore}
                  onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                  min="0"
                  max="100"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lần thử tối đa
                </label>
                <input
                  type="number"
                  value={formData.maxAttempts}
                  onChange={(e) => setFormData({ ...formData, maxAttempts: e.target.value })}
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={formData.isRequired}
                  onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isRequired" className="ml-2 block text-sm text-gray-900">
                  Quiz bắt buộc
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showResults"
                  checked={formData.showResultsImmediately}
                  onChange={(e) => setFormData({ ...formData, showResultsImmediately: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showResults" className="ml-2 block text-sm text-gray-900">
                  Hiện kết quả ngay
                </label>
              </div>
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
                {editingQuiz ? 'Cập nhật' : 'Tạo Quiz'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Questions Management Modal */}
      {showQuestionsModal && selectedQuiz && (
        <Modal
          isOpen={showQuestionsModal}
          onClose={() => {
            setShowQuestionsModal(false);
            setSelectedQuiz(null);
            setQuestions([]);
          }}
          title={`Quản lý câu hỏi - ${selectedQuiz.title}`}
          size="extra-large"
        >
          <div className="space-y-6">
            {/* Add Question Form */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm câu hỏi mới</h3>
              <form onSubmit={handleQuestionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Câu hỏi *
                  </label>
                  <textarea
                    value={questionForm.questionText}
                    onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại câu hỏi
                    </label>
                    <select
                      value={questionForm.questionType}
                      onChange={(e) => setQuestionForm({ 
                        ...questionForm, 
                        questionType: e.target.value,
                        options: e.target.value === 'TRUE_FALSE' ? ['Đúng', 'Sai'] : ['', '', '', ''],
                        correctAnswers: [0]
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      Điểm số
                    </label>
                    <input
                      type="number"
                      value={questionForm.points}
                      onChange={(e) => setQuestionForm({ ...questionForm, points: e.target.value })}
                      min="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Options for multiple choice/select */}
                {(questionForm.questionType === 'MULTIPLE_CHOICE' || questionForm.questionType === 'MULTIPLE_SELECT') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Các lựa chọn
                    </label>
                    {questionForm.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type={questionForm.questionType === 'MULTIPLE_CHOICE' ? 'radio' : 'checkbox'}
                          name="correctAnswer"
                          checked={questionForm.correctAnswers.includes(index)}
                          onChange={() => handleCorrectAnswerToggle(index)}
                          className="h-4 w-4 text-blue-600"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Lựa chọn ${index + 1}`}
                          required
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* True/False options */}
                {questionForm.questionType === 'TRUE_FALSE' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Đáp án đúng
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="truefalse"
                          checked={questionForm.correctAnswers[0] === 0}
                          onChange={() => setQuestionForm({ ...questionForm, correctAnswers: [0] })}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Đúng</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="truefalse"
                          checked={questionForm.correctAnswers[0] === 1}
                          onChange={() => setQuestionForm({ ...questionForm, correctAnswers: [1] })}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Sai</span>
                      </label>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giải thích (tùy chọn)
                  </label>
                  <textarea
                    value={questionForm.explanation}
                    onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                    rows="2"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Giải thích đáp án..."
                  />
                </div>

                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Thêm câu hỏi
                </button>
              </form>
            </div>

            {/* Questions List */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Danh sách câu hỏi ({questions.length})
              </h3>
              {questions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Chưa có câu hỏi nào</p>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                              Câu {index + 1}
                            </span>
                            <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                              {questionTypes.find(t => t.value === question.questionType)?.label}
                            </span>
                            <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
                              {question.points} điểm
                            </span>
                          </div>
                          <p className="font-medium text-gray-900 mb-2">{question.questionText}</p>
                          
                          {question.options && question.options.length > 0 && (
                            <div className="space-y-1">
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                                    question.correctAnswers?.includes(optionIndex) 
                                      ? 'bg-green-500 text-white' 
                                      : 'bg-gray-200'
                                  }`}>
                                    {question.correctAnswers?.includes(optionIndex) ? '✓' : optionIndex + 1}
                                  </span>
                                  <span className={question.correctAnswers?.includes(optionIndex) 
                                    ? 'text-green-700 font-medium' 
                                    : 'text-gray-600'
                                  }>
                                    {option}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {question.explanation && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                              <strong>Giải thích:</strong> {question.explanation}
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded text-sm font-medium ml-4"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
              Bạn có chắc chắn muốn xóa quiz này?
            </h3>
            <p className="text-gray-600 mb-4">
              Quiz "{deleteConfirm.title}" và tất cả câu hỏi liên quan sẽ bị xóa vĩnh viễn.
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
                Xóa Quiz
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
