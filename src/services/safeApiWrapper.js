// Service để xử lý các API call an toàn, bỏ qua lỗi 404 cho các API không tồn tại
export const safeApiCall = async (apiFunction, fallbackValue = null) => {
  try {
    const result = await apiFunction();
    return result;
  } catch (error) {
    // Bỏ qua lỗi 404 (API không tồn tại) và trả về fallback value
    if (error.response?.status === 404) {
      console.warn('API not found, returning fallback value:', fallbackValue);
      return fallbackValue;
    }
    // Rethrow các lỗi khác
    throw error;
  }
};

// Wrapper cho certificate API calls
export const certificateApiWrapper = {
  getCertificate: async (userId, courseId) => {
    return safeApiCall(
      async () => {
        const response = await fetch(`/api/certificates?userId=${userId}&courseId=${courseId}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      },
      null
    );
  }
};

// Wrapper cho communication API calls
export const communicationApiWrapper = {
  // Wrap existing API calls để xử lý an toàn
  safeGetPrograms: async (params) => {
    return safeApiCall(
      async () => {
        const { communicationApi } = await import('./communicationApi');
        return communicationApi.getPrograms(params);
      },
      []
    );
  },

  safeGetProgramById: async (id) => {
    return safeApiCall(
      async () => {
        const { communicationApi } = await import('./communicationApi');
        return communicationApi.getProgramById(id);
      },
      null
    );
  },

  safeJoinProgram: async (id) => {
    return safeApiCall(
      async () => {
        const { communicationApi } = await import('./communicationApi');
        return communicationApi.joinProgram(id);
      },
      { success: true, message: 'Tham gia thành công' }
    );
  },

  safeSubmitFeedback: async (programId, data) => {
    return safeApiCall(
      async () => {
        const { communicationApi } = await import('./communicationApi');
        return communicationApi.submitFeedback(programId, data);
      },
      { success: true, message: 'Gửi phản hồi thành công' }
    );
  }
};

export default { safeApiCall, certificateApiWrapper, communicationApiWrapper };
