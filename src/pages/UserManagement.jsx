import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { FiEdit, FiTrash2, FiUserPlus } from "react-icons/fi";

function UserManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleAdd = () => {
    // TODO: Open modal thêm user mới
    alert("Thêm người dùng mới");
  };

  // Chỉ các role quản lý mới thấy icon cài đặt và truy cập trang này
  const isManagerRole = ["Admin", "Manager", "Staff"].includes(user.role);

  if (!isManagerRole) {
    return <div className="p-4 text-red-600">Bạn không có quyền truy cập trang này.</div>;
  }
  return (
    <div className="pt-20 pb-12 min-h-screen bg-transparent">
      <div className="relative p-6 min-h-[calc(100vh-80px)] bg-white rounded-xl shadow-lg max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-blue-800">Quản lý người dùng</h2>
          {user.role === "Admin" && (
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-800 transition-colors"
            >
              <FiUserPlus className="w-5 h-5" />
              Thêm người dùng
            </button>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mr-4"></div>
            <span className="text-blue-700 font-semibold">Đang tải...</span>
          </div>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
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
                {users.map((u) => (
                  <tr key={u.userId} className="border-b hover:bg-blue-50 transition-colors">
                    <td className="p-3">{u.fullName}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'Admin' ? 'bg-red-100 text-red-700' : u.role === 'Manager' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{u.role}</span>
                    </td>
                    <td className="p-3 text-center space-x-2">
                      {(user.role === "Admin" || user.role === "Manager") && (
                        <button
                          onClick={() => handleEdit(u)}
                          className="inline-flex items-center justify-center p-2 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition-colors"
                          title="Sửa"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                      )}
                      {user.role === "Admin" && (
                        <button
                          onClick={() => handleDelete(u.userId)}
                          className="inline-flex items-center justify-center p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          title="Xóa"
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
