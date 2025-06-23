import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

function Header() {
  const auth = useAuth();
  const user = auth?.user || null;
  const isAuthenticated = auth?.isAuthenticated || false;
  const logout = auth?.logout || (() => {});
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Kiểm tra nếu người dùng có quyền quản trị
  const isAdmin = user && (user.role === "Admin" || user.role === "Manager" || user.role === "Staff");
  // Kiểm tra nếu người dùng có thể quản lý lịch hẹn
  const canManageAppointments = user && (user.role === "Consultant" || user.role === "Admin" || user.role === "Staff");
  // Kiểm tra nếu người dùng là Member (thêm dòng này)
  const isMember = user && user.role === "Member";

  // Xử lý sự kiện cuộn trang
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await logout();
      // Sau khi đăng xuất, chuyển hướng đến trang đăng nhập
      window.location.href = '/login';
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
    }
  };

  return (
    <header
      className={`fixed w-full top-0 left-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md py-3" : "bg-white/90 backdrop-blur-sm py-5"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo - Đã tăng kích thước */}
          <Link to="/" className="flex items-center">
            <div className="mr-3 relative">
              <img
                src="/hero.png" 
                alt="Logo"
                className="h-16 w-auto" // Tăng kích thước từ h-14 lên h-16
              />
              {/* Thêm hiệu ứng sáng nhẹ để logo nổi bật hơn */}
              <div className="absolute -inset-1 rounded-full bg-blue-100 opacity-40 blur-md -z-10"></div>
            </div>
            <span className="font-bold text-2xl text-blue-700">Phòng Chống Ma Túy</span>
          </Link>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium text-lg">
              Trang chủ
            </Link>
            {user && (
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium text-lg">
                Bảng điều khiển
              </Link>
            )}
            {/* Hiển thị liên kết khảo sát cho tất cả người dùng đã đăng nhập */}
            {user && (
              <Link to="/surveys" className="text-gray-700 hover:text-blue-600 font-medium text-lg">
                Khảo sát
              </Link>
            )}
            {/* Thêm liên kết quản lý lịch hẹn nếu người dùng có quyền */}
            {canManageAppointments && (
              <Link to="/manage-appointments" className="text-gray-700 hover:text-blue-600 font-medium text-lg">
                Quản lý lịch hẹn
              </Link>
            )}
            {/* Thêm liên kết lịch hẹn của tôi nếu người dùng đã đăng nhập */}
            {user && (
              <Link to="/my-appointments" className="text-gray-700 hover:text-blue-600 font-medium text-lg">
                Lịch hẹn của tôi
              </Link>
            )}
            <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium text-lg">
              Giới thiệu
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600 font-medium text-lg">
              Liên hệ
            </Link>
          </nav>

          {/* User Actions Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Nút kiểm tra chỉ hiển thị cho Admin/Staff/Manager */}
            {isAdmin && (
              <div className="relative group">
                <button className="flex items-center justify-center bg-green-50 hover:bg-green-100 text-green-700 rounded-full p-2.5 w-10 h-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                
                {/* Dropdown Menu cho nút kiểm tra */}
                <div className="absolute right-0 w-56 mt-2 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="font-medium text-base text-green-800">Quản lý tài khoản</div>
                    <div className="text-sm text-gray-500">Chức năng dành cho {user?.role}</div>
                  </div>
                  <Link to="/user-management" className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Quản lý người dùng
                  </Link>
                  <Link to="/role-management" className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Quản lý phân quyền
                  </Link>
                  <Link to="/account-settings" className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Cài đặt hệ thống
                  </Link>
                  <Link to="/audit-logs" className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Nhật ký hoạt động
                  </Link>
                </div>
              </div>
            )}
            
            {user ? (
              <div className="flex items-center">
                <div className="relative group">
                  <button className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full py-2.5 px-5">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center uppercase font-bold text-lg">
                      {user.fullName.charAt(0)}
                    </div>
                    <span className="font-medium text-lg">{user.fullName}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 w-56 mt-2 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="font-medium text-base">{user.fullName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                    <Link to="/profile" className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100">
                      Thông tin cá nhân
                    </Link>
                    <Link to="/my-appointments" className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100">
                      Lịch hẹn của tôi
                    </Link>
                    {/* Thêm liên kết khảo sát trong dropdown menu */}
                    <Link to="/surveys" className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100">
                      Khảo sát
                    </Link>
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

          {/* Mobile Menu Button */}
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t border-gray-200 mt-3">
            <Link
              to="/"
              className="block py-2.5 text-blue-600 text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Trang chủ
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className="block py-2.5 text-gray-700 text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Bảng điều khiển
              </Link>
            )}
            
            {/* Thêm liên kết khảo sát ở menu mobile cho tất cả người dùng đã đăng nhập */}
            {user && (
              <Link
                to="/surveys"
                className="block py-2.5 text-gray-700 text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Khảo sát
              </Link>
            )}
            
            {/* Thêm liên kết quản lý lịch hẹn cho menu mobile */}
            {canManageAppointments && (
              <Link
                to="/manage-appointments"
                className="block py-2.5 text-gray-700 text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Quản lý lịch hẹn
              </Link>
            )}
            
            {/* Thêm liên kết lịch hẹn của tôi cho menu mobile */}
            {user && (
              <Link
                to="/my-appointments"
                className="block py-2.5 text-gray-700 text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Lịch hẹn của tôi
              </Link>
            )}
            
            {isAdmin && (
              <>
                <div className="py-2.5 text-gray-700 text-lg font-medium">
                  Quản lý tài khoản:
                </div>
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
                <Link
                  to="/role-management"
                  className="block py-2.5 pl-4 text-gray-700 text-lg flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Quản lý phân quyền
                </Link>
              </>
            )}
            
            <Link
              to="/about"
              className="block py-2.5 text-gray-700 text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Giới thiệu
            </Link>
            <Link
              to="/contact"
              className="block py-2.5 text-gray-700 text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Liên hệ
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block py-2.5 text-gray-700 text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Thông tin cá nhân
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
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
