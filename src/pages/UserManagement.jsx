import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { FiEdit, FiTrash2, FiUserPlus, FiSearch, FiFilter } from 'react-icons/fi';
import { toast } from 'react-toastify';

function UserManagement() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/user-management' } });
      return;
    }
    if (!user?.permissions?.includes('MANAGE_USERS')) {
      navigate('/access-denied');
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/auth/users');
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          throw new Error('Dữ liệu trả về không phải là mảng.');
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Không thể tải danh sách người dùng.';
        setError(errorMsg);
        console.error('Fetch users error:', err);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (location.state?.refresh) {
      fetchUsers();
      window.history.replaceState({}, document.title);
    } else {
      fetchUsers();
    }
  }, [isAuthenticated, user, navigate, location.state]);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa tài khoản này?')) return;
    try {
      await apiClient.delete(`/auth/users/${id}`);
      setUsers(users.filter(u => u.userId !== id));
      toast.success('Xóa người dùng thành công.');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Xóa người dùng thất bại.';
      toast.error(errorMsg);
    }
  };

  const handleEdit = (user) => {
    navigate(`/edit-user/${user.userId}`, { state: { email: user.email } });
  };

  const handleAddUser = () => {
    navigate('/create-user');
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = searchTerm === '' ||
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === '' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleLabel = (role) => {
    const roleMap = {
      Admin: 'Quản trị viên',
      Consultant: 'Tư vấn viên',
      Member: 'Thành viên',
      Guest: 'Khách',
      Staff: 'Nhân viên',
      Manager: 'Quản lý'
    };
    return roleMap[role] || role;
  };

  return (
    <div className="pt-24 pb-12 px-4">
      <div className="bg-white rounded-xl shadow-lg max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-extrabold text-blue-800">Quản lý người dùng</h1>
          {user?.permissions?.includes('MANAGE_USERS') && (
            <button
              onClick={handleAddUser}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
            >
              <FiUserPlus className="w-5 h-5" />
              Tạo người dùng mới
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
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-md"
            >
              <option value="">Tất cả vai trò</option>
              <option value="Admin">Quản trị viên</option>
              <option value="Consultant">Tư vấn viên</option>
              <option value="Member">Thành viên</option>
              <option value="Guest">Khách</option>
              <option value="Staff">Nhân viên</option>
              <option value="Manager">Quản lý</option>
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
        ) : filteredUsers.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-500 text-lg">Không tìm thấy người dùng nào phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-blue-100 text-blue-800">
                  <th className="p-3 text-left font-semibold">Họ tên</th>
                  <th className="p-3 text-left font-semibold">Email</th>
                  <th className="p-3 text-left font-semibold">Vai trò</th>
                  <th className="p-3 text-center font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.userId} className="border-b hover:bg-blue-50">
                    <td className="p-3">{u.fullName || 'Chưa cập nhật'}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        u.role === 'Admin' ? 'bg-red-100 text-red-700' :
                        u.role === 'Consultant' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'Member' ? 'bg-green-100 text-green-700' :
                        u.role === 'Staff' ? 'bg-blue-100 text-blue-700' :
                        u.role === 'Manager' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {getRoleLabel(u.role)}
                      </span>
                    </td>
                    <td className="p-3 text-center space-x-2">
                      {user?.permissions?.includes('MANAGE_USERS') && (
                        <button
                          onClick={() => handleEdit(u)}
                          className="inline-flex items-center justify-center p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          title="Sửa thông tin"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                      )}
                      {user?.permissions?.includes('MANAGE_USERS') && u.role !== 'Admin' && (
                        <button
                          onClick={() => handleDelete(u.userId)}
                          className="inline-flex items-center justify-center p-2 bg-red-500 text-white rounded hover:bg-red-600"
                          title="Xóa tài khoản"
                        >
                          <FiTrash2 className="w-4 h-4" />
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

export default UserManagement;