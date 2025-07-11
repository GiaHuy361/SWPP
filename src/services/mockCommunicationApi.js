// Mock data for communication API

// Helper để tạo dữ liệu mẫu
const createMockPrograms = () => {
  const programs = [];
  const statuses = ['ACTIVE', 'COMPLETED', 'CANCELLED', 'DRAFT'];
  const locations = [
    'Trường Đại học Sư phạm TP.HCM',
    'Trung tâm Văn hóa Quận 1',
    'Nhà Văn hóa Thanh niên',
    'Trực tuyến',
    'Công viên Tao Đàn',
    'Trung tâm Hội nghị và Triển lãm Sài Gòn'
  ];
  const types = [
    'Hội thảo', 
    'Workshop', 
    'Talkshow', 
    'Chiến dịch truyền thông',
    'Hoạt động cộng đồng',
    'Tập huấn'
  ];
  const titles = [
    'Chương trình giao lưu văn hóa',
    'Hội thảo trực tuyến về an toàn mạng',
    'Hướng dẫn kỹ năng phát triển cá nhân',
    'Hội thảo về phát triển bền vững',
    'Workshop sáng tạo nội dung số',
    'Chương trình hướng nghiệp cho sinh viên',
    'Khóa học kỹ năng sống',
    'Hội thảo về sức khỏe tâm thần',
    'Nói Không Với Ma Túy - Bảo Vệ Tương Lai',
    'Chương trình hỗ trợ cộng đồng'
  ];
  const descriptions = [
    'Chương trình tuyên truyền nâng cao nhận thức về tác hại của ma túy trong cộng đồng. Bao gồm các hoạt động thảo luận, chia sẻ kinh nghiệm và video giáo dục về những tác động tiêu cực của ma túy đối với sức khỏe, gia đình và xã hội.',
    'Chương trình tạo điều kiện cho học sinh, sinh viên tìm hiểu về các ngành nghề và định hướng nghề nghiệp phù hợp. Các chuyên gia sẽ tư vấn và chia sẻ kinh nghiệm về các lĩnh vực nghề nghiệp khác nhau, giúp người tham gia có cái nhìn toàn diện về thị trường lao động.',
    'Khóa học giúp người tham gia phát triển các kỹ năng cần thiết trong cuộc sống như giao tiếp, quản lý thời gian, giải quyết vấn đề và làm việc nhóm. Thông qua các bài tập thực hành và tình huống mô phỏng, người tham gia sẽ được trải nghiệm và học hỏi cách ứng dụng các kỹ năng này vào cuộc sống hàng ngày.',
    'Hội thảo tập trung vào các vấn đề liên quan đến sức khỏe tâm thần, các dấu hiệu nhận biết và cách thức phòng ngừa. Các chuyên gia tâm lý sẽ chia sẻ kiến thức và hướng dẫn cách chăm sóc sức khỏe tâm thần, đặc biệt trong giai đoạn dịch bệnh và các tình huống căng thẳng.',
    'Chương trình hỗ trợ các cộng đồng khó khăn thông qua các hoạt động thiện nguyện. Các tình nguyện viên sẽ tham gia vào các dự án cộng đồng, như xây dựng nhà ở, cung cấp nhu yếu phẩm, tổ chức các hoạt động văn hóa và giáo dục cho trẻ em có hoàn cảnh khó khăn.'
  ];

  for (let i = 1; i <= 10; i++) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 30) + 1);

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 60));

    const participantCount = Math.floor(Math.random() * 100) + 20;
    const feedbackCount = Math.floor(participantCount * 0.7);
    const interactionCount = Math.floor(participantCount * 2.5);
    
    // Dữ liệu chi tiết hơn cho chương trình với ID=1
    if (i === 1) {
      programs.push({
        programId: 1,
        id: 1,
        title: 'Nói Không Với Ma Túy - Bảo Vệ Tương Lai',
        description: 'Chương trình tuyên truyền nâng cao nhận thức về tác hại của ma túy trong cộng đồng. Bao gồm các hoạt động thảo luận, chia sẻ kinh nghiệm và video giáo dục về những tác động tiêu cực của ma túy đối với sức khỏe, gia đình và xã hội.',
        startDate: '2025-01-13T08:00:00',
        endDate: '2025-12-29T17:00:00',
        location: 'Trường Đại học Sư phạm TP.HCM',
        organizerName: 'Khoa Tâm lý học - Đại học Sư phạm TP.HCM',
        organizer: {
          id: 5,
          name: 'Khoa Tâm lý học - Đại học Sư phạm TP.HCM',
          contactInfo: 'tamlyhoc@hcmue.edu.vn',
          description: 'Đơn vị chuyên tổ chức các chương trình giáo dục và tuyên truyền về sức khỏe tâm thần'
        },
        type: 'Chiến dịch truyền thông',
        status: 'ACTIVE',
        targetAudience: 'Học sinh, sinh viên và thanh niên',
        participantCount: 150,
        feedbackCount: 105,
        interactionCount: 375,
        averageRating: 4.7,
        createdAt: '2024-11-15T10:30:00',
        updatedAt: '2025-05-20T14:45:00',
        finalAverageRating: 4.7,
        budget: 25000000,
        currency: 'VND',
        resources: [
          { id: 1, name: 'Tài liệu hướng dẫn', url: '#', type: 'DOCUMENT' },
          { id: 2, name: 'Poster chiến dịch', url: '#', type: 'IMAGE' },
          { id: 3, name: 'Video tuyên truyền', url: '#', type: 'VIDEO' }
        ],
        tags: ['ma túy', 'phòng chống', 'tuyên truyền', 'giáo dục', 'thanh niên'],
        goals: [
          'Nâng cao nhận thức về tác hại của ma túy',
          'Hướng dẫn kỹ năng từ chối và phòng tránh',
          'Xây dựng mạng lưới hỗ trợ trong trường học'
        ],
        schedule: [
          {
            id: 1,
            title: 'Khai mạc chương trình',
            description: 'Giới thiệu mục tiêu và các hoạt động của chương trình',
            startTime: '2025-01-13T08:00:00',
            endTime: '2025-01-13T09:00:00',
            location: 'Hội trường chính'
          },
          {
            id: 2,
            title: 'Hội thảo chuyên gia',
            description: 'Các chuyên gia chia sẻ kiến thức về tác hại của ma túy',
            startTime: '2025-01-13T09:30:00',
            endTime: '2025-01-13T11:30:00',
            location: 'Phòng hội thảo'
          },
          {
            id: 3,
            title: 'Workshop kỹ năng từ chối',
            description: 'Thực hành các tình huống và kỹ năng từ chối',
            startTime: '2025-01-13T13:00:00',
            endTime: '2025-01-13T15:00:00',
            location: 'Các phòng học nhỏ'
          }
        ]
      });
    } else {
      programs.push({
        programId: i,
        id: i,
        title: titles[i % titles.length],
        description: descriptions[i % descriptions.length],
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        location: locations[i % locations.length],
        organizerName: `Đơn vị tổ chức ${i}`,
        type: types[i % types.length],
        status: statuses[i % statuses.length],
        targetAudience: i % 2 === 0 ? 'Học sinh, sinh viên' : 'Cộng đồng',
        participantCount: participantCount,
        feedbackCount: feedbackCount,
        interactionCount: interactionCount,
        averageRating: (Math.random() * 2 + 3).toFixed(1),
        createdAt: createdAt.toISOString(),
        updatedAt: new Date().toISOString(),
        finalAverageRating: (Math.random() * 2 + 3).toFixed(1),
        budget: Math.floor(Math.random() * 50000000) + 5000000,
        currency: 'VND'
      });
    }
  }

  return programs;
};

// Mock feedbacks
const createMockFeedbacks = (programs, userCount = 20) => {
  const feedbacks = [];
  const contents = [
    'Chương trình rất bổ ích và thú vị.',
    'Tôi học được nhiều điều mới từ chương trình này.',
    'Người hướng dẫn rất nhiệt tình và chuyên nghiệp.',
    'Nội dung chương trình phù hợp với nhu cầu của tôi.',
    'Rất hài lòng với chương trình, hy vọng có thêm nhiều chương trình tương tự.',
    'Tổ chức chương trình rất chuyên nghiệp.',
    'Chương trình có một số điểm cần cải thiện.'
  ];

  let feedbackId = 1;
  
  programs.forEach(program => {
    // Tạo feedback cho mỗi chương trình
    const feedbackCount = program.feedbackCount || Math.floor(Math.random() * 20) + 5;
    
    for (let i = 0; i < feedbackCount; i++) {
      const userId = Math.floor(Math.random() * userCount) + 1;
      const rating = Math.floor(Math.random() * 5) + 1;
      
      feedbacks.push({
        id: feedbackId,
        feedbackId: feedbackId,
        programId: program.programId,
        userId: userId,
        rating: rating,
        content: contents[Math.floor(Math.random() * contents.length)],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      feedbackId++;
    }
  });
  
  return feedbacks;
};

// Cache cho dữ liệu mock để đảm bảo tính nhất quán giữa các lần gọi
let mockCache = {
  programs: null,
  feedbacks: null,
  joinedPrograms: {} // userId -> [programId]
};

// Khởi tạo dữ liệu nếu chưa có
const initMockData = () => {
  if (!mockCache.programs) {
    mockCache.programs = createMockPrograms();
  }
  
  if (!mockCache.feedbacks) {
    mockCache.feedbacks = createMockFeedbacks(mockCache.programs);
  }
};

export const mockCommunicationApi = {
  // Get overview
  getOverview: async () => {
    initMockData();
    
    // Lọc chương trình đang hoạt động
    const activePrograms = mockCache.programs.filter(p => p.status === 'ACTIVE');
    
    // Tính điểm đánh giá trung bình
    let totalRating = 0;
    let ratingCount = 0;
    mockCache.programs.forEach(p => {
      if (p.averageRating) {
        totalRating += parseFloat(p.averageRating);
        ratingCount++;
      }
    });
    const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;
    
    // Sắp xếp và lấy 3 chương trình gần đây
    const recentPrograms = [...mockCache.programs]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
      
    // Sắp xếp và lấy chương trình sắp diễn ra
    const upcomingPrograms = [...activePrograms]
      .filter(p => new Date(p.startDate) > new Date())
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 2);
      
    // Tính tổng số người tham gia
    const totalParticipants = mockCache.programs.reduce((sum, p) => sum + p.participantCount, 0);
    
    return {
      activePrograms: activePrograms.length,
      totalParticipants: totalParticipants,
      averageFeedbackRating: averageRating,
      recentPrograms: recentPrograms,
      upcomingPrograms: upcomingPrograms
    };
  },
  
  // Get program by ID
  getProgramById: async (programId) => {
    initMockData();
    
    // Tìm chương trình theo ID
    const program = mockCache.programs.find(p => p.programId == programId);
    
    if (program) {
      return program;
    }
    
    // Nếu không tìm thấy, tạo một chương trình mẫu
    return {
      programId: parseInt(programId),
      id: parseInt(programId),
      title: `Chương trình #${programId}`,
      description: `Mô tả chi tiết cho chương trình #${programId}. Đây là một chương trình giả lập được tạo khi không tìm thấy chương trình với ID tương ứng.`,
      participantCount: 45 + (parseInt(programId) * 5),
      interactionCount: 120 + (parseInt(programId) * 10),
      averageRating: 4.2,
      feedbackCount: 30 + (parseInt(programId) * 3),
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
      status: 'ACTIVE',
      location: 'Trực tuyến',
      createdAt: new Date(new Date().setDate(new Date().getDate() - 60)).toISOString(),
      updatedAt: new Date().toISOString(),
      finalAverageRating: 4.5
    };
  },
  
  // Check join status
  checkJoinStatus: async (programId, userId) => {
    initMockData();
    
    // Khởi tạo danh sách chương trình đã tham gia cho người dùng nếu chưa có
    if (!mockCache.joinedPrograms[userId]) {
      // Tạo ngẫu nhiên một số chương trình đã tham gia
      mockCache.joinedPrograms[userId] = mockCache.programs
        .filter(() => Math.random() > 0.5)
        .map(p => p.programId);
    }
    
    // Kiểm tra xem người dùng đã tham gia chương trình chưa
    return mockCache.joinedPrograms[userId].includes(parseInt(programId));
  },
  
  // Get participant count
  getParticipantCount: async (programId) => {
    initMockData();
    
    const program = mockCache.programs.find(p => p.programId == programId);
    return program ? program.participantCount : 45 + (parseInt(programId) * 5);
  },
  
  // Get all programs
  getPrograms: async (params = {}) => {
    initMockData();
    
    let filteredPrograms = [...mockCache.programs];
    
    // Áp dụng bộ lọc nếu có
    if (params.status) {
      filteredPrograms = filteredPrograms.filter(p => p.status === params.status);
    }
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredPrograms = filteredPrograms.filter(p => 
        p.title.toLowerCase().includes(searchLower) || 
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Áp dụng sắp xếp
    if (params.sort) {
      const [field, order] = params.sort.split(',');
      
      filteredPrograms.sort((a, b) => {
        if (field === 'startDate') {
          return order === 'asc' 
            ? new Date(a.startDate) - new Date(b.startDate)
            : new Date(b.startDate) - new Date(a.startDate);
        }
        
        if (field === 'title') {
          return order === 'asc'
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        }
        
        return 0;
      });
    }
    
    // Phân trang
    const page = params.page || 0;
    const size = params.size || 10;
    const start = page * size;
    const end = start + size;
    const paginatedPrograms = filteredPrograms.slice(start, end);
    
    return {
      content: paginatedPrograms,
      pageable: {
        pageNumber: page,
        pageSize: size
      },
      totalElements: filteredPrograms.length,
      totalPages: Math.ceil(filteredPrograms.length / size)
    };
  },
  
  // Get user joined programs
  getUserJoinedPrograms: async (userId) => {
    initMockData();
    
    // Khởi tạo danh sách chương trình đã tham gia cho người dùng nếu chưa có
    if (!mockCache.joinedPrograms[userId]) {
      // Tạo ngẫu nhiên một số chương trình đã tham gia
      mockCache.joinedPrograms[userId] = mockCache.programs
        .filter(() => Math.random() > 0.5)
        .map(p => p.programId);
    }
    
    // Trả về danh sách chương trình đã tham gia
    return mockCache.joinedPrograms[userId].map(programId => ({
      programId,
      joinedAt: new Date().toISOString()
    }));
  },
  
  // Join program
  joinProgram: async (programId, userId) => {
    initMockData();
    
    // Khởi tạo danh sách chương trình đã tham gia cho người dùng nếu chưa có
    if (!mockCache.joinedPrograms[userId]) {
      mockCache.joinedPrograms[userId] = [];
    }
    
    // Thêm chương trình vào danh sách đã tham gia
    if (!mockCache.joinedPrograms[userId].includes(parseInt(programId))) {
      mockCache.joinedPrograms[userId].push(parseInt(programId));
    }
    
    return { success: true, message: 'Successfully joined program' };
  },
  
  // Submit feedback
  submitFeedback: async (programId, feedbackData, userId) => {
    initMockData();
    
    // Tạo ID mới cho feedback
    const newFeedbackId = mockCache.feedbacks.length + 1;
    
    // Tạo feedback mới
    const newFeedback = {
      id: newFeedbackId,
      feedbackId: newFeedbackId,
      programId: parseInt(programId),
      userId: userId,
      rating: feedbackData.rating,
      content: feedbackData.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Thêm feedback mới vào danh sách
    mockCache.feedbacks.push(newFeedback);
    
    // Cập nhật thông tin chương trình
    const program = mockCache.programs.find(p => p.programId == programId);
    if (program) {
      program.feedbackCount = (program.feedbackCount || 0) + 1;
      
      // Cập nhật điểm đánh giá trung bình
      const programFeedbacks = mockCache.feedbacks.filter(f => f.programId == programId);
      const totalRating = programFeedbacks.reduce((sum, f) => sum + f.rating, 0);
      program.averageRating = (totalRating / programFeedbacks.length).toFixed(1);
    }
    
    return newFeedback;
  },
  
  // Get feedback by ID
  getFeedbackById: async (feedbackId) => {
    initMockData();
    
    const feedback = mockCache.feedbacks.find(f => f.feedbackId == feedbackId);
    
    if (feedback) {
      return feedback;
    }
    
    // Nếu không tìm thấy, tạo một feedback mẫu
    return {
      id: parseInt(feedbackId),
      feedbackId: parseInt(feedbackId),
      programId: Math.floor(Math.random() * 10) + 1,
      userId: Math.floor(Math.random() * 100) + 1,
      rating: Math.floor(Math.random() * 5) + 1,
      content: 'Đây là nội dung phản hồi mẫu.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },
  
  // Get all feedbacks
  getAllFeedbacks: async (params = {}) => {
    initMockData();
    
    let filteredFeedbacks = [...mockCache.feedbacks];
    
    // Áp dụng bộ lọc nếu có
    if (params.programId) {
      filteredFeedbacks = filteredFeedbacks.filter(f => f.programId == params.programId);
    }
    
    if (params.userId) {
      filteredFeedbacks = filteredFeedbacks.filter(f => f.userId == params.userId);
    }
    
    // Phân trang
    const page = params.page || 0;
    const size = params.size || 10;
    const start = page * size;
    const end = start + size;
    const paginatedFeedbacks = filteredFeedbacks.slice(start, end);
    
    return {
      content: paginatedFeedbacks,
      pageable: {
        pageNumber: page,
        pageSize: size
      },
      totalElements: filteredFeedbacks.length,
      totalPages: Math.ceil(filteredFeedbacks.length / size)
    };
  },
  
  // Get user feedback for all programs
  getUserFeedbackForAllPrograms: async (userId) => {
    initMockData();
    
    // Lọc phản hồi của người dùng
    const userFeedbacks = mockCache.feedbacks.filter(f => f.userId == userId);
    
    // Tạo map programId -> feedback
    const feedbackMap = {};
    userFeedbacks.forEach(feedback => {
      feedbackMap[feedback.programId] = feedback;
    });
    
    return feedbackMap;
  },
  
  // Update feedback
  updateFeedback: async (feedbackId, feedbackData, userId) => {
    initMockData();
    
    // Tìm feedback cần cập nhật
    const feedbackIndex = mockCache.feedbacks.findIndex(f => f.feedbackId == feedbackId);
    
    if (feedbackIndex !== -1) {
      // Cập nhật feedback
      mockCache.feedbacks[feedbackIndex] = {
        ...mockCache.feedbacks[feedbackIndex],
        ...feedbackData,
        updatedAt: new Date().toISOString()
      };
      
      // Cập nhật thông tin chương trình
      const programId = mockCache.feedbacks[feedbackIndex].programId;
      const program = mockCache.programs.find(p => p.programId == programId);
      
      if (program) {
        // Cập nhật điểm đánh giá trung bình
        const programFeedbacks = mockCache.feedbacks.filter(f => f.programId == programId);
        const totalRating = programFeedbacks.reduce((sum, f) => sum + f.rating, 0);
        program.averageRating = (totalRating / programFeedbacks.length).toFixed(1);
      }
      
      return mockCache.feedbacks[feedbackIndex];
    }
    
    // Nếu không tìm thấy, tạo một feedback mới
    return await mockCommunicationApi.submitFeedback(
      feedbackData.programId || 1, 
      feedbackData, 
      userId || 1
    );
  },
  
  // Delete feedback
  deleteFeedback: async (feedbackId) => {
    initMockData();
    
    // Tìm feedback cần xóa
    const feedbackIndex = mockCache.feedbacks.findIndex(f => f.feedbackId == feedbackId);
    
    if (feedbackIndex !== -1) {
      // Lưu thông tin chương trình trước khi xóa
      const programId = mockCache.feedbacks[feedbackIndex].programId;
      
      // Xóa feedback
      mockCache.feedbacks.splice(feedbackIndex, 1);
      
      // Cập nhật thông tin chương trình
      const program = mockCache.programs.find(p => p.programId == programId);
      
      if (program) {
        program.feedbackCount = Math.max(0, (program.feedbackCount || 0) - 1);
        
        // Cập nhật điểm đánh giá trung bình
        const programFeedbacks = mockCache.feedbacks.filter(f => f.programId == programId);
        
        if (programFeedbacks.length > 0) {
          const totalRating = programFeedbacks.reduce((sum, f) => sum + f.rating, 0);
          program.averageRating = (totalRating / programFeedbacks.length).toFixed(1);
        } else {
          program.averageRating = 0;
        }
      }
    }
    
    return { success: true, message: 'Feedback deleted successfully' };
  }
};
