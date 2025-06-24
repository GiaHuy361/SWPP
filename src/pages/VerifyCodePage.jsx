import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import apiClient from '../utils/axios';
import { toast } from 'react-toastify';

function VerifyCodePage() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const email = localStorage.getItem('resetEmail');
    if (!email) {
      setError('Không tìm thấy email. Vui lòng quay lại bước gửi mã.');
      toast.error('Không tìm thấy email.');
      navigate('/forgot-password');
      return;
    }
    if (!code || code.length !== 6) {
      setError('Vui lòng nhập mã OTP 6 số.');
      toast.error('Vui lòng nhập mã OTP 6 số.');
      return;
    }
    try {
      setLoading(true);
      await apiClient.post('/auth/verify-code', { email, verificationCode: code });
      localStorage.setItem('resetCode', code); // Lưu mã OTP
      setMessage('Xác thực thành công. Chuyển sang đặt lại mật khẩu...');
      toast.success('Xác thực thành công.');
      setTimeout(() => navigate('/reset-password'), 2000);
    } catch (err) {
      const errorMsg = err.response?.data || 'Xác thực thất bại. Vui lòng thử lại.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    const email = localStorage.getItem('resetEmail');
    if (!email) {
      setError('Không tìm thấy email. Vui lòng quay lại bước gửi mã.');
      toast.error('Không tìm thấy email.');
      navigate('/forgot-password');
      return;
    }
    try {
      setResendLoading(true);
      await apiClient.post('/auth/forgot-password', { email });
      setMessage('Mã xác minh mới đã được gửi tới email của bạn.');
      toast.success('Mã xác minh mới đã được gửi.');
      setTimeLeft(60);
    } catch (err) {
      const errorMsg = err.response?.data || 'Gửi mã xác minh thất bại. Vui lòng thử lại.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Xác Minh Mã OTP</h2>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4 text-sm flex items-center">
            <FiAlertCircle className="mr-2" />
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded mb-4 text-sm flex items-center">
            {message}
          </div>
        )}
        <div className="mb-4">
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
            Mã OTP (6 số) <span className="text-red-500">*</span>
          </label>
          <input
            id="code"
            type="text"
            placeholder="Nhập mã OTP"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={6}
            required
          />
        </div>
        <div className="text-center text-sm text-gray-600 mb-4">
          {timeLeft > 0 ? (
            <p>Gửi lại mã sau: <span className="font-medium">{timeLeft}s</span></p>
          ) : (
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendLoading}
              className="text-blue-600 hover:text-blue-800 flex items-center justify-center mx-auto"
            >
              {resendLoading ? (
                <>
                  <FiRefreshCw className="animate-spin mr-2" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <FiRefreshCw className="mr-2" />
                  Gửi lại mã
                </>
              )}
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors flex justify-center items-center ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang xử lý...
            </>
          ) : (
            'Xác minh'
          )}
        </button>
      </form>
    </div>
  );
}

export default VerifyCodePage;