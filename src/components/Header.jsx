import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationDropdown from "./NotificationDropdown";
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
  const canManageSurveys = user && user.permissions?.includes('MANAGE_SURVEYS');
  const canViewPrograms = user && user.permissions?.includes('VIEW_PROGRAMS');
  const canManagePrograms = user && user.permissions?.includes('MANAGE_PROGRAMS');
  const canManageNotifications = user && (user.permissions?.includes('MANAGE_NOTIFICATIONS') || user.permissions?.includes('SEND_NOTIFICATION'));
  const canViewBlogs = user && user.permissions?.includes('VIEW_BLOGS');
  const canManageBlogs = user && user.permissions?.includes('MANAGE_BLOGS');
  const canManageCategories = user && user.permissions?.includes('MANAGE_CATEGORIES');
  
  // Kiểm tra người dùng có bất kỳ quyền quản lý nào không
  const hasManagementPermission = isAdmin || canManageAppointments || canManageRoles || 
                                canManageUsers || canManageSurveys || canManageNotifications || 
                                canManageBlogs || canManageCategories || canManagePrograms;

  return (
    <header
      className={`sticky top-0 z-50 w-full m-0 p-0 ${
        scrolled ? "bg-white shadow-lg" : "bg-white"
      } transition-all duration-300 border-b border-gray-200`}
      style={{ margin: 0, padding: 0 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3 py-1">
            <div className="mr-3 relative">
              <img src="/hero.png" alt="Logo" className="h-10 w-auto" />
              <div className="absolute -inset-1 rounded-full bg-blue-100 opacity-40 blur-md -z-10"></div>
            </div>
            <span className="font-bold text-xl text-blue-700">Phòng Chống Ma Túy</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium text-lg">
              Trang chủ
            </Link>
            {canViewPrograms && (
              <Link to="/communication/programs" className="text-gray-700 hover:text-blue-600 font-medium text-lg">
                Chương trình truyền thông
              </Link>
            )}
            {canViewBlogs && (
              <Link to="/blog" className="text-gray-700 hover:text-blue-600 font-medium text-lg">
                Blog
              </Link>
            )}
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
            {canBookAppointments && (
              <Link to="/my-appointments" className="text-gray-700 hover:text-blue-600 font-medium text-lg">
                Lịch hẹn của tôi
              </Link>
            )}
            {/* Nút quản lý chỉ hiển thị khi người dùng có quyền quản lý */}
            {hasManagementPermission && (
              <div className="relative group">
                <button className="text-gray-700 hover:text-blue-600 flex items-center" title="Quản lý">
                  <div className="p-2 rounded-full hover:bg-blue-50">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                    </svg>
                  </div>
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-50">
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                    >
                      Bảng điều khiển quản trị
                    </Link>
                  )}
                  {canManageUsers && (
                    <Link
                      to="/user-management"
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                    >
                      Quản lý người dùng
                    </Link>
                  )}
                  {canManageRoles && (
                    <Link
                      to="/role-permissions"
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                    >
                      Phân quyền
                    </Link>
                  )}
                  {canManageSurveys && (
                    <Link
                      to="/surveys/manage"
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                    >
                      Quản lý khảo sát
                    </Link>
                  )}
                  {canManageNotifications && (
                    <Link
                      to="/notifications/manage"
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                    >
                      Quản lý thông báo
                    </Link>
                  )}
                  {canManageBlogs && (
                    <Link
                      to="/blog/manage"
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                    >
                      Quản lý blog
                    </Link>
                  )}
                  {canManageCategories && (
                    <Link
                      to="/categories/manage"
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                    >
                      Quản lý danh mục
                    </Link>
                  )}
                  {canManageAppointments && (
                    <Link
                      to="/manage-appointments"
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                    >
                      Quản lý lịch hẹn
                    </Link>
                  )}
                  {canManagePrograms && (
                    <Link
                      to="/admin/communication/programs"
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                      style={{ display: 'none' }}
                    >
                      Quản lý chương trình
                    </Link>
                  )}
                </div>
              </div>
            )}

          </nav>

          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <div className="flex items-center space-x-6">
                {/* Notification Dropdown */}
                <NotificationDropdown />

                {/* User Menu */}
                <div className="relative group">
                  <button className="inline-flex items-center justify-center p-1.5 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors">
                    <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold uppercase">
                      {user?.firstName ? user.firstName[0] : "U"}
                    </span>
                    <span className="ml-2 font-medium">{user?.firstName || "User"}</span>
                    <svg
                      className="w-4 h-4 ml-1 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
                    >
                      Hồ sơ
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="text-blue-600 border border-blue-600 px-5 py-2 rounded-md hover:bg-blue-50 transition font-medium"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden flex items-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
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
            {canViewPrograms && (
              <Link
                to="/communication/programs"
                className="block py-2.5 text-gray-700 text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Chương trình truyền thông
              </Link>
            )}
            {canViewBlogs && (
              <Link
                to="/blog"
                className="block py-2.5 text-gray-700 text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
            )}
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
            {canBookAppointments && (
              <Link
                to="/my-appointments"
                className="block py-2.5 text-gray-700 text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Lịch hẹn của tôi
              </Link>
            )}
            {/* Nút quản lý cho menu mobile */}
            {hasManagementPermission && (
              <div className="block py-2.5 text-gray-700 text-lg relative">
                <button 
                  className="flex items-center w-full text-left"
                  onClick={(e) => {
                    e.preventDefault();
                    const submenu = document.getElementById('mobile-management-submenu');
                    submenu.classList.toggle('hidden');
                  }}
                >
                  <div className="flex items-center">
                    <svg
                      className="w-6 h-6 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                    </svg>
                    Quản lý
                  </div>
                  <svg
                    className="w-4 h-4 ml-1 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>
                <div id="mobile-management-submenu" className="hidden pl-4">
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="block py-2.5 text-gray-700 text-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Bảng điều khiển quản trị
                    </Link>
                  )}
                  {canManageUsers && (
                    <Link
                      to="/user-management"
                      className="block py-2.5 text-gray-700 text-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Quản lý người dùng
                    </Link>
                  )}
                  {canManageRoles && (
                    <Link
                      to="/role-permissions"
                      className="block py-2.5 text-gray-700 text-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Phân quyền
                    </Link>
                  )}
                  {canManageSurveys && (
                    <Link
                      to="/surveys/manage"
                      className="block py-2.5 text-gray-700 text-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Quản lý khảo sát
                    </Link>
                  )}
                  {canManageNotifications && (
                    <Link
                      to="/notifications/manage"
                      className="block py-2.5 text-gray-700 text-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Quản lý thông báo
                    </Link>
                  )}
                  {canManageBlogs && (
                    <Link
                      to="/blog/manage"
                      className="block py-2.5 text-gray-700 text-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Quản lý blog
                    </Link>
                  )}
                  {canManageCategories && (
                    <Link
                      to="/categories/manage"
                      className="block py-2.5 text-gray-700 text-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Quản lý danh mục
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
                  {canManagePrograms && (
                    <Link
                      to="/admin/communication/programs"
                      className="block py-2.5 text-gray-700 text-lg"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ display: 'none' }}
                    >
                      Quản lý chương trình
                    </Link>
                  )}
                </div>
              </div>
            )}

            
            {isAuthenticated ? (
              <div className="border-t border-gray-200 my-3 pt-3">
                <Link
                  to="/profile"
                  className="block py-2.5 text-gray-700 text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Hồ sơ
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="w-full text-left block py-2.5 text-red-600 text-lg"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-200 my-3 pt-3">
                <Link
                  to="/login"
                  className="block py-2.5 text-blue-600 text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="block py-2.5 text-gray-700 text-lg"
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
