import axios from 'axios';
import { toast } from 'react-toastify';

// Tạo instance axios với baseURL KHÔNG có tiền tố /api
const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // Không có /api ở đây
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Xóa hoặc vô hiệu hóa hàm ensureCorrectPath nếu nó đang gây ra vấn đề
// const ensureCorrectPath = (path) => { ... };

// Thêm interceptor để kiểm tra và chặn việc trùng lặp /api
apiClient.interceptors.request.use(config => {
  // Thêm log để debug
  console.log(`Request URL trước khi xử lý: ${config.url}`);

  // Loại bỏ trùng lặp /api/api nếu có
  if (config.url && config.url.includes('/api/api/')) {
    config.url = config.url.replace('/api/api/', '/api/');
    console.log(`Đã phát hiện và sửa URL trùng lặp: ${config.url}`);
  }
  
  // Thêm tiền tố /api nếu cần và URL không bắt đầu bằng /api
  if (config.url && !config.url.startsWith('/api') && !config.url.startsWith('http')) {
    config.url = `/api${config.url}`;
    console.log(`Đã thêm tiền tố /api: ${config.url}`);
  }
  
  console.log(`Request URL sau khi xử lý: ${config.url}`);
  return config;
});

// Thêm interceptor để xử lý lỗi
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
      
      // Nếu là lỗi 404, kiểm tra URL xem có bị trùng lặp /api không
      if (error.response.status === 404 && error.config && error.config.url.includes('/api/api/')) {
        console.error('Phát hiện URL trùng lặp:', error.config.url);
        // Sửa URL và thử lại request
        error.config.url = error.config.url.replace('/api/api/', '/api/');
        console.log('Thử lại với URL:', error.config.url);
        return apiClient(error.config);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;