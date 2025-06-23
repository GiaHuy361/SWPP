import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "../TailwindCSS/UserDashboard.css";

function UserDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8">
      <div className="bg-white p-10 rounded-xl shadow-md w-full max-w-xl text-center">
        <h1 className="text-3xl font-bold text-[#1976d2] mb-4">
          Chào mừng, {user?.fullName || user?.username || "người dùng"}!
        </h1>
        <p className="text-[#1976d2] mb-2">
          Email: <strong>{user?.email}</strong>
        </p>
        <p className="text-[#1976d2] mb-2">
          Vai trò: <strong>{user?.role}</strong>
        </p>

        <div className="text-left mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
          {user?.role === "Admin" && (
            <p>Bạn có toàn quyền quản lý người dùng, vai trò và phân quyền.</p>
          )}
          {user?.role === "Manager" && (
            <p>Bạn có thể thêm và sửa người dùng, nhưng không được xóa.</p>
          )}
          {user?.role === "Staff" && (
            <p>Bạn chỉ có quyền xem thông tin người dùng.</p>
          )}
        </div>

        <Link 
          to="/" 
          className="mt-6 inline-block px-6 py-2 bg-[#1976d2] text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Trở về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default UserDashboard;