import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { getAllSurveys, createSurvey, updateSurvey, deleteSurvey, getAllSurveyTypes } from '../services/surveyService';
import { motion } from 'framer-motion';

function SurveyListManagement() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [surveyTypes, setSurveyTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
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
      const [surveyRes, typeRes] = await Promise.all([getAllSurveys(), getAllSurveyTypes()]);
      const surveysData = surveyRes.data || [];
      const typesData = typeRes.data || [];
      setSurveys(surveysData);
      setSurveyTypes(typesData);
      console.log('Available surveyTypes:', typesData); // Debug danh sách ID hợp lệ
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách khảo sát');
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
      const surveyData = {
        title: formData.title,
        description: formData.description || '',
        surveyTypeId: Number(formData.surveyTypeId)
        // Bỏ createdAt để backend tự sinh
      };
      // Kiểm tra surveyTypeId có trong danh sách không
      if (!surveyTypes.some(type => type.id === Number(surveyData.surveyTypeId))) {
        throw new Error('Loại khảo sát không hợp lệ, vui lòng chọn từ danh sách');
      }
      console.log('Submitting survey data:', surveyData); // Debug dữ liệu gửi lên
      if (editId) {
        await updateSurvey(editId, surveyData);
        toast.success('Cập nhật khảo sát thành công');
      } else {
        await createSurvey(surveyData);
        toast.success('Tạo khảo sát thành công');
      }
      setShowForm(false);
      setFormData({});
      setEditId(null);
      fetchData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Lỗi khi lưu khảo sát';
      const errorData = err.response?.data || {};
      console.error('API Error:', errorData); // Debug lỗi chi tiết
      toast.error(`${errorMsg} - ${JSON.stringify(errorData.data || {})}`);
    }
  };

  const handleEdit = (survey) => {
    setShowForm(true);
    setFormData({ ...survey });
    setEditId(survey.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa khảo sát này?')) return;
    try {
      await deleteSurvey(id);
      toast.success('Xóa khảo sát thành công');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa khảo sát');
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Quản lý khảo sát</h1>
        <button
          onClick={() => { setShowForm(true); setFormData({}); setEditId(null); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-6"
        >
          Thêm khảo sát
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-xl shadow">
            <h2 className="text-2xl font-semibold mb-4">{editId ? 'Sửa khảo sát' : 'Thêm khảo sát'}</h2>
            <div className="mb-4">
              <label className="block text-gray-700">Tiêu đề</label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Mô tả</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Loại khảo sát</label>
              <select
                name="surveyTypeId"
                value={formData.surveyTypeId || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Chọn loại khảo sát</option>
                {surveyTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                {editId ? 'Cập nhật' : 'Tạo mới'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormData({}); setEditId(null); }}
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
                <th className="p-4 text-left">Tiêu đề</th>
                <th className="p-4 text-left">Mô tả</th>
                <th className="p-4 text-left">Loại khảo sát</th>
                <th className="p-4 text-left">Ngày tạo</th>
                <th className="p-4 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {surveys.map(survey => (
                <tr key={survey.id} className="border-b">
                  <td className="p-4">{survey.id}</td>
                  <td className="p-4">{survey.title}</td>
                  <td className="p-4">{survey.description}</td>
                  <td className="p-4">{surveyTypes.find(type => type.id === survey.surveyTypeId)?.name || 'Không xác định'}</td>
                  <td className="p-4">{new Date(survey.createdAt).toLocaleString('vi-VN')}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleEdit(survey)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(survey.id)}
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

export default SurveyListManagement;