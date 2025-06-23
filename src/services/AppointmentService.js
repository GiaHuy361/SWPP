import axios from 'axios';

// Base URL cho API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Tạo instance axios với cấu hình
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor để thêm token vào header nếu có
api.interceptors.request.use(
  (config) => {
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

// Lấy thông tin người dùng hiện tại từ localStorage
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Hàm lấy danh sách cuộc hẹn của user hiện tại
export const getMyAppointments = async () => {
  const user = getCurrentUser();
  if (!user || !user.userId) {
    throw new Error("Không tìm thấy thông tin người dùng");
  }
  
  // Sửa đổi endpoint theo đúng API của backend
  return await api.get(`/appointments/user/${user.userId}`);
};

// Hủy lịch hẹn
export const cancelAppointment = async (id) => {
  try {
    return await api.delete(`/appointments/${id}`);
  } catch (error) {
    console.error("Lỗi khi hủy lịch hẹn:", error);
    
    // Sử dụng dữ liệu mẫu cho môi trường phát triển
    if (import.meta.env.DEV) {
      console.warn("API hủy lịch hẹn không hoạt động - giả lập thành công");
      return { data: { success: true, message: "Đã hủy lịch hẹn" } };
    }
    throw error;
  }
};

// Tạo lịch hẹn mới
export const createAppointment = async (appointmentData) => {
  return await api.post('/appointments', appointmentData);
};

// Cập nhật lịch hẹn
export const updateAppointment = async (id, appointmentData) => {
  return await api.put(`/appointments/${id}`, appointmentData);
};

// Lấy danh sách tư vấn viên khả dụng
export const getAvailableConsultants = async () => {
  try {
    // Thử gọi endpoint thật
    return await api.get('/consultants');
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tư vấn viên:", error);
    
    // Nếu gặp lỗi 403, có thể cung cấp dữ liệu mẫu cho phát triển frontend
    if (import.meta.env.DEV) {
      console.warn("API consultants trả về lỗi 403 - sử dụng dữ liệu mẫu");
      return {
        data: [
          {
            consultantId: 1,
            isActive: true,
            qualification: "Tiến sĩ Tâm lý học",
            experienceYears: 10,
            user: {
              userId: 101,
              fullName: "TS. Nguyễn Văn B",
              email: "nguyenvanb@example.com"
            }
          },
          {
            consultantId: 2,
            isActive: true,
            qualification: "Thạc sĩ Tư vấn tâm lý",
            experienceYears: 5,
            user: {
              userId: 102,
              fullName: "ThS. Trần Thị C",
              email: "tranthic@example.com"
            }
          }
        ]
      };
    }
    throw error;
  }
};

// Lấy thời gian rảnh của tư vấn viên
export const getConsultantAvailability = async (consultantId, date) => {
  return await api.get(`/consultants/${consultantId}/availability`, {
    params: { date }
  });
};

export default {
  getMyAppointments,
  cancelAppointment,
  createAppointment,
  updateAppointment,
  getAvailableConsultants,
  getConsultantAvailability
};