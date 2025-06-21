import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaCaretDown } from "react-icons/fa";
import { FiUser } from 'react-icons/fi';
import apiClient from "../utils/axios";

import "./Header.css";

function Header({ user }) {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const dropdownRef = useRef(null);
  const managementRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsMenuOpen(false);
      }
      if (managementRef.current && !managementRef.current.contains(event.target)) {
        setIsManagementOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      // Gọi API logout
      await apiClient.post("/auth/logout");
      
      // Xóa user khỏi context
      setUser(null);
      
      // Xóa token từ localStorage nếu có
      localStorage.removeItem("token");
      
      // Chuyển hướng về trang login
      navigate("/login");
      
      // Đóng dropdown menu
      setIsOpen(false);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
      alert("Có lỗi xảy ra khi đăng xuất!");
    }
  };

  return (
    <header className="fixed w-full bg-white/95 backdrop-blur-md z-50 shadow-xl border-b border-gray-100">
      <nav className="max-w-[1440px] mx-auto px-10 xl:px-20">
        <div className="flex justify-between h-24 items-center">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center group">
              <img className="h-16 w-16 rounded-full shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl" src="/no-drugs-logo.png" alt="No Drugs Team Logo" />
              <span className="ml-4 text-3xl font-extrabold text-green-700 tracking-widest drop-shadow-lg">NO DRUGS TEAM</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-14 ml-10">
            <Link to="/" className="relative text-gray-800 hover:text-blue-700 transition-colors duration-200 font-semibold text-xl px-2 py-2 group">
              Home
              <span className="absolute left-0 -bottom-1 w-0 h-1 bg-blue-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/features" className="relative text-gray-800 hover:text-blue-700 transition-colors duration-200 font-semibold text-xl px-2 py-2 group">
              Features
              <span className="absolute left-0 -bottom-1 w-0 h-1 bg-blue-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/about" className="relative text-gray-800 hover:text-blue-700 transition-colors duration-200 font-semibold text-xl px-2 py-2 group">
              About
              <span className="absolute left-0 -bottom-1 w-0 h-1 bg-blue-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/contact" className="relative text-gray-800 hover:text-blue-700 transition-colors duration-200 font-semibold text-xl px-2 py-2 group">
              Contact
              <span className="absolute left-0 -bottom-1 w-0 h-1 bg-blue-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>
            {/* Thêm các chức năng khác */}
            <Link to="/dashboard" className="relative text-gray-800 hover:text-blue-700 transition-colors duration-200 font-semibold text-xl px-2 py-2 group">
              Dashboard
              <span className="absolute left-0 -bottom-1 w-0 h-1 bg-blue-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/blog" className="relative text-gray-800 hover:text-blue-700 transition-colors duration-200 font-semibold text-xl px-2 py-2 group">
              Blog
              <span className="absolute left-0 -bottom-1 w-0 h-1 bg-blue-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/faq" className="relative text-gray-800 hover:text-blue-700 transition-colors duration-200 font-semibold text-xl px-2 py-2 group">
              FAQ
              <span className="absolute left-0 -bottom-1 w-0 h-1 bg-blue-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>
            {/* Nếu chưa đăng nhập thì hiện Login/Sign Up, nếu đã đăng nhập thì hiện menu user */}
            {!user ? (
              <div className="flex items-center space-x-4 ml-8">
                <Link 
                  to="/login" 
                  className="px-6 py-3 text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 font-semibold text-lg hover:shadow-md"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-6 ml-8">
                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsMenuOpen((v) => !v)}
                    className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 shadow-md hover:shadow-lg border border-blue-200"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-lg">{user.fullName || user.email || 'Account'}</span>
                    <FaCaretDown className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100">
                      {["Admin", "Manager", "Staff"].includes(user.role) && (
                        <Link to="/user-management" className="block px-5 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 font-medium">
                          <div className="flex items-center">
                            <span>Quản lí người dùng</span>
                          </div>
                        </Link>
                      )}
                      <Link to={`/profile`} className="block px-5 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 font-medium">
                        <div className="flex items-center">
                          <span>Thông tin cá nhân</span>
                        </div>
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button className="block w-full text-left px-5 py-3 text-red-600 hover:bg-red-50 transition-colors duration-150 font-medium" onClick={handleLogout}>
                        <div className="flex items-center">
                          <span>Đăng xuất</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Management Dropdown */}
                {user && user.role && ["Admin", "Manager", "Staff"].includes(user.role) && (
                  <div className="relative" ref={managementRef}>
                    <button
                      onClick={() => setIsManagementOpen(!isManagementOpen)}
                      className="flex items-center px-5 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 font-medium text-lg"
                    >
                      Quản lý
                      <svg className={`ml-2 h-5 w-5 transition-transform duration-200 ${isManagementOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isManagementOpen && (
                      <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100">
                        <Link to="/user-management" className="block px-5 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 font-medium">
                          <div className="flex items-center">
                            <span>Quản lí người dùng</span>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100">
            <div className="px-4 pt-4 pb-6 space-y-2">
              <Link
                to="/"
                className="block px-4 py-3 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors duration-150"
              >
                Home
              </Link>
              <Link
                to="/features"
                className="block px-4 py-3 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors duration-150"
              >
                Features
              </Link>
              <Link
                to="/about"
                className="block px-4 py-3 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors duration-150"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block px-4 py-3 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors duration-150"
              >
                Contact
              </Link>
              {/* Nếu chưa đăng nhập thì hiện Login/Sign Up, nếu đã đăng nhập thì hiện menu user */}
              {!user ? (
                <div className="pt-4 space-y-3">
                  <Link
                    to="/login"
                    className="block px-4 py-3 rounded-lg text-blue-600 border border-blue-600 hover:bg-blue-50 font-medium text-center transition-colors duration-150"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-medium text-center transition-colors duration-150"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-100 mt-4">
                  <div className="flex items-center px-4 py-3 mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <FiUser className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-700">{user.fullName || user.email || 'Account'}</span>
                  </div>
                  {["Admin", "Manager", "Staff"].includes(user.role) && (
                    <Link to="/user-management" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors duration-150">
                      Quản lí người dùng
                    </Link>
                  )}
                  <Link to="/profile" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors duration-150">
                    Thông tin cá nhân
                  </Link>
                  <button 
                    className="block w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium transition-colors duration-150" 
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Nội dung trang chủ */}
      <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center text-center py-20">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-4">
          Chào mừng đến với Trang Chủ
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8">
          Khám phá các tính năng nổi bật của ứng dụng!
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/login" 
            className="px-6 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold text-lg shadow-md"
          >
            Đăng nhập
          </Link>
          <Link 
            to="/register" 
            className="px-6 py-3 text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 font-semibold text-lg hover:shadow-md"
          >
            Đăng ký
          </Link>
        </div>
      </div>

      {/* Trang đăng nhập - Login Page */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
          <form>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">Tên đăng nhập</label>
              <input type="text" className="w-full p-2 border rounded" placeholder="Nhập tên đăng nhập" />
            </div>
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium">Mật khẩu</label>
              <input type="password" className="w-full p-2 border rounded" placeholder="Nhập mật khẩu" />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">Đăng nhập</button>
          </form>
          <p className="mt-4 text-center text-sm">
            Chưa có tài khoản? <a href="/register" className="text-blue-500 hover:underline">Đăng ký</a>
          </p>
        </div>
      </div>
    </header>
  );
}

export default Header;
