import axios from 'axios';
import { toast } from 'react-toastify';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 30000,
  withCredentials: true
});

apiClient.interceptors.request.use(
  config => {
    console.log('Sending request to:', config.url);
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  response => {
    console.log('API Success:', { url: response.config.url, status: response.status });
    return response;
  },
  async error => {
    const originalRequest = error.config;
    const errorMessage = error.response?.data?.message || error.message || 'Lỗi không xác định từ server.';
    console.error('API Error:', {
      url: originalRequest?.url,
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      toast.error('Phiên hết hạn. Vui lòng đăng nhập lại.');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      toast.error('Bạn không có quyền thực hiện hành động này.');
    }

    if (error.response?.status === 400) {
      toast.error(errorMessage || 'Dữ liệu không hợp lệ.');
    }

    if (error.response?.status === 500) {
      toast.error(errorMessage || 'Lỗi server. Vui lòng thử lại sau.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;