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
      Admin: 'Bạn có toàn quyền quản lý người dùng, vai trò và phân quyền.',
      Consultant: 'Bạn có thể quản lý lịch hẹn và cập nhật link Google Meet.',
      Member: 'Bạn có thể làm khảo sát, xem kết quả, và đặt lịch tư vấn.',
      Guest: 'Bạn có thể xem thông tin cơ bản và tham gia các chương trình.',
      Staff: 'Bạn có thể quản lý khảo sát và khóa học.',
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