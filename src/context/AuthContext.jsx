// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

// Tạo context với giá trị mặc định
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  login: () => {},
  logout: () => {},
  handleGoogleLogin: () => {},
  setError: () => {}
});

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kiểm tra trạng thái xác thực khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Kiểm tra localStorage xem có token hay không
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra xác thực:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Hàm đăng nhập
  const login = async (email, password) => {
    try {
      // Mô phỏng API call đến backend
      // Trong thực tế, bạn cần thay thế bằng API call thực sự
      if (email === 'admin@example.com' && password === 'password') {
        const userData = {
          id: '1',
          email: email,
          fullName: 'Admin User',
          role: 'Admin'
        };
        
        // Lưu thông tin vào localStorage
        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        toast.success('Đăng nhập thành công!');
        return true;
      } else {
        toast.error('Email hoặc mật khẩu không đúng!');
        return false;
      }
    } catch (error) {
      toast.error('Đăng nhập thất bại. Vui lòng thử lại!');
      console.error('Lỗi đăng nhập:', error);
      return false;
    }
  };

  // Hàm đăng xuất
  const logout = async () => {
    try {
      // Xóa thông tin xác thực khỏi localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      setUser(null);
      setIsAuthenticated(false);
      toast.info('Đã đăng xuất');
      return true;
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
      return false;
    }
  };

  // Đăng nhập với Google
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Lấy thông tin người dùng từ Google API
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }
        );

        // Dữ liệu người dùng sau khi xác thực với Google
        const userData = {
          id: userInfo.data.sub,
          email: userInfo.data.email,
          fullName: userInfo.data.name,
          picture: userInfo.data.picture,
          role: 'User' // Mặc định role là User
        };

        // Lưu thông tin vào localStorage
        localStorage.setItem('token', tokenResponse.access_token);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);
        toast.success('Đăng nhập với Google thành công!');
      } catch (error) {
        console.error('Lỗi khi đăng nhập với Google:', error);
        toast.error('Đăng nhập với Google thất bại. Vui lòng thử lại!');
      }
    },
    onError: (error) => {
      console.error('Lỗi đăng nhập Google:', error);
      toast.error('Đăng nhập với Google thất bại. Vui lòng thử lại!');
    }
  });

  // Thêm hàm checkSession ngay sau hàm useEffect đầu tiên
  // Hàm này giúp kiểm tra trạng thái session trên server
  const checkSession = async () => {
    try {
      const response = await apiClient.get('/auth/user');
      console.log("Session check response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Session check failed:", error);
      return null;
    }
  };

  // Trả về context value
  const contextValue = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    handleGoogleLogin,
    setError,
    setUser,
    setIsAuthenticated
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  // Trả về defaultValue thay vì throw lỗi
  return context;
};

// Trong LoginPage.jsx, tìm hàm handleLogin và sửa như sau:

const handleLogin = async (e) => {
  e.preventDefault();
  
  // Kiểm tra dữ liệu đầu vào
  if (!formData.usernameOrEmail) {
    setError("Vui lòng nhập tên đăng nhập hoặc email");
    return;
  }
  
  if (!formData.password) {
    setError("Vui lòng nhập mật khẩu");
    return;
  }
  
  try {
    setLoading(true);
    setError(null);
    
    console.log("Đang gửi yêu cầu đăng nhập:", formData);
    
    // Gọi hàm login từ AuthContext
    const userData = await login(formData);
    
    // Thành công
    setLoading(false);
    console.log("Đăng nhập thành công:", userData);
    
    // Chuyển hướng
    navigate(redirectPath);
  } catch (error) {
    setLoading(false);
    console.error("Lỗi đăng nhập:", error);
    
    if (error.response) {
      const errorMessage = error.response.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      setError(errorMessage);
    } else {
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    }
  }
};