import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { getAllSurveyTypes, createSurveyType, updateSurveyType, deleteSurveyType } from '../services/surveyService';
import { motion } from 'framer-motion';

function SurveyTypeManagement() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
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
      fetchSurveyTypes();
    }
  }, [isAuthenticated, user, navigate]);

  const fetchSurveyTypes = async () => {
    try {
      setLoading(true);
      const response = await getAllSurveyTypes();
      setSurveyTypes(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách loại khảo sát');
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
      const typeData = {
        name: formData.name,
        description: formData.description,
        maxScore: Number(formData.maxScore),
        riskThresholds: formData.riskThresholds
      };
      if (editId) {
        await updateSurveyType(editId, typeData);
        toast.success('Cập nhật loại khảo sát thành công');
      } else {
        await createSurveyType(typeData);
        toast.success('Tạo loại khảo sát thành công');
      }
      setShowForm(false);
      setFormData({});
      setEditId(null);
      fetchSurveyTypes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu loại khảo sát');
    }
  };

  const handleEdit = (type) => {
    setShowForm(true);
    setFormData({ ...type, riskThresholds: JSON.stringify(JSON.parse(type.riskThresholds || '{}'), null, 2) });
    setEditId(type.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa loại khảo sát này?')) return;
    try {
      await deleteSurveyType(id);
      toast.success('Xóa loại khảo sát thành công');
      fetchSurveyTypes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa loại khảo sát');
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Quản lý loại khảo sát</h1>
        <button
          onClick={() => { setShowForm(true); setFormData({}); setEditId(null); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-6"
        >
          Thêm loại khảo sát
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-xl shadow">
            <h2 className="text-2xl font-semibold mb-4">{editId ? 'Sửa loại khảo sát' : 'Thêm loại khảo sát'}</h2>
            <div className="mb-4">
              <label className="block text-gray-700">Tên loại khảo sát</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
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
              <label className="block text-gray-700">Điểm tối đa</label>
              <input
                type="number"
                name="maxScore"
                value={formData.maxScore || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Ngưỡng rủi ro (JSON)</label>
              <textarea
                name="riskThresholds"
                value={formData.riskThresholds || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder='{"low":{"max":3},"moderate":{"max":26},"high":{"max":39}}'
                required
              />
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
                <th className="p-4 text-left">Tên</th>
                <th className="p-4 text-left">Mô tả</th>
                <th className="p-4 text-left">Điểm tối đa</th>
                <th className="p-4 text-left">Ngưỡng rủi ro</th>
                <th className="p-4 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {surveyTypes.map(type => (
                <tr key={type.id} className="border-b">
                  <td className="p-4">{type.id}</td>
                  <td className="p-4">{type.name}</td>
                  <td className="p-4">{type.description}</td>
                  <td className="p-4">{type.maxScore}</td>
                  <td className="p-4">{type.riskThresholds}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleEdit(type)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(type.id)}
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

export default SurveyTypeManagement;