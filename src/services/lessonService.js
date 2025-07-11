import axios from '../utils/axios';

export const lessonService = {
  // Get all lessons for a module
  getLessonsByModuleId: async (moduleId) => {
    try {
      const response = await axios.get(`/modules/${moduleId}/lessons`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bài học:', error);
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  // Create a new lesson
  createLesson: async (moduleId, lessonData) => {
    try {
      console.log('Gửi dữ liệu lesson:', lessonData);
      const response = await axios.post(`/modules/${moduleId}/lessons`, lessonData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo bài học:', error);
      throw error;
    }
  },

  // Update a lesson
  updateLesson: async (moduleId, lessonId, lessonData) => {
    try {
      console.log('Cập nhật lesson:', lessonData);
      const response = await axios.put(`/modules/${moduleId}/lessons/${lessonId}`, lessonData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật bài học:', error);
      throw error;
    }
  },

  // Delete a lesson
  deleteLesson: async (moduleId, lessonId) => {
    try {
      await axios.delete(`/modules/${moduleId}/lessons/${lessonId}`);
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa bài học:', error);
      throw error;
    }
  },

  // Get lesson count
  getLessonCount: async () => {
    try {
      const response = await axios.get(`/modules/lessons/count`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy số lượng bài học:', error);
      return { count: 0 };
    }
  },

  // Get all quizzes for a course
  getQuizzesByCourseId: async (courseId) => {
    try {
      console.log(`Đang lấy quiz cho khóa học ID: ${courseId}`);
      const response = await axios.get(`/courses/${courseId}/quizzes`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách quiz:', error);
      return [];
    }
  },

  // Get quizzes for a lesson by courseId and lessonId
  getQuizzesByLessonId: async (courseId, lessonId) => {
    try {
      // Lấy tất cả quiz của khóa học
      console.log(`Đang lấy quiz cho khóa học ID: ${courseId}, bài học ID: ${lessonId}`);
      const response = await axios.get(`/courses/${courseId}/quizzes`);
      // Lọc theo lessonId (các quiz phải có trường lessonId)
      const quizzes = Array.isArray(response.data) ? response.data : [];
      // Chỉ trả về các quiz có lessonId trùng khớp với bài học hiện tại
      const filteredQuizzes = quizzes.filter(quiz => quiz.lessonId === parseInt(lessonId));
      console.log(`Lọc được ${filteredQuizzes.length} quiz cho bài học ${lessonId}`);
      return filteredQuizzes;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách quiz cho bài học:', error);
      return [];
    }
  },

  // Create a new quiz
  createQuiz: async (courseId, quizData) => {
    try {
      console.log('Gửi dữ liệu quiz:', quizData);
      const response = await axios.post(`/courses/${courseId}/quizzes`, quizData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo quiz:', error);
      throw error;
    }
  },

  // Update a quiz
  updateQuiz: async (courseId, quizId, quizData) => {
    try {
      if (!quizId) {
        console.error('❌ updateQuiz: quizId không hợp lệ:', quizId);
        throw new Error('Quiz ID không hợp lệ');
      }
      console.log(`Đang cập nhật quiz ID: ${quizId}`, quizData);
      const response = await axios.put(`/courses/${courseId}/quizzes/${quizId}`, quizData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật quiz:', error);
      throw error;
    }
  },

  // Delete a quiz
  deleteQuiz: async (courseId, quizId) => {
    try {
      if (!quizId) {
        console.error('❌ deleteQuiz: quizId không hợp lệ:', quizId);
        throw new Error('Quiz ID không hợp lệ');
      }
      console.log(`Đang xóa quiz ID: ${quizId} cho khóa học ID: ${courseId}`);
      await axios.delete(`/courses/${courseId}/quizzes/${quizId}`);
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa quiz:', error);
      throw error;
    }
  },

  // Get quiz count for a course
  getQuizCount: async (courseId) => {
    try {
      // Updated to match the backend controller endpoint
      const response = await axios.get(`/api/courses/${courseId}/quizzes/quizzes/count`);
      return response.data.count || 0;
    } catch (error) {
      console.error('Lỗi khi đếm số lượng quiz:', error);
      return 0;
    }
  }
};

export default lessonService;
