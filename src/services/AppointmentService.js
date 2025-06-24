import apiClient from '../utils/axios';

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const getMyAppointments = async () => {
  const user = getCurrentUser();
  if (!user || !user.userId) {
    throw new Error('Không tìm thấy thông tin người dùng');
  }
  try {
    const response = await apiClient.get('/appointments', {
      params: { userId: user.userId },
      withCredentials: true
    });
    console.log('getMyAppointments response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in getMyAppointments:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      userId: user?.userId
    });
    throw error;
  }
};

export const cancelAppointment = async (id) => {
  try {
    const response = await apiClient.delete(`/appointments/${id}`, { withCredentials: true });
    console.log('cancelAppointment response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in cancelAppointment:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    throw error;
  }
};

export const createAppointment = async (appointmentData) => {
  try {
    const response = await apiClient.post('/appointments', appointmentData, { withCredentials: true });
    console.log('createAppointment response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in createAppointment:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      userRole: getCurrentUser()?.role || 'Unknown'
    });
    throw error;
  }
};

export const updateAppointment = async (id, appointmentData) => {
  try {
    const response = await apiClient.put(`/appointments/${id}`, appointmentData, { withCredentials: true });
    console.log('updateAppointment response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in updateAppointment:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    throw error;
  }
};

export const getAvailableConsultants = async () => {
  try {
    const response = await apiClient.get('/consultants', { withCredentials: true });
    console.log('getAvailableConsultants response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in getAvailableConsultants:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      userRole: getCurrentUser()?.role || 'Unknown'
    });
    throw error;
  }
};

export const getAppointmentById = async (id) => {
  try {
    const response = await apiClient.get(`/appointments/${id}`, { withCredentials: true });
    console.log('getAppointmentById response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in getAppointmentById:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    throw error;
  }
};