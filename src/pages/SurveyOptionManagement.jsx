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
  const [options, setOptions] = useState([]);
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

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: field === 'optionText' ? value : Number(value)
    };
    setOptions(updatedOptions);
  };
  
  const addOption = () => {
    setOptions([...options, { optionText: '', score: 0, min: 0, max: 10, core: 5 }]);
  };
  
  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const questionData = {
        ...selectedQuestion,
        options: options
      };
      await updateSurveyQuestion(selectedQuestion.id, questionData);
      toast.success('Cập nhật tùy chọn thành công');
      setShowForm(false);
      setOptions([]);
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
    setOptions(question.options || []);
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Tùy chọn</h3>
                <button 
                  type="button"
                  onClick={addOption} 
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Thêm tùy chọn
                </button>
              </div>

              {options.map((option, index) => (
                <div key={index} className="mb-4 p-4 border rounded-lg bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Tùy chọn #{index + 1}</h4>
                    <button 
                      type="button" 
                      onClick={() => removeOption(index)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-1">Nội dung</label>
                      <input
                        type="text"
                        value={option.optionText || ''}
                        onChange={(e) => handleOptionChange(index, 'optionText', e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Nội dung tùy chọn"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Điểm số</label>
                      <input
                        type="number"
                        value={option.score || 0}
                        onChange={(e) => handleOptionChange(index, 'score', e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Điểm số"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div>
                      <label className="block text-gray-700 mb-1">Giá trị tối thiểu</label>
                      <input
                        type="number"
                        value={option.min || 0}
                        onChange={(e) => handleOptionChange(index, 'min', e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Tối thiểu"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Giá trị tối đa</label>
                      <input
                        type="number"
                        value={option.max || 10}
                        onChange={(e) => handleOptionChange(index, 'max', e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Tối đa"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Giá trị cốt lõi</label>
                      <input
                        type="number"
                        value={option.core || 5}
                        onChange={(e) => handleOptionChange(index, 'core', e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Cốt lõi"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {options.length === 0 && (
                <div className="text-center p-4 bg-gray-100 rounded-lg">
                  <p>Chưa có tùy chọn nào. Nhấn "Thêm tùy chọn" để bắt đầu.</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-4">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Cập nhật
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setOptions([]); setEditId(null); setSelectedQuestion(null); }}
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