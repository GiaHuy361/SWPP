import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
      navigate('/login', { replace: true });
    } finally {
      setMobileMenuOpen(false);
    }
  };

  // Kiểm tra quyền dựa trên permissions
  const isAdmin = user && user.permissions?.includes('MANAGE_COURSES');
  const canManageAppointments = user && user.permissions?.includes('MANAGE_APPOINTMENTS');
  const canBookAppointments = user && user.permissions?.includes('BOOK_APPOINTMENTS');
  const canViewSurveys = user && user.permissions?.includes('VIEW_SURVEYS');
  const canManageRoles = user && user.permissions?.includes('MANAGE_ROLES');
  const canManageUsers = user && user.permissions?.includes('MANAGE_USERS');

  return (
    <header
      className={`fixed w-full top-0 left-0 z-50 transition-all duration-300 ${  
        scrolled ? "bg-white shadow-md py-3" : "bg-white/90 backdrop-blur-sm py-5"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <div className="mr-3 relative">
              <img src="/hero.png" alt="Logo" className="h-16 w-auto" />
              <div className="absolute -inset-1 rounded-full bg-blue-100 opacity-40 blur-md -z-10"></div>
            </div>
            <span className="font-bold text-2xl text-blue-700">Phòng Chống Ma Túy</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium text-lg">
              Trang chủ
            </Link>
            {isAuthenticated && (
              <Link to="/user-dashboard" className="text-gray-700 hover:text-blue-600 font-medium text-lg">
                Bảng điều khiển
              </Link>
            )}
            {canViewSurveys && (
              <Link to="/surveys" className="text-gray-700 hover:text-blue-600 font-medium text-lg">
                Khảo sát
              </Link>
            )}
            {canManageAppointments && (
              <Link to="/manage-appointments" className="text-gray-700 hover:text-blue-600 font-medium text-lg">
                Quản lý lịch hẹn
              </Link>
            )}
            {canBookAppointments && (
              <Link to="/my-appointments" className="text-gray-700 hover:text-blue-600 font-medium text-lg">
                Lịch hẹn của tôi
              </Link>
            )}
            <Link to="/contact" className="text-gray-700 hover:text-blue-600 font-medium text-lg">
              Liên hệ
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {(isAdmin || canManageUsers || canManageRoles) && (
              <div className="relative group">
                <button className="flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-700 rounded-full p-2.5 w-10 h-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.966 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <div className="absolute right-0 w-56 mt-2 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="font-medium text-base text-green-800">Quản lý tài khoản</div>
                    <div className="text-sm text-gray-500">Chức năng dành cho {user?.role}</div>
                  </div>
                  {canManageUsers && (
                    <Link to="/user-management" className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Quản lý người dùng
                    </Link>
                  )}
                  {canManageRoles && (
                    <Link to="/role-permissions" className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Quản lý phân quyền
                    </Link>
                  )}
                  {isAdmin && (
                    <>
                      <Link to="/admin/dashboard" className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Dashboard Admin
                      </Link>
                      <Link to="/admin/courses" className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Quản lý khóa học
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
            {isAuthenticated ? (
              <div className="flex items-center">
                <div className="relative group">
                  <button className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full py-2.5 px-5">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center uppercase font-bold text-lg">
                      {user?.fullName?.charAt(0) || '?'}
                    </div>
                    <span className="font-medium text-lg">{user?.fullName || 'Người dùng'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 w-56 mt-2 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="font-medium text-base">{user?.fullName || 'Người dùng'}</div>
                    </div>
                    <Link to="/profile" className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100">
                      Thông tin cá nhân
                    </Link>
                    <Link to="/my-courses" className="block w-full text-left px-4 py-3 text-sm text-blue-700 hover:bg-blue-50">
                      Khóa học của tôi
                    </Link>
                    {canBookAppointments && (
                      <Link to="/my-appointments" className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100">
                        Lịch hẹn của tôi
                      </Link>
                    )}
                    {canViewSurveys && (
                      <Link to="/surveys" className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100">
                        Khảo sát
                      </Link>
                    )}
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-100">
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-blue-700 hover:text-blue-800 font-medium text-lg py-2 px-4">
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 px-5 transition-colors text-lg"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-gray-700 hover:text-blue-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t border-gray-200 mt-3">
            <Link
              to="/"
              className="block py-2.5 text-blue-600 text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Trang chủ
            </Link>
            {isAuthenticated && (
              <Link
                to="/user-dashboard"
                className="block py-2.5 text-gray-700 text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Bảng điều khiển
              </Link>
            )}
            {canViewSurveys && (
              <Link
                to="/surveys"
                className="block py-2.5 text-gray-700 text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Khảo sát
              </Link>
            )}
            {canManageAppointments && (
              <Link
                to="/manage-appointments"
                className="block py-2.5 text-gray-700 text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Quản lý lịch hẹn
              </Link>
            )}
            {canBookAppointments && (
              <Link
                to="/my-appointments"
                className="block py-2.5 text-gray-700 text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Lịch hẹn của tôi
              </Link>
            )}
            {(isAdmin || canManageUsers || canManageRoles) && (
              <>
                <div className="py-2.5 text-gray-700 text-lg font-medium">
                  Quản lý tài khoản:
                </div>
                {canManageUsers && (
                  <Link
                    to="/user-management"
                    className="block py-2.5 pl-4 text-gray-700 text-lg flex items-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Quản lý người dùng
                  </Link>
                )}
                {canManageRoles && (
                  <Link
                    to="/role-permissions"
                    className="block py-2.5 pl-4 text-gray-700 text-lg flex items-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Quản lý phân quyền
                  </Link>
                )}
                {isAdmin && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className="block py-2.5 pl-4 text-gray-700 text-lg flex items-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Dashboard Admin
                    </Link>
                    <Link
                      to="/admin/courses"
                      className="block py-2.5 pl-4 text-gray-700 text-lg flex items-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Quản lý khóa học
                    </Link>
                  </>
                )}
              </>
            )}
            <Link
              to="/contact"
              className="block py-2.5 text-gray-700 text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Liên hệ
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="block py-2.5 text-gray-700 text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Thông tin cá nhân
                </Link>
                <Link
                  to="/my-courses"
                  className="block py-2.5 text-gray-700 text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Khóa học của tôi
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2.5 text-red-600 text-lg"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 mt-2 pt-2 border-t border-gray-200">
                <Link
                  to="/login"
                  className="block py-2.5 text-blue-600 font-medium text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white font-medium rounded-lg py-2.5 px-5 text-center text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;