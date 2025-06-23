// src/pages/ForgotPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheck } from 'react-icons/fi';
import apiClient from '../utils/axios';
import "../TailwindCSS/ForgotPasswordPage.css";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  
  // Trạng thái bước hiện tại: 1 = nhập email, 2 = nhập mã OTP, 3 = đặt mật khẩu mới
  const [currentStep, setCurrentStep] = useState(1);
  
  // Lưu thông tin qua các bước
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Thời gian đếm ngược cho OTP (300 giây = 5 phút)
  const [countdown, setCountdown] = useState(300);
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpired, setOtpExpired] = useState(false);
  
  // Đếm ngược thời gian OTP
  useEffect(() => {
    let timer;
    if (otpSent && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prevCount => prevCount - 1);
      }, 1000);
    } else if (countdown === 0 && otpSent) {
      setOtpExpired(true);
      setError('Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.');
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [otpSent, countdown]);
  
  // Format thời gian đếm ngược thành phút:giây
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Xử lý gửi email để nhận mã OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email || !validateEmail(email)) {
      setError('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      setSuccess('Mã xác minh đã được gửi tới email của bạn');
      setOtpSent(true);
      setCountdown(300); // đặt lại bộ đếm ngược 5 phút
      setOtpExpired(false);
      setCurrentStep(2);
    } catch (err) {
      setError(err.response?.data || 'Không thể gửi mã xác minh. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Xử lý xác thực mã OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Vui lòng nhập mã xác minh 6 chữ số');
      return;
    }
    
    if (otpExpired) {
      setError('Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await apiClient.post('/auth/verify-code', { 
        email, 
        verificationCode 
      });
      setSuccess('Xác minh thành công. Vui lòng đặt mật khẩu mới');
      setCurrentStep(3);
    } catch (err) {
      setError(err.response?.data || 'Mã xác minh không đúng hoặc đã hết hạn');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Xử lý đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validatePassword()) {
      return;
    }
    
    if (otpExpired) {
      setError('Phiên làm việc đã hết hạn. Vui lòng thực hiện lại từ đầu.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await apiClient.post('/auth/reset-password', {
        email,
        verificationCode,
        newPassword
      });
      
      setSuccess('Đổi mật khẩu thành công! Bạn sẽ được chuyển hướng đến trang đăng nhập.');
      
      // Chuyển hướng sau 3 giây
      setTimeout(() => {
        navigate('/login', { state: { message: 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập bằng mật khẩu mới.' } });
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Kiểm tra định dạng email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  // Kiểm tra mật khẩu mới
  const validatePassword = () => {
    if (!newPassword || newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }
    
    return true;
  };
  
  // Xử lý gửi lại mã OTP
  const handleResendOTP = async () => {
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSuccess('Mã xác minh mới đã được gửi tới email của bạn');
      setOtpSent(true);
      setCountdown(300); // đặt lại bộ đếm ngược 5 phút
      setOtpExpired(false);
    } catch (err) {
      setError(err.response?.data || 'Không thể gửi lại mã. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5faff] pt-16 pb-12 px-4">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 py-4 px-6 text-white text-center">
          <h2 className="text-xl font-semibold">Quên Mật Khẩu</h2>
        </div>
        
        <div className="p-6">
          {/* Hiển thị thời gian OTP ở mọi bước nếu OTP đã được gửi */}
          {otpSent && (
            <div className="mb-4 text-right">
              <span className={`text-sm font-medium ${
                countdown < 60 ? 'text-red-600' : 'text-gray-600'
              }`}>
                Thời gian còn lại: {formatTime(countdown)}
              </span>
            </div>
          )}
          
          {/* Hiển thị thông báo lỗi */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-start">
              <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {/* Hiển thị thông báo thành công */}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative flex items-start">
              <FiCheck className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}
          
          {/* Bước 1: Nhập email */}
          {currentStep === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Nhập email của bạn để nhận mã xác minh
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập email của bạn"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500">
                  Quay lại đăng nhập
                </Link>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi mã xác minh'}
                </button>
              </div>
            </form>
          )}
          
          {/* Bước 2: Nhập mã xác minh */}
          {currentStep === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Nhập mã xác minh từ email
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-lg letter-spacing-wide"
                  placeholder="Nhập mã 6 chữ số"
                />
              </div>
              
              <div className="text-center text-sm text-gray-600">
                Không nhận được mã? 
                {countdown > 0 ? (
                  <span className="text-gray-500"> Vui lòng đợi {formatTime(countdown)} để gửi lại</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isSubmitting}
                    className="ml-1 text-blue-600 hover:text-blue-500"
                  >
                    Gửi lại mã
                  </button>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Quay lại
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting || verificationCode.length !== 6 || otpExpired}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSubmitting || verificationCode.length !== 6 || otpExpired ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Đang xác minh...' : 'Tiếp tục'}
                </button>
              </div>
            </form>
          )}
          
          {/* Bước 3: Đặt mật khẩu mới */}
          {currentStep === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* Mật khẩu mới */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập mật khẩu mới"
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Xác nhận mật khẩu */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Xác nhận mật khẩu mới"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Quay lại
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting || !newPassword || !confirmPassword || otpExpired}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSubmitting || !newPassword || !confirmPassword || otpExpired ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
