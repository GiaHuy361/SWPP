import axios from '../utils/axios';

// Get the count of unique enrolled users
export const getEnrolledUsersCount = async () => {
  try {
    // This endpoint is correct based on the backend controller
    const response = await axios.get('/api/enrollments/count');
    return response.data;
  } catch (error) {
    console.error('Error fetching enrolled users count:', error);
    // Fallback to default value if API call fails
    return { count: 0 };
  }
};

// Get enrollments for the current user
export const getUserEnrollments = async () => {
  try {
    const response = await axios.get('/api/enrollments/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user enrollments:', error);
    throw error;
  }
};

// Enroll in a course
export const enrollInCourse = async (courseId) => {
  try {
    const response = await axios.post(`/api/enrollments/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error enrolling in course:', error);
    throw error;
  }
};
