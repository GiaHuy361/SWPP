import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import apiClient from '../utils/axios';

function LoginPage() {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const login = auth?.login;

  // Lấy đường dẫn redirect từ location state hoặc mặc định về trang chủ
  const redirectPath = location.state?.from || '/';

  // Chuyển hướng nếu đã đăng nhập
  useEffect(() => {
    if (auth.user) {
      navigate('/');
    }
  }, [auth.user, navigate]);

  // Xử lý đăng nhập thông thường
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!formData.usernameOrEmail) {
        setError("Vui lòng nhập tên đăng nhập hoặc email");
        return;
      }
      
      if (!formData.password) {
        setError("Vui lòng nhập mật khẩu");
        return;
      }
      
      setLoading(true);
      setError(null);
      
      console.log("Dữ liệu đăng nhập gửi đi:", {
        usernameOrEmail: formData.usernameOrEmail,
        password: formData.password
      });
      
      // Gọi API đăng nhập trực tiếp thay vì qua context để xử lý lỗi tốt hơn
      const response = await apiClient.post('/auth/login', {
        usernameOrEmail: formData.usernameOrEmail,
        password: formData.password
      });
      
      const userData = response.data;
      
      // Lưu dữ liệu người dùng vào localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("isAuthenticated", "true");
      
      // Cập nhật trạng thái người dùng trong context
      auth.setUser(userData);
      auth.setIsAuthenticated(true);
      
      setLoading(false);
      console.log("Đăng nhập thành công:", userData);
      
      // Hiển thị thông báo thành công
      toast.success("Đăng nhập thành công!");
      
      // Chuyển hướng sử dụng redirectPath đã định nghĩa
      navigate(redirectPath);
    } catch (error) {
      setLoading(false);
      console.error("Lỗi đăng nhập:", error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
        toast.error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      }
    }
  };

  // Xử lý đăng nhập Google thành công
  const handleGoogleLoginSuccess = async (response) => {
    try {
      console.log("Google đăng nhập thành công:", response);
      setLoading(true);
      
      // Gọi API đăng nhập với Google token
      const apiResponse = await apiClient.post('/auth/login-google', {
        idToken: response.credential
      });
      
      console.log("Status code từ backend:", apiResponse.status);
      console.log("Dữ liệu từ backend:", apiResponse.data);
      
      const userData = apiResponse.data;
      
      // Lưu dữ liệu vào localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("isAuthenticated", "true");
      
      // Cập nhật trạng thái người dùng trong context
      auth.setUser(userData);
      auth.setIsAuthenticated(true);
      
      setLoading(false);
      
      // Hiển thị thông báo thành công
      toast.success("Đăng nhập Google thành công!");
      
      // Chuyển hướng sử dụng redirectPath
      navigate(redirectPath);
    } catch (error) {
      setLoading(false);
      console.error("Lỗi đăng nhập Google:", error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || "Xác thực Google thất bại. Vui lòng thử lại sau.";
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
        toast.error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      }
    }
  };

  // Xử lý đăng nhập Google thất bại
  const handleGoogleLoginError = () => {
    console.error("Google đăng nhập thất bại");
    setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
    toast.error("Đăng nhập Google thất bại. Vui lòng thử lại.");
  };

  // Sửa hàm handleChange
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Xóa thông báo lỗi khi người dùng bắt đầu gõ
    if (error) {
      setError("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5faff]">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập</h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700">
              Tên đăng nhập hoặc Email
            </label>
            <div className="mt-1">
              <input
                id="usernameOrEmail"
                name="usernameOrEmail"
                type="text"
                autoComplete="username"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.usernameOrEmail}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
        
        <div className="flex justify-center mt-4">
          <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
            Quên mật khẩu?
          </Link>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Hoặc đăng nhập với</span>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
                useOneTap
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="280"
              />
            </div>
            
            {/* Thông báo về lỗi Google origin */}
            <div className="mt-2 text-xs text-center text-gray-500">
              <p>Nếu bạn thấy lỗi "origin not allowed", hãy liên hệ quản trị viên để thêm domain của bạn vào danh sách cho phép trong Google Cloud Console.</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản? <Link to="/register" className="text-blue-600 hover:underline">Đăng ký</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;