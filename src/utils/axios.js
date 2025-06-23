import axios from 'axios';
import { toast } from 'react-toastify';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 30000,
  withCredentials: true // Quan trọng: Gửi cookies với mỗi request
});

// Log chi tiết request để debug
apiClient.interceptors.request.use(
  config => {
    console.log(`Sending ${config.method} request to ${config.url}`, config.data);
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Xử lý response và lỗi xác thực
apiClient.interceptors.response.use(
  response => {
    console.log(`Successful response from ${response.config.url}:`, {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  async error => {
    const originalRequest = error.config;
    
    console.log('API Error:', {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.response?.data?.message || error.message
    });
    
    // Xử lý lỗi 401 Unauthorized - Phiên làm việc đã hết hạn
    if (error.response?.status === 401) {
      // Thông báo cho người dùng
      toast.error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
      
      // Xóa thông tin đăng nhập trong localStorage
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      
      // Redirect đến trang login sau 1s
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
    
    // Xử lý lỗi 400 Bad Request - Thông tin đăng nhập không hợp lệ
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.message || 'Thông tin đăng nhập không hợp lệ';
      toast.error(errorMessage);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;