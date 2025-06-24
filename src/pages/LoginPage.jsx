import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

function LoginPage() {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, handleGoogleLogin } = useAuth();

  const redirectPath = location.state?.from || '/user-dashboard';

  useEffect(() => {
    if (user) {
      console.log('User logged in with permissions:', user.permissions);
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login attempt with:', formData);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.usernameOrEmail) {
      setError('Vui lòng nhập tên đăng nhập hoặc email');
      toast.error('Vui lòng nhập tên đăng nhập hoặc email');
      return;
    }
    if (!emailRegex.test(formData.usernameOrEmail) && formData.usernameOrEmail.length < 3) {
      setError('Tên đăng nhập phải có ít nhất 3 ký tự hoặc email không hợp lệ');
      toast.error('Tên đăng nhập phải có ít nhất 3 ký tự hoặc email không hợp lệ');
      return;
    }
    if (!formData.password) {
      setError('Vui lòng nhập mật khẩu');
      toast.error('Vui lòng nhập mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const success = await login(formData.usernameOrEmail, formData.password);
      console.log('Login result:', success);
      if (success) {
        navigate(redirectPath, { replace: true });
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra thông tin.');
        toast.error('Đăng nhập thất bại. Vui lòng kiểm tra thông tin.');
      }
    } catch (err) {
      console.error('Login error details:', err);
      const errorMsg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
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
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
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
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
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
          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={(error) => toast.error('Đăng nhập Google thất bại: ' + (error.message || 'Vui lòng kiểm tra cấu hình OAuth trong Google Cloud Console (thêm http://localhost:5173).'))}
              useOneTap
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              width="280"
            />
          </div>
          <div className="mt-2 text-xs text-center text-gray-500">
          
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