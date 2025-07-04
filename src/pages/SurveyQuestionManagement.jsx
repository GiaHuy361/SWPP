import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { getAllSurveyQuestions, createSurveyQuestion, updateSurveyQuestion, deleteSurveyQuestion, getAllSurveys } from '../services/surveyService';
import { motion } from 'framer-motion';

function SurveyQuestionManagement() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    surveyId: '',
    questionText: '',
    questionType: 'MULTIPLE_CHOICE',
    correctAnswer: '',
    options: [{ optionText: '', score: 0 }]
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.permissions?.includes('MANAGE_SURVEYS')) {
      navigate('/access-denied');
    } else {
      fetchData();
    }
  }, [isAuthenticated, user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [questionRes, surveyRes] = await Promise.all([getAllSurveyQuestions(), getAllSurveys()]);
      setQuestions(questionRes.data || []);
      setSurveys(surveyRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách câu hỏi');
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };
    // Nếu thay đổi questionType, điều chỉnh options
    if (name === 'questionType') {
      if (value === 'TRUE_FALSE') {
        newFormData.options = [
          { optionText: 'Có', score: 1 },
          { optionText: 'Không', score: 0 }
        ];
        newFormData.correctAnswer = 'Không';
      } else if (value === 'TEXT') {
        newFormData.options = [];
        newFormData.correctAnswer = '';
      } else {
        newFormData.options = [{ optionText: '', score: 0 }];
      }
    }
    setFormData(newFormData);
  };

  const handleOptionChange = (index, e) => {
    const { name, value } = e.target;
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [name]: name === 'optionText' ? value : Number(value) };
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, { optionText: '', score: 0 }] });
  };

  const removeOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const questionData = {
        surveyId: Number(formData.surveyId),
        questionText: formData.questionText,
        questionType: formData.questionType,
        correctAnswer: formData.correctAnswer,
        options: formData.options // Không gửi trường id để tránh detached entity
      };
      if (editId) {
        await updateSurveyQuestion(editId, questionData);
        toast.success('Cập nhật câu hỏi thành công');
      } else {
        await createSurveyQuestion(questionData);
        toast.success('Tạo câu hỏi thành công');
      }
      setShowForm(false);
      setFormData({
        surveyId: '',
        questionText: '',
        questionType: 'MULTIPLE_CHOICE',
        correctAnswer: '',
        options: [{ optionText: '', score: 0 }]
      });
      setEditId(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu câu hỏi');
    }
  };

  const handleEdit = (question) => {
    setShowForm(true);
    setFormData({
      surveyId: question.surveyId,
      questionText: question.questionText,
      questionType: question.questionType,
      correctAnswer: question.correctAnswer,
      options: question.options || [{ optionText: '', score: 0 }]
    });
    setEditId(question.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;
    try {
      await deleteSurveyQuestion(id);
      toast.success('Xóa câu hỏi thành công');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa câu hỏi');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 mt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto bg-red-50 text-red-700 p-6 rounded-xl shadow-lg">
          <p>{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Quản lý câu hỏi khảo sát</h1>
        <button
          onClick={() => { setShowForm(true); setFormData({
            surveyId: '',
            questionText: '',
            questionType: 'MULTIPLE_CHOICE',
            correctAnswer: '',
            options: [{ optionText: '', score: 0 }]
          }); setEditId(null); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-6"
        >
          Thêm câu hỏi
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-xl shadow">
            <h2 className="text-2xl font-semibold mb-4">{editId ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}</h2>
            <div className="mb-4">
              <label className="block text-gray-700">Khảo sát</label>
              <select
                name="surveyId"
                value={formData.surveyId || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Chọn khảo sát</option>
                {surveys.map(survey => (
                  <option key={survey.id} value={survey.id}>{survey.title}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Nội dung câu hỏi</label>
              <input
                type="text"
                name="questionText"
                value={formData.questionText || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Bạn có sử dụng chất kích thích trong 30 ngày qua?"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Loại câu hỏi</label>
              <select
                name="questionType"
                value={formData.questionType || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Chọn loại câu hỏi</option>
                <option value="TRUE_FALSE">Đúng/Sai</option>
                <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                <option value="CHECKBOX_MULTIPLE">Chọn nhiều</option>
                <option value="TEXT">Văn bản</option>
              </select>
            </div>
            {formData.questionType !== 'TEXT' && (
              <div className="mb-4">
                <label className="block text-gray-700">Đáp án đúng</label>
                <select
                  name="correctAnswer"
                  value={formData.correctAnswer || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  disabled={formData.options.length === 0}
                >
                  <option value="">Chọn đáp án đúng</option>
                  {formData.options.map((option, index) => (
                    <option key={index} value={option.optionText}>
                      {option.optionText} (Điểm: {option.score})
                    </option>
                  ))}
                </select>
              </div>
            )}
            {formData.questionType !== 'TEXT' && (
              <div className="mb-4">
                <label className="block text-gray-700">Tùy chọn</label>
                {formData.options.map((option, index) => (
                  <div key={index} className="mb-2 flex gap-2 items-center">
                    <input
                      type="text"
                      name="optionText"
                      value={option.optionText || ''}
                      onChange={(e) => handleOptionChange(index, e)}
                      className="w-1/2 p-2 border rounded"
                      placeholder={`Tùy chọn ${index + 1}`}
                      required
                      disabled={formData.questionType === 'TRUE_FALSE'}
                    />
                    <input
                      type="number"
                      name="score"
                      value={option.score || 0}
                      onChange={(e) => handleOptionChange(index, e)}
                      className="w-1/4 p-2 border rounded"
                      placeholder="Điểm"
                      required
                      disabled={formData.questionType === 'TRUE_FALSE'}
                    />
                    {formData.questionType !== 'TRUE_FALSE' && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                ))}
                {formData.questionType !== 'TRUE_FALSE' && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 mt-2"
                  >
                    Thêm tùy chọn
                  </button>
                )}
              </div>
            )}
            <div className="flex gap-4">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                {editId ? 'Cập nhật' : 'Tạo mới'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormData({
                  surveyId: '',
                  questionText: '',
                  questionType: 'MULTIPLE_CHOICE',
                  correctAnswer: '',
                  options: [{ optionText: '', score: 0 }]
                }); setEditId(null); }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Khảo sát</th>
                <th className="p-4 text-left">Nội dung câu hỏi</th>
                <th className="p-4 text-left">Loại câu hỏi</th>
                <th className="p-4 text-left">Đáp án đúng</th>
                <th className="p-4 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {questions.map(question => (
                <tr key={question.id} className="border-b">
                  <td className="p-4">{question.id}</td>
                  <td className="p-4">{surveys.find(s => s.id === question.surveyId)?.title || 'Không xác định'}</td>
                  <td className="p-4">{question.questionText}</td>
                  <td className="p-4">{question.questionType}</td>
                  <td className="p-4">{question.correctAnswer || 'Không có'}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleEdit(question)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

export default SurveyQuestionManagement;