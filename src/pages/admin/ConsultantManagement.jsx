import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import { FiEdit, FiUserPlus, FiSearch, FiFilter } from 'react-icons/fi'; // Loại bỏ FiToggleRight
import { toast } from 'react-toastify';

function ConsultantManagement() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/consultant-management' } });
      return;
    }
    if (!user?.permissions?.includes('MANAGE_CONSULTANTS') && user?.role !== 'Admin') {
      navigate('/access-denied');
      return;
    }

    const fetchConsultants = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/consultants', { withCredentials: true });
        if (Array.isArray(response.data)) {
          setConsultants(response.data);
        } else {
          throw new Error('Dữ liệu trả về không phải là mảng.');
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Không thể tải danh sách tư vấn viên.';
        setError(errorMsg);
        console.error('Fetch consultants error:', err);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (location.state?.refresh) {
      fetchConsultants();
      window.history.replaceState({}, document.title);
    } else {
      fetchConsultants();
    }
  }, [isAuthenticated, user, navigate, location.state]);

  const handleEdit = (consultant) => {
    navigate(`/admin/edit-consultant/${consultant.consultantId}`, { state: { consultant } });
  };

  const handleAddConsultant = () => {
    navigate('/admin/create-consultant');
  };

  const filteredConsultants = consultants.filter(c => {
    const matchesSearch = searchTerm === '' ||
      c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || 
      (statusFilter === 'active' && c.isActive) || 
      (statusFilter === 'inactive' && !c.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="pt-24 pb-12 px-4">
      <div className="bg-white rounded-xl shadow-lg max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-extrabold text-blue-800">Quản lý tư vấn viên</h1>
          {user?.permissions?.includes('MANAGE_CONSULTANTS') && (
            <button
              onClick={handleAddConsultant}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
            >
              <FiUserPlus className="w-5 h-5" />
              Tạo tư vấn viên mới
            </button>
          )}
        </div>
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="relative flex-grow">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <FiFilter className="mr-2 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        ) : filteredConsultants.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-500 text-lg">Không tìm thấy tư vấn viên nào phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-blue-100 text-blue-800">
                  <th className="p-3 text-left font-semibold">Họ tên</th>
                  <th className="p-3 text-left font-semibold">Email</th>
                  <th className="p-3 text-left font-semibold">Trình độ</th>
                  <th className="p-3 text-left font-semibold">Kinh nghiệm</th>
                  <th className="p-3 text-left font-semibold">Trạng thái</th>
                  <th className="p-3 text-center font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredConsultants.map((c) => (
                  <tr key={c.consultantId} className="border-b hover:bg-blue-50">
                    <td className="p-3">{c.fullName || 'Chưa cập nhật'}</td>
                    <td className="p-3">{c.email}</td>
                    <td className="p-3">{c.qualification || 'Chưa cập nhật'}</td>
                    <td className="p-3">{c.experienceYears ? `${c.experienceYears} năm` : 'Chưa cập nhật'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {c.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="p-3 text-center space-x-2">
                      {user?.permissions?.includes('MANAGE_CONSULTANTS') && (
                        <button
                          onClick={() => handleEdit(c)}
                          className="inline-flex items-center justify-center p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          title="Sửa thông tin"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConsultantManagement;