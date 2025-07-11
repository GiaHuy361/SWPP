import React from 'react';
import { toast } from 'react-toastify';

// Component xử lý lỗi xác thực và hiển thị thông báo thân thiện
export const AuthErrorHandler = {
  // Xử lý lỗi Google Login
  handleGoogleLoginError: (error) => {
    console.error('Google Login Error Details:', error);
    
    let userFriendlyMessage = 'Đăng nhập Google thất bại';
    let technicalDetails = '';
    
    if (error.response?.status === 403) {
      userFriendlyMessage = 'Tài khoản Google của bạn không có quyền truy cập hệ thống';
      technicalDetails = 'Vui lòng liên hệ quản trị viên để được cấp quyền truy cập.';
    } else if (error.response?.status === 401) {
      userFriendlyMessage = 'Thông tin xác thực Google không hợp lệ';
      technicalDetails = 'Token từ Google có thể đã hết hạn. Vui lòng thử lại.';
    } else if (error.response?.status === 400) {
      userFriendlyMessage = 'Thông tin từ Google không đầy đủ';
      technicalDetails = 'Vui lòng đảm bảo tài khoản Google có đủ thông tin email và profile.';
    } else if (error.response?.status === 500) {
      userFriendlyMessage = 'Lỗi server khi xử lý đăng nhập Google';
      technicalDetails = 'Vui lòng thử lại sau hoặc liên hệ hỗ trợ kỹ thuật.';
    } else if (error.code === 'ECONNABORTED') {
      userFriendlyMessage = 'Kết nối timeout khi đăng nhập Google';
      technicalDetails = 'Vui lòng kiểm tra kết nối mạng và thử lại.';
    } else if (!error.response) {
      userFriendlyMessage = 'Không thể kết nối đến server';
      technicalDetails = 'Vui lòng kiểm tra kết nối internet và thử lại.';
    } else if (error.response?.data?.message) {
      userFriendlyMessage = error.response.data.message;
    }
    
    toast.error(`${userFriendlyMessage}${technicalDetails ? '. ' + technicalDetails : ''}`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  // Xử lý lỗi session check
  handleSessionError: (error) => {
    console.error('Session Error Details:', error);
    
    if (error.response?.status === 401) {
      // Session expired - silent handling, don't show error toast
      console.log('Session expired, user needs to login again');
    } else if (error.response?.status === 403) {
      toast.error('Phiên làm việc không hợp lệ. Vui lòng đăng nhập lại.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Kiểm tra phiên làm việc timeout. Vui lòng kiểm tra kết nối mạng.');
    } else if (!error.response) {
      toast.error('Không thể kết nối đến server để kiểm tra phiên làm việc.');
    }
  },

  // Xử lý lỗi login thông thường
  handleLoginError: (error) => {
    console.error('Login Error Details:', error);
    
    let userFriendlyMessage = 'Đăng nhập thất bại';
    let technicalDetails = '';
    
    if (error.response?.status === 401) {
      userFriendlyMessage = 'Tên đăng nhập hoặc mật khẩu không đúng';
      technicalDetails = 'Vui lòng kiểm tra lại thông tin đăng nhập.';
    } else if (error.response?.status === 403) {
      userFriendlyMessage = 'Tài khoản không có quyền truy cập';
      technicalDetails = 'Vui lòng liên hệ quản trị viên để được cấp quyền.';
    } else if (error.response?.status === 400) {
      userFriendlyMessage = 'Thông tin đăng nhập không hợp lệ';
      technicalDetails = 'Vui lòng kiểm tra định dạng email hoặc tên đăng nhập.';
    } else if (error.response?.status === 500) {
      userFriendlyMessage = 'Lỗi server khi xử lý đăng nhập';
      technicalDetails = 'Vui lòng thử lại sau hoặc liên hệ hỗ trợ kỹ thuật.';
    } else if (error.code === 'ECONNABORTED') {
      userFriendlyMessage = 'Kết nối timeout khi đăng nhập';
      technicalDetails = 'Vui lòng kiểm tra kết nối mạng và thử lại.';
    } else if (!error.response) {
      userFriendlyMessage = 'Không thể kết nối đến server';
      technicalDetails = 'Vui lòng kiểm tra kết nối internet và thử lại.';
    } else if (error.response?.data?.message) {
      userFriendlyMessage = error.response.data.message;
    }
    
    toast.error(`${userFriendlyMessage}${technicalDetails ? '. ' + technicalDetails : ''}`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },

  // Xử lý lỗi API chung
  handleApiError: (error, context = 'API') => {
    console.error(`${context} Error Details:`, error);
    
    let userFriendlyMessage = 'Có lỗi xảy ra';
    let technicalDetails = '';
    
    if (error.response?.status === 401) {
      userFriendlyMessage = 'Phiên làm việc đã hết hạn';
      technicalDetails = 'Vui lòng đăng nhập lại.';
    } else if (error.response?.status === 403) {
      userFriendlyMessage = 'Không có quyền thực hiện hành động này';
      technicalDetails = 'Vui lòng liên hệ quản trị viên nếu cần thiết.';
    } else if (error.response?.status === 400) {
      userFriendlyMessage = 'Dữ liệu không hợp lệ';
      technicalDetails = 'Vui lòng kiểm tra lại thông tin và thử lại.';
    } else if (error.response?.status === 404) {
      userFriendlyMessage = 'Không tìm thấy dữ liệu';
      technicalDetails = 'Dữ liệu có thể đã bị xóa hoặc không tồn tại.';
    } else if (error.response?.status === 500) {
      userFriendlyMessage = 'Lỗi server';
      technicalDetails = 'Vui lòng thử lại sau hoặc liên hệ hỗ trợ kỹ thuật.';
    } else if (error.code === 'ECONNABORTED') {
      userFriendlyMessage = 'Kết nối timeout';
      technicalDetails = 'Vui lòng kiểm tra kết nối mạng và thử lại.';
    } else if (!error.response) {
      userFriendlyMessage = 'Không thể kết nối đến server';
      technicalDetails = 'Vui lòng kiểm tra kết nối internet và thử lại.';
    } else if (error.response?.data?.message) {
      userFriendlyMessage = error.response.data.message;
    }
    
    toast.error(`${userFriendlyMessage}${technicalDetails ? '. ' + technicalDetails : ''}`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }
};

// Component UI để hiển thị trạng thái lỗi xác thực
export const AuthErrorDisplay = ({ error, onRetry }) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Lỗi xác thực
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error}</p>
          </div>
          {onRetry && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200 transition-colors"
              >
                Thử lại
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthErrorHandler;
