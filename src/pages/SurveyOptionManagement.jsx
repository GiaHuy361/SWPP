import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { getAllSurveyQuestions, updateSurveyQuestion } from '../services/surveyService';
import { motion } from 'framer-motion';

function SurveyOptionManagement() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [editId, setEditId] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.permissions?.includes('MANAGE_SURVEYS')) {
      navigate('/access-denied');
    } else {
      fetchQuestions();
    }
  }, [isAuthenticated, user, navigate]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await getAllSurveyQuestions();
      setQuestions(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách câu hỏi');
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const questionData = {
        ...selectedQuestion,
        options: formData.options ? JSON.parse(formData.options) : []
      };
      await updateSurveyQuestion(selectedQuestion.id, questionData);
      toast.success('Cập nhật tùy chọn thành công');
      setShowForm(false);
      setFormData({});
      setEditId(null);
      setSelectedQuestion(null);
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu tùy chọn');
    }
  };

  const handleEdit = (question) => {
    setShowForm(true);
    setSelectedQuestion(question);
    setFormData({ options: JSON.stringify(question.options || [], null, 2) });
    setEditId(question.id);
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Quản lý tùy chọn câu hỏi</h1>

        {showForm && selectedQuestion && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-xl shadow">
            <h2 className="text-2xl font-semibold mb-4">Sửa tùy chọn cho câu hỏi: {selectedQuestion.questionText}</h2>
            <div className="mb-4">
              <label className="block text-gray-700">Tùy chọn (JSON)</label>
              <textarea
                name="options"
                value={formData.options || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder='[{"id": 1, "optionText": "Có", "score": 1}, {"id": 2, "optionText": "Không", "score": 0}]'
              />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Cập nhật
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormData({}); setEditId(null); setSelectedQuestion(null); }}
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
                <th className="p-4 text-left">ID Câu hỏi</th>
                <th className="p-4 text-left">Nội dung câu hỏi</th>
                <th className="p-4 text-left">Tùy chọn</th>
                <th className="p-4 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {questions.map(question => (
                <tr key={question.id} className="border-b">
                  <td className="p-4">{question.id}</td>
                  <td className="p-4">{question.questionText}</td>
                  <td className="p-4">{question.options?.map(opt => `${opt.optionText} (Score: ${opt.score})`).join(', ') || 'Không có'}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleEdit(question)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                    >
                      Sửa tùy chọn
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

export default SurveyOptionManagement;