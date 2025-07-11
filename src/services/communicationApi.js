import axios from '../utils/axios';
import { mockCommunicationApi } from './mockCommunicationApi';

// Kiểm tra cài đặt trong localStorage
const getUseMockSetting = () => {
  const localSetting = localStorage.getItem('USE_COMMUNICATION_MOCK');
  // Mặc định là false nếu không có cài đặt trong localStorage (sử dụng API thật)
  return localSetting === null ? false : localSetting === 'true';
};

// Cấu hình để chuyển sang sử dụng mock data khi cần thiết
const USE_MOCK_FALLBACK = getUseMockSetting(); // Đọc từ localStorage

// Utility function để log lỗi API với màu sắc trong console
const logApiError = (message, error) => {
  const errorDetails = error?.response?.data || error?.message || error;
  console.group('%c🔴 Communication API Error', 'color: #ff0000; font-weight: bold;');
  console.error(message);
  console.error('Error details:', errorDetails);
  console.groupEnd();
  
  // Log stack trace nếu trong môi trường development
  if (process.env.NODE_ENV === 'development' && error?.stack) {
    console.debug('Error stack:', error.stack);
  }
};

// Utility function để log khi sử dụng mock data
const logMockUsage = (apiName) => {
  console.log(`%c⚠️ Using mock data for ${apiName}`, 'color: #ff9800; font-weight: bold;');
};

// Utility function để tự động sử dụng mock data khi API thật thất bại
const tryApiWithMockFallback = async (apiCall, mockCall, params = {}) => {
  try {
    console.log('%c🔵 Calling real API', 'color: #2196f3; font-weight: bold;');
    // Cố gắng gọi API thật
    return await apiCall(params);
  } catch (error) {
    // Nếu không cấu hình sử dụng mock fallback, ném lỗi
    if (!USE_MOCK_FALLBACK) {
      logApiError('API call failed and mock fallback is disabled', error);
      throw error;
    }
    
    logApiError('API call failed, falling back to mock data', error);
    
    // Xử lý lỗi 404 (Not Found) hoặc 400 (Bad Request) - thường xảy ra khi endpoint không tồn tại
    if (error?.response?.status === 404 || error?.response?.status === 400) {
      console.log('Endpoint không tồn tại hoặc yêu cầu không hợp lệ, sử dụng mock data');
    }
    
    try {
      // Thử sử dụng mock data
      const mockFunctionName = mockCall.name || 'unknown function';
      logMockUsage(mockFunctionName);
      return await mockCall(params);
    } catch (mockError) {
      logApiError('Mock data fallback also failed', mockError);
      throw mockError;
    }
  }
};

// Helper function để tổng hợp dữ liệu thống kê từ danh sách chương trình
const aggregateProgramStats = (programs) => {
  if (!programs || !Array.isArray(programs) || programs.length === 0) {
    return {
      totalPrograms: 0,
      activePrograms: 0,
      activeProgramsCount: 0,
      totalParticipants: 0,
      totalInteractions: 0,
      averageRating: 0,
      totalFeedbacks: 0,
      upcomingPrograms: []
    };
  }
  
  // Lọc chương trình đang hoạt động
  const activePrograms = programs.filter(p => p.status === 'ACTIVE');
  
  // Tính toán các thống kê
  const totalParticipants = programs.reduce((sum, p) => sum + (p.participantCount || 0), 0);
  const totalInteractions = programs.reduce((sum, p) => sum + (p.interactionCount || 0), 0);
  const totalFeedbacks = programs.reduce((sum, p) => sum + (p.feedbackCount || 0), 0);
  
  // Tính điểm đánh giá trung bình
  const ratingsSum = programs.reduce((sum, p) => {
    if (p.averageRating && !isNaN(p.averageRating)) {
      return sum + p.averageRating;
    }
    return sum;
  }, 0);
  const programsWithRatings = programs.filter(p => p.averageRating && !isNaN(p.averageRating)).length;
  const averageRating = programsWithRatings > 0 ? ratingsSum / programsWithRatings : 0;
  
  // Sắp xếp các chương trình theo ngày bắt đầu và lấy 3 chương trình sắp diễn ra
  const upcomingPrograms = [...activePrograms]
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 3);
  
  return {
    totalPrograms: programs.length,
    activePrograms: activePrograms.length,
    activeProgramsCount: activePrograms.length,
    totalParticipants,
    totalInteractions,
    averageRating,
    totalFeedbacks,
    upcomingPrograms
  };
};

export const communicationApi = {
  // Get all communication programs with filters
  getPrograms: async (params = {}) => {
    return tryApiWithMockFallback(
      async () => {
        console.log('Fetching programs with params:', params);
        console.log('Request URL will be:', '/communication');
        const response = await axios.get('/communication', { params });
        const data = response.data;
        
        // Normalize data: ensure both id and programId are available
        const normalizeProgram = (program) => ({
          ...program,
          id: program.id || program.programId,
          programId: program.programId || program.id
        });
        
        if (data.content) {
          return {
            ...data,
            content: data.content.map(normalizeProgram)
          };
        } else if (Array.isArray(data)) {
          return data.map(normalizeProgram);
        }
        return data;
      },
      async () => {
        logMockUsage('getPrograms');
        // Assuming mockCommunicationApi has a similar method
        const mockData = await mockCommunicationApi.getOverview();
        const recentPrograms = mockData.recentPrograms || [];
        const upcomingPrograms = mockData.upcomingPrograms || [];
        return [...recentPrograms, ...upcomingPrograms];
      },
      params
    );
  },

  // Get program by ID
  getProgram: async (programId) => {
    return tryApiWithMockFallback(
      async () => {
        const response = await axios.get(`/communication/${programId}`);
        const program = response.data;
        
        // Normalize data: ensure both id and programId are available
        return {
          ...program,
          id: program.id || program.programId,
          programId: program.programId || program.id
        };
      },
      async () => mockCommunicationApi.getProgramById(programId),
      programId
    );
  },

  // Create new program (MANAGE_PROGRAMS required)
  createProgram: async (programData) => {
    return tryApiWithMockFallback(
      async () => {
        const response = await axios.post('/communication', programData);
        return response.data;
      },
      async () => ({
        ...programData,
        id: Math.floor(Math.random() * 10000) + 1,
        programId: Math.floor(Math.random() * 10000) + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    );
  },

  // Update program (MANAGE_PROGRAMS required)
  updateProgram: async (id, programData) => {
    console.log('Updating program with ID:', id, 'Status:', programData.status);
    return tryApiWithMockFallback(
      async () => {
        console.log('Sending update to API:', programData);
        const response = await axios.put(`/communication/${id}`, programData);
        console.log('API update response:', response.data);
        return response.data;
      },
      async () => {
        console.log('Using mock data for updateProgram');
        const result = {
          ...programData,
          id,
          programId: id,
          updatedAt: new Date().toISOString()
        };
        console.log('Mock update result:', result);
        return result;
      }
    );
  },

  // Delete program (MANAGE_PROGRAMS required)
  deleteProgram: async (id) => {
    return tryApiWithMockFallback(
      async () => {
        const response = await axios.delete(`/communication/${id}`);
        return response.data;
      },
      async () => ({ success: true, message: 'Program deleted successfully' })
    );
  },

  // Submit feedback - API 6: TẠO PHẢN HỒI
  submitFeedback: async (programId, feedbackData, userId) => {
    return tryApiWithMockFallback(
      async () => {
        const response = await axios.post('/communication/feedback', {
          ...feedbackData,
          programId,
          userId
        });
        return response.data;
      },
      async () => ({
        ...feedbackData,
        id: Math.floor(Math.random() * 10000) + 1,
        feedbackId: Math.floor(Math.random() * 10000) + 1,
        programId,
        userId,
        createdAt: new Date().toISOString()
      })
    );
  },

  // Get feedback by ID - API 7: LẤY PHẢN HỒI THEO ID
  getFeedbackById: async (feedbackId) => {
    return tryApiWithMockFallback(
      async () => {
        const response = await axios.get(`/communication/feedback/${feedbackId}`);
        const feedback = response.data;
        
        // Normalize feedback data: ensure both id and feedbackId are available
        return {
          ...feedback,
          id: feedback.id || feedback.feedbackId,
          feedbackId: feedback.feedbackId || feedback.id
        };
      },
      async () => ({
        id: feedbackId,
        feedbackId: feedbackId,
        programId: Math.floor(Math.random() * 100) + 1,
        userId: Math.floor(Math.random() * 100) + 1,
        rating: Math.floor(Math.random() * 5) + 1,
        content: 'Mock feedback content',
        createdAt: new Date().toISOString()
      })
    );
  },

  // Get all feedbacks - API 8: LẤY TẤT CẢ PHẢN HỒI
  getAllFeedbacks: async (params = {}) => {
    return tryApiWithMockFallback(
      async () => {
        const response = await axios.get('/communication/feedbacks', { params });
        const data = response.data;
        
        // Normalize feedback data: ensure both id and feedbackId are available
        const normalizeFeedback = (feedback) => ({
          ...feedback,
          id: feedback.id || feedback.feedbackId,
          feedbackId: feedback.feedbackId || feedback.id
        });
        
        if (data.content) {
          return {
            ...data,
            content: data.content.map(normalizeFeedback)
          };
        } else if (Array.isArray(data)) {
          return data.map(normalizeFeedback);
        }
        return data;
      },
      async () => {
        // Generate mock feedback data
        const mockFeedbacks = Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          feedbackId: i + 1,
          programId: Math.floor(Math.random() * 5) + 1,
          userId: Math.floor(Math.random() * 100) + 1,
          rating: Math.floor(Math.random() * 5) + 1,
          content: `Mock feedback content ${i + 1}`,
          createdAt: new Date().toISOString()
        }));
        return mockFeedbacks;
      },
      params
    );
  },

  // Update feedback - API 9: CẬP NHẬT PHẢN HỒI  
  updateFeedback: async (feedbackId, feedbackData, userId) => {
    return tryApiWithMockFallback(
      async () => {
        const payload = userId ? { ...feedbackData, userId } : feedbackData;
        const response = await axios.put(`/communication/feedback/${feedbackId}`, payload);
        return response.data;
      },
      async () => ({
        ...feedbackData,
        id: feedbackId,
        feedbackId: feedbackId,
        userId: userId || feedbackData.userId,
        updatedAt: new Date().toISOString()
      })
    );
  },

  // Delete feedback - API 10: XÓA PHẢN HỒI
  deleteFeedback: async (feedbackId) => {
    return tryApiWithMockFallback(
      async () => {
        const response = await axios.delete(`/communication/feedback/${feedbackId}`);
        return response.data;
      },
      async () => ({ success: true, message: 'Feedback deleted successfully' })
    );
  },

  // Join program - API 11: THAM GIA CHƯƠNG TRÌNH
  joinProgram: async (programId) => {
    return tryApiWithMockFallback(
      async () => {
        const response = await axios.post(`/communication/${programId}/join`);
        return response.data;
      },
      async () => ({ success: true, programId, message: 'Successfully joined program' })
    );
  },

  // Lấy danh sách ID chương trình mà người dùng đã tham gia - API mới
  getUserJoinedPrograms: async (userId) => {
    return tryApiWithMockFallback(
      async () => {
        const response = await axios.get(`/communication/user/${userId}/joined-programs`);
        return response.data;
      },
      async () => {
        // Generate mock joined program IDs
        return [1, 2, 3].map(id => ({
          programId: id,
          joinedAt: new Date().toISOString()
        }));
      },
      userId
    );
  },

  // Kiểm tra trạng thái tham gia của người dùng cho một chương trình - API mới
  checkUserParticipation: async (programId, userId) => {
    return tryApiWithMockFallback(
      async () => {
        const response = await axios.get(`/communication/${programId}/participation-status`, {
          params: { userId }
        });
        return response.data;
      },
      async () => mockCommunicationApi.checkJoinStatus(programId, userId),
      { programId, userId }
    );
  },

  // Lấy tất cả phản hồi của người dùng cho các chương trình
  getUserFeedbackForAllPrograms: async (userId) => {
    return tryApiWithMockFallback(
      async () => {
        const response = await axios.get('/communication/feedbacks');
        const allFeedbacks = response.data;
        
        // Lọc phản hồi của người dùng hiện tại và tạo map programId -> feedback
        const userFeedbacks = allFeedbacks.filter(feedback => feedback.userId === userId);
        const feedbackMap = {};
        
        userFeedbacks.forEach(feedback => {
          feedbackMap[feedback.programId] = feedback;
        });
        
        return feedbackMap;
      },
      async () => {
        // Generate mock feedback map
        const feedbackMap = {};
        for (let i = 1; i <= 3; i++) {
          feedbackMap[i] = {
            id: i + 100,
            feedbackId: i + 100,
            programId: i,
            userId,
            rating: Math.floor(Math.random() * 5) + 1,
            content: `Mock feedback for program ${i}`,
            createdAt: new Date().toISOString()
          };
        }
        return feedbackMap;
      },
      userId
    );
  },
  
  // Lấy số lượng người tham gia cho một chương trình cụ thể
  getParticipantCount: async (programId) => {
    return tryApiWithMockFallback(
      async () => {
        const response = await axios.get(`/communication/${programId}/participant-count`);
        return response.data;
      },
      async () => mockCommunicationApi.getParticipantCount(programId),
      programId
    );
  },
  
  // Kiểm tra trạng thái tham gia của người dùng cho một chương trình
  checkJoinStatus: async (programId, userId) => {
    return tryApiWithMockFallback(
      async () => {
        const response = await axios.get(`/communication/${programId}/participation-status`, {
          params: { userId }
        });
        return response.data;
      },
      async () => mockCommunicationApi.checkJoinStatus(programId, userId),
      { programId, userId }
    );
  },
  
  // Lấy chi tiết chương trình theo ID
  getProgramById: async (programId) => {
    return tryApiWithMockFallback(
      async () => {
        const response = await axios.get(`/communication/${programId}`);
        const program = response.data;
        
        // Normalize data: ensure both id and programId are available
        return {
          ...program,
          id: program.id || program.programId,
          programId: program.programId || program.id
        };
      },
      async () => mockCommunicationApi.getProgramById(programId),
      programId
    );
  },
  
  // Lấy tổng quan về chương trình truyền thông
  getOverview: async () => {
    return tryApiWithMockFallback(
      // API thật - sử dụng các API hiện có để tổng hợp thông tin
      async () => {
        console.log('Tạo overview từ các API hiện có');
        
        try {
          // Lấy tất cả các chương trình
          const programsResponse = await axios.get('/communication');
          const programs = programsResponse.data;
          
          // Lấy danh sách chương trình
          let programsList = Array.isArray(programs) ? programs : (programs.content || []);
          
          return aggregateProgramStats(programsList);
        } catch (error) {
          console.error('Không thể tạo overview từ API:', error);
          throw error;
        }
      },
      // Mock API fallback
      async () => {
        console.log('Sử dụng mock data cho overview');
        return mockCommunicationApi.getOverview();
      }
    );
  },
};
