import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';

export default function AnswerManagement() {
  const { questionId } = useParams();
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    answerText: '',
    isCorrect: false
  });

  useEffect(() => {
    fetchAnswers();
  }, [questionId]);

  // Bỏ tiền tố /api trong các lời gọi API
  const fetchAnswers = async () => {
    setLoading(true);
    try {
      // Bỏ tiền tố /api
      const response = await axios.get(`/questions/${questionId}/answers`);
      console.log('Dữ liệu đáp án:', response.data);
      setAnswers(response.data || []);
    } catch (error) {
      console.error('Lỗi khi tải đáp án:', error);
      toast.error('Không thể tải danh sách đáp án');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const answerData = {
        answerText: formData.answerText,
        isCorrect: formData.isCorrect
      };

      if (editingAnswer) {
        // Bỏ tiền tố /api
        await axios.put(`/questions/${questionId}/answers/${editingAnswer.id}`, answerData);
        toast.success('Cập nhật đáp án thành công');
      } else {
        // Bỏ tiền tố /api
        await axios.post(`/questions/${questionId}/answers`, answerData);
        toast.success('Tạo đáp án thành công');
      }

      resetForm();
      fetchAnswers();
    } catch (error) {
      console.error('Lỗi khi lưu đáp án:', error);
      toast.error(error.response?.data?.message || 'Có lỗi khi lưu đáp án');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (answerId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đáp án này?')) return;
    
    try {
      // Bỏ tiền tố /api
      await axios.delete(`/questions/${questionId}/answers/${answerId}`);
      toast.success('Xóa đáp án thành công');
      fetchAnswers();
    } catch (error) {
      console.error('Lỗi khi xóa đáp án:', error);
      toast.error('Không thể xóa đáp án');
    }
  };

  const resetForm = () => {
    setFormData({
      answerText: '',
      isCorrect: false
    });
    setEditingAnswer(null);
    setShowCreateModal(false);
  };

  // UI component (giữ nguyên phần UI)
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý đáp án</h1>
        <button onClick={() => window.history.back()} className="text-blue-500 hover:underline">
          ← Quay lại
        </button>
      </div>
      
      <button 
        className="bg-blue-500 text-white px-4 py-2 rounded mb-6"
        onClick={() => setShowCreateModal(true)}
      >
        + Thêm đáp án
      </button>

      {loading ? (
        <div className="text-center py-4">Đang tải...</div>
      ) : answers.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-center">
          <p className="text-lg mb-2">Chưa có đáp án nào cho câu hỏi này</p>
          <p>Hãy thêm đáp án đầu tiên bằng cách nhấn nút "Thêm đáp án"</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đáp án</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đáp án đúng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {answers.map((answer) => (
                <tr key={answer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-md">{answer.answerText}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {answer.isCorrect ? (
                      <span className="text-green-600 font-medium">✓ Đúng</span>
                    ) : (
                      <span className="text-gray-500">✗ Sai</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                      onClick={() => {
                        setFormData({
                          answerText: answer.answerText,
                          isCorrect: answer.isCorrect
                        });
                        setEditingAnswer(answer);
                        setShowCreateModal(true);
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      onClick={() => handleDelete(answer.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              {editingAnswer ? 'Chỉnh sửa đáp án' : 'Thêm đáp án mới'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Nội dung đáp án *
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  rows={3}
                  value={formData.answerText}
                  onChange={(e) => setFormData({...formData, answerText: e.target.value})}
                  required
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isCorrect}
                    onChange={(e) => setFormData({...formData, isCorrect: e.target.checked})}
                    className="mr-2"
                  />
                  <span>Đây là đáp án đúng</span>
                </label>
              </div>

              <div className="flex items-center justify-end mt-6">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
                  onClick={resetForm}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  disabled={submitting}
                >
                  {submitting ? 'Đang xử lý...' : editingAnswer ? 'Cập nhật' : 'Thêm đáp án'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}