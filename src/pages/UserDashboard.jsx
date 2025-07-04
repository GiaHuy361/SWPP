import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function UserDashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  const getRoleDescription = (role) => {
    const roleDescriptions = {
      Admin: 'Bạn có quyền quản trị toàn bộ hệ thống, bao gồm người dùng, khóa học, và cài đặt.',
      Staff: 'Bạn có thể quản lý khóa học, module, bài học và hỗ trợ học viên.',
      Consultant: 'Bạn có thể xem và trả lời các cuộc hẹn tư vấn, cung cấp hỗ trợ chuyên môn cho người dùng.',
      Member: 'Bạn có thể tham gia khóa học, làm bài kiểm tra, đặt lịch hẹn tư vấn.',
      Guest: 'Bạn có thể xem nội dung cơ bản và đăng ký tài khoản.',
      Manager: 'Bạn có thể quản lý chương trình, khóa học, và tư vấn viên.'
    };
    return roleDescriptions[role] || 'Không có mô tả vai trò.';
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8">
      <div className="bg-white p-10 rounded-xl shadow-md w-full max-w-xl text-center">
        <h1 className="text-3xl font-bold text-[#1976d2] mb-4">
          Chào mừng, {user?.fullName || user?.username || 'người dùng'}!
        </h1>
        <p className="text-[#1976d2] mb-2">
          Email: <strong>{user?.email}</strong>
        </p>
        <p className="text-[#1976d2] mb-2">
          Vai trò: <strong>{user?.role}</strong>
        </p>
        {user?.permissions?.length > 0 && (
          <p className="text-[#1976d2] mb-2">
            Quyền: <strong>{user.permissions.join(', ')}</strong>
          </p>
        )}

        <div className="text-left mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
          <p>{getRoleDescription(user.role)}</p>
        </div>

        <div className="mt-6 space-y-2">
          {(user.role === 'Admin' || user.role === 'Staff' || user.role === 'Manager') && (
            <Link 
              to="/admin/courses" 
              className="block px-6 py-2 bg-[#1976d2] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quản lý khóa học
            </Link>
          )}
          {user.permissions.includes('VIEW_SURVEYS') && (
            <Link 
              to="/surveys" 
              className="block px-6 py-2 bg-[#1976d2] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Xem khảo sát
            </Link>
          )}
          {user.permissions.includes('BOOK_APPOINTMENTS') && (
            <Link 
              to="/my-appointments" 
              className="block px-6 py-2 bg-[#1976d2] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Lịch hẹn của tôi
            </Link>
          )}
          {user.permissions.includes('MANAGE_APPOINTMENTS') && (
            <Link 
              to="/manage-appointments" 
              className="block px-6 py-2 bg-[#1976d2] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quản lý lịch hẹn
            </Link>
          )}
          {user.permissions.includes('MANAGE_USERS') && (
            <Link 
              to="/user-management" 
              className="block px-6 py-2 bg-[#1976d2] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quản lý người dùng
            </Link>
          )}
          {user.permissions.includes('MANAGE_ROLES') && (
            <Link 
              to="/role-permissions" 
              className="block px-6 py-2 bg-[#1976d2] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quản lý vai trò & quyền
            </Link>
          )}
          <Link 
            to="/" 
            className="block px-6 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Trở về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;