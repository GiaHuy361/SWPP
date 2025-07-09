import axios from '../utils/axios';

// Course APIs
export const getAllCourses = () => axios.get('/courses');
export const getCourseById = (courseId) => axios.get(`/courses/${courseId}`);
export const enrollCourse = (courseId) => axios.post(`/enrollments?courseId=${courseId}`);
export const getEnrollmentStatus = (courseId) => axios.get(`/enrollments/status?courseId=${courseId}`);
export const countCourses = () => axios.get('/courses/count');

// Module APIs
export const createModule = (courseId, data) => axios.post(`/courses/${courseId}/modules`, data);
export const updateModule = (moduleId, data) => axios.put(`/modules/${moduleId}`, data);
export const deleteModule = (moduleId) => axios.delete(`/modules/${moduleId}`);
export const countModules = () => axios.get('/modules/count');

// Lesson APIs
export const createLesson = (moduleId, data) => axios.post(`/modules/${moduleId}/lessons`, data);
export const updateLesson = (moduleId, lessonId, data) => axios.put(`/modules/${moduleId}/lessons/${lessonId}`, data);
export const deleteLesson = (moduleId, lessonId) => axios.delete(`/modules/${moduleId}/lessons/${lessonId}`);
export const countLessons = () => axios.get('/modules/1/lessons/lessons/count'); // Based on your backend API path

// Lesson completion
export const completeLesson = (lessonId) => axios.post(`/lessons/${lessonId}/complete`);

// Quiz APIs
export const getQuizByLessonId = (lessonId) => axios.get(`/lessons/${lessonId}/quiz`);
export const submitQuiz = (quizId, submission) => axios.post(`/quizzes/${quizId}/submissions`, submission);
export const createQuizForCourse = (courseId, quizData) => axios.post(`/courses/${courseId}/quizzes`, quizData);

// Quiz Question APIs
export const getQuizQuestions = (quizId) => axios.get(`/quizzes/${quizId}/questions`);
export const createQuizQuestion = (quizId, questionData) => axios.post(`/quizzes/${quizId}/questions`, questionData);
export const updateQuizQuestion = (quizId, questionId, questionData) => axios.put(`/quizzes/${quizId}/questions/${questionId}`, questionData);
export const deleteQuizQuestion = (quizId, questionId) => axios.delete(`/quizzes/${quizId}/questions/${questionId}`);

// Quiz Answer APIs
export const getQuestionAnswers = (questionId) => axios.get(`/questions/${questionId}/answers`);
export const createQuestionAnswer = (questionId, answerData) => axios.post(`/questions/${questionId}/answers`, answerData);
export const updateQuestionAnswer = (questionId, answerId, answerData) => axios.put(`/questions/${questionId}/answers/${answerId}`, answerData);
export const deleteQuestionAnswer = (questionId, answerId) => axios.delete(`/questions/${questionId}/answers/${answerId}`);

// Existing code
export const getModulesByCourseId = (courseId) =>
  axios.get(`/courses/${courseId}/modules`);

export const getLessonsByModuleId = (moduleId) =>
  axios.get(`/modules/${moduleId}/lessons`);

export const getLessonById = (lessonId) => axios.get(`/lessons/${lessonId}`);
