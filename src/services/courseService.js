import axios from '../utils/axios';

// Course APIs
export const getAllCourses = () => axios.get('/courses');
export const getCourseById = (courseId) => axios.get(`/courses/${courseId}`);
export const enrollCourse = (courseId) => axios.post(`/enrollments?courseId=${courseId}`);
export const getEnrollmentStatus = (courseId) => axios.get(`/enrollments/status?courseId=${courseId}`);

// Module APIs
export const createModule = (courseId, data) => axios.post(`/courses/${courseId}/modules`, data);
export const updateModule = (moduleId, data) => axios.put(`/modules/${moduleId}`, data);
export const deleteModule = (moduleId) => axios.delete(`/modules/${moduleId}`);

// Lesson APIs
export const createLesson = (moduleId, data) => axios.post(`/modules/${moduleId}/lessons`, data);
export const updateLesson = (moduleId, lessonId, data) => axios.put(`/modules/${moduleId}/lessons/${lessonId}`, data);
export const deleteLesson = (moduleId, lessonId) => axios.delete(`/modules/${moduleId}/lessons/${lessonId}`);

// Lesson completion
export const completeLesson = (lessonId) => axios.post(`/lessons/${lessonId}/complete`);

// Quiz APIs
export const getQuizByLessonId = (lessonId) => axios.get(`/lessons/${lessonId}/quiz`);
export const submitQuiz = (lessonId, answers) => axios.post(`/lessons/${lessonId}/quiz/submit`, answers);

// Existing code
export const getModulesByCourseId = (courseId) =>
  axios.get(`/courses/${courseId}/modules`);

export const getLessonsByModuleId = (moduleId) =>
  axios.get(`/modules/${moduleId}/lessons`);

export const getLessonById = (lessonId) => axios.get(`/lessons/${lessonId}`);
