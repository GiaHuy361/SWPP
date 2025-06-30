import axios from '../utils/axios';

export const getCourseProgress = (courseId) =>
  axios.get(`/progress/courses/${courseId}`);
export const getAllProgressByUser = () =>
  axios.get('/progress/courses');

// Có thể mở rộng thêm các API khác nếu cần









