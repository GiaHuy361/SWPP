import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { FiEdit, FiTrash2, FiUserPlus, FiSearch, FiFilter } from "react-icons/fi";

function UserManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get("/auth/users");
      setUsers(res.data);
    } catch (err) {
      setError("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản này?")) return;
    try {
      await apiClient.delete(`/auth/users/${id}`);
      setUsers(users.filter((u) => u.userId !== id));
    } catch (err) {
      alert("Xóa thất bại");
    }
  };
  
  const handleEdit = (user) => {
    navigate(`/edit-user/${user.userId}`);
  };

  const handleAddUser = () => {
    navigate('/create-user');
  };

  // Lọc người dùng theo tìm kiếm và vai trò
  const filteredUsers = users.filter(u => {
    const matchesSearch = searchTerm === "" || 
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "" || u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Chỉ các role quản lý mới thấy icon cài đặt và truy cập trang này
  const isManagerRole = ["Admin", "Manager", "Staff"].includes(user?.role);

  if (!isManagerRole) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg max-w-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-red-800">Truy cập bị từ chối</h3>
              <p className="mt-2 text-red-700">Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên để được hỗ trợ.</p>
              <div className="mt-4">
                <button
                  onClick={() => navigate("/")}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Quay về trang chủ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-4">
      <div className="bg-white rounded-xl shadow-lg max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-extrabold text-blue-800">Quản lý người dùng</h1>
          
          {user.role === "Admin" && (
            <button
              onClick={handleAddUser}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
            >
              <FiUserPlus className="w-5 h-5" />
              Tạo người dùng mới
            </button>
          )}
        </div>

        {/* Thanh công cụ tìm kiếm và lọc */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            >
              <option value="">Tất cả vai trò</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Quản lý</option>
              <option value="Staff">Nhân viên</option>
              <option value="Member">Thành viên</option>
              <option value="Guest">Khách</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mr-4"></div>
            <span className="text-blue-700 font-semibold">Đang tải dữ liệu...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-500 text-lg">Không tìm thấy người dùng nào phù hợp</p>
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
                  <tr key={u.userId} className="border-b hover:bg-blue-50 transition-colors">
                    <td className="p-3">{u.fullName || "Chưa cập nhật"}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        u.role === 'Admin' 
                          ? 'bg-red-100 text-red-700' 
                          : u.role === 'Manager' 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : u.role === 'Staff'
                              ? 'bg-blue-100 text-blue-700'
                              : u.role === 'Member'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role === 'Admin' ? 'Quản trị viên' : 
                         u.role === 'Manager' ? 'Quản lý' : 
                         u.role === 'Staff' ? 'Nhân viên' : 
                         u.role === 'Member' ? 'Thành viên' : 'Khách'}
                      </span>
                    </td>
                    <td className="p-3 text-center space-x-2">
                      {(user.role === "Admin" || user.role === "Manager") && (
                        <button
                          onClick={() => handleEdit(u)}
                          className="inline-flex items-center justify-center p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                          title="Sửa thông tin"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                      )}
                      {user.role === "Admin" && u.role !== "Admin" && (
                        <button
                          onClick={() => handleDelete(u.userId)}
                          className="inline-flex items-center justify-center p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
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
