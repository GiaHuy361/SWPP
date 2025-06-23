import axios from 'axios';
import { toast } from 'react-toastify';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true,
});

// Thêm token authentication
apiClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage hoặc sessionStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Xử lý response errors - thêm các case 404 và 500 để không redirect ngay lập tức
apiClient.interceptors.response.use(
  (response) => {
    console.log("Successful response from " + response.config.url + ":", response);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Chi tiết lỗi để debug
    console.log("API Error:", {
      url: originalRequest.url,
      method: originalRequest.method,
      status: error.response?.status,
      data: error.response?.data || {},
      message: error.response?.data?.message || error.message
    });
    
    // Xử lý lỗi xác thực - chỉ redirect nếu thực sự là lỗi xác thực,
    // không phải lỗi "không tìm thấy hồ sơ"
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Kiểm tra nếu lỗi là do thiếu hồ sơ người dùng (không cần redirect)
      if (error.response?.data?.message?.includes("Hồ sơ người dùng không tồn tại") || 
          originalRequest.url.includes('/profiles/')) {
        // Chỉ trả về lỗi để component xử lý tạo profile
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;
      
      // Kiểm tra nếu token hết hạn
      const errorMessage = error.response?.data?.message;
      if (errorMessage && (errorMessage.includes("expired") || errorMessage.includes("hết hạn"))) {
        console.log("Token expired, redirecting to login...");
        toast.error("Phiên làm việc đã hết hạn, vui lòng đăng nhập lại!");
      }
      
      // Redirect đến trang đăng nhập
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    }
    
    // Xử lý lỗi 500 - Internal Server Error
    if (error.response?.status === 500) {
      toast.error("Đã xảy ra lỗi từ máy chủ. Vui lòng thử lại sau!");
    }
    
    // Xử lý lỗi 400 - Bad Request cho các trường hợp đặc biệt
    if (error.response?.status === 400) {
      // Kiểm tra lỗi trùng lặp khóa chính cho profile
      if (error.response.data.message && 
          error.response.data.message.includes('Duplicate entry') && 
          error.response.data.message.includes('user_profiles.PRIMARY')) {
        // Chuyển sang cập nhật profile thay vì tạo mới
        if (originalRequest.method === 'post' && originalRequest.url.includes('/profiles/')) {
          console.log("Đã có profile, thử cập nhật thay vì tạo mới");
          // Chỉ trả về lỗi với thông tin đặc biệt
          error.isDuplicateProfile = true;
        }
      }
    }
    
    // Trả về lỗi cho component xử lý 
    return Promise.reject(error);
  }
);

export default apiClient;
