import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaSearch, FaFilter, FaEye, FaComments } from 'react-icons/fa';
import { communicationApi } from '../../services/communicationApi';
import { AuthContext } from '../../context/AuthContext';

const CommunicationProgramListUser = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: 'ACTIVE',
    page: 0,
    size: 12
  });
  const [totalPages, setTotalPages] = useState(0);
  // Add user context
  const { user } = useContext(AuthContext);
  // Track user join status for each program
  const [userJoinStatuses, setUserJoinStatuses] = useState({});
  // Track programs with user feedback
  const [userFeedbacks, setUserFeedbacks] = useState({});

  useEffect(() => {
    fetchPrograms();
  }, [filters]);
  
  // Cập nhật lại trạng thái tham gia khi user thay đổi
  useEffect(() => {
    if (programs.length > 0 && user) {
      updateProgramsWithJoinStatus(programs);
    }
  }, [user]);

  // Function to fetch accurate participant counts for all programs
  const updateProgramsWithAccurateCounts = async (programList) => {
    if (!programList || programList.length === 0) return programList;
    
    try {
      // Create a copy of the programs to update
      const updatedPrograms = [...programList];
      
      // Fetch participant counts in parallel for all programs
      const countPromises = updatedPrograms.map(program => {
        const programId = program.programId || program.id;
        if (!programId) return Promise.resolve(null);
        
        return communicationApi.getParticipantCount(programId)
          .then(count => ({ programId, count }))
          .catch(err => {
            console.error(`Error fetching count for program ${programId}:`, err);
            return { programId, count: null };
          });
      });
      
      // Wait for all counts to be fetched
      const counts = await Promise.all(countPromises);
      
      // Update each program with its accurate count
      counts.forEach(item => {
        if (item && item.count !== null) {
          const programToUpdate = updatedPrograms.find(p => 
            (p.programId === item.programId) || (p.id === item.programId)
          );
          
          if (programToUpdate) {
            console.log(`Updating count for program ${item.programId}: ${programToUpdate.participantCount} -> ${item.count}`);
            programToUpdate.participantCount = item.count;
          }
        }
      });
      
      return updatedPrograms;
    } catch (error) {
      console.error('Error updating programs with accurate counts:', error);
      return programList;
    }
  };

  // Function to fetch join status for all programs for the current user
  const updateProgramsWithJoinStatus = async (programList) => {
    if (!user || !programList || programList.length === 0) return;
    
    try {
      console.log('Cập nhật trạng thái tham gia cho người dùng:', user.id);
      
      // Khởi tạo giá trị mặc định cho tất cả chương trình (chưa tham gia)
      const joinStatusMap = {};
      const feedbackMap = {};
      
      // Bước 1: Lấy tất cả chương trình mà người dùng đã tham gia từ API
      console.log('Đang lấy danh sách chương trình đã tham gia từ API...');
      let joinedProgramIds = [];
      try {
        joinedProgramIds = await communicationApi.getUserJoinedPrograms(user.id);
        console.log('User joined program IDs from API:', joinedProgramIds);
      } catch (error) {
        console.error('Error fetching joined programs, will try localStorage fallback:', error);
        
        // Fallback to localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith(`program_`) && (key.endsWith(`_joined_${user.id}`) || key.endsWith('_joined'))) {
            const match = key.match(/program_(\d+)_joined/);
            if (match && match[1]) {
              joinedProgramIds.push(match[1]);
            }
          }
        }
        console.log('User joined program IDs from localStorage:', joinedProgramIds);
      }
      
      // Bước 2: Lấy tất cả phản hồi mà người dùng đã gửi cho bất kỳ chương trình nào
      console.log('Đang lấy danh sách đánh giá của người dùng cho tất cả chương trình...');
      let userFeedbackMap = {};
      try {
        userFeedbackMap = await communicationApi.getUserFeedbackForAllPrograms(user.id);
        console.log('User feedback map:', userFeedbackMap);
      } catch (error) {
        console.error('Error fetching user feedback:', error);
      }
      
      // Step 3: Map join status and feedback info to each program
      programList.forEach(program => {
        const programId = program.programId || program.id;
        if (programId) {
          // Kiểm tra xem ID chương trình có trong danh sách đã tham gia không
          joinStatusMap[programId] = joinedProgramIds.includes(programId.toString());
          
          // Kiểm tra xem người dùng đã đánh giá cho chương trình này chưa
          feedbackMap[programId] = !!userFeedbackMap[programId];
          
          // Nếu người dùng đã đánh giá, thì chắc chắn họ đã tham gia
          if (feedbackMap[programId] && !joinStatusMap[programId]) {
            console.log(`Chương trình ${programId}: Người dùng đã đánh giá nhưng không có trong danh sách tham gia, đang sửa trạng thái tham gia`);
            joinStatusMap[programId] = true;
          }
          
          // Lưu trạng thái tham gia vào localStorage để sử dụng offline
          if (joinStatusMap[programId]) {
            localStorage.setItem(`program_${programId}_joined_${user.id}`, 'true');
            localStorage.setItem(`program_${programId}_joined`, 'true');
            console.log(`Chương trình ${programId}: Đã lưu trạng thái tham gia vào localStorage`);
          }
          
          // Log thông tin để debug
          if (joinStatusMap[programId]) {
            console.log(`Chương trình ${programId}: Người dùng đã tham gia`);
            if (feedbackMap[programId]) {
              console.log(`Chương trình ${programId}: Người dùng đã gửi đánh giá`);
            }
          }
        }
      });
      
      // Bước 4: Cập nhật state với thông tin mới
      setUserJoinStatuses(joinStatusMap);
      setUserFeedbacks(feedbackMap);
      
      console.log('Bản đồ trạng thái tham gia cuối cùng:', joinStatusMap);
      console.log('Bản đồ trạng thái đánh giá cuối cùng:', feedbackMap);
      
    } catch (error) {
      console.error('Lỗi chung khi cập nhật trạng thái tham gia chương trình:', error);
      
      // Trong trường hợp lỗi, sử dụng localStorage làm dữ liệu dự phòng
      console.log('Sử dụng dữ liệu từ localStorage làm dự phòng cho trạng thái tham gia');
      const fallbackJoinStatusMap = {};
      const fallbackFeedbackMap = {};
      
      programList.forEach(program => {
        const programId = program.programId || program.id;
        if (programId) {
          // Kiểm tra từ localStorage
          const cachedJoinStatus = localStorage.getItem(`program_${programId}_joined_${user.id}`);
          const genericCachedStatus = localStorage.getItem(`program_${programId}_joined`);
          const cachedFeedback = localStorage.getItem(`program_${programId}_feedback_${user.id}`);
          
          fallbackJoinStatusMap[programId] = cachedJoinStatus === 'true' || genericCachedStatus === 'true';
          
          // Kiểm tra xem có dữ liệu về đánh giá trong localStorage không
          fallbackFeedbackMap[programId] = cachedFeedback === 'true';
        }
      });
      
      setUserJoinStatuses(fallbackJoinStatusMap);
      setUserFeedbacks(fallbackFeedbackMap);
    }
  };

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await communicationApi.getPrograms(filters);
      
      console.log('Programs response:', response); // Debug log
      
      let programList = [];
      if (response.content) {
        console.log('Programs content:', response.content); // Debug log
        programList = response.content;
        setTotalPages(response.totalPages);
      } else {
        console.log('Programs direct:', response); // Debug log
        programList = response;
      }
      
      // Update programs with accurate participant counts
      const updatedPrograms = await updateProgramsWithAccurateCounts(programList);
      setPrograms(updatedPrograms);
      
      // Update with user's join status for each program
      if (user) {
        await updateProgramsWithJoinStatus(updatedPrograms);
      }
    } catch (err) {
      setError('Không thể tải danh sách chương trình');
      console.error('Error fetching programs:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Hàm xử lý tham gia chương trình ngay từ danh sách
  const handleJoinProgram = async (programId, event) => {
    event.preventDefault(); // Ngăn chặn chuyển trang
    
    if (!user) {
      alert('Vui lòng đăng nhập để tham gia chương trình');
      return;
    }
    
    try {
      console.log(`Đang tham gia chương trình ${programId} cho người dùng ${user.id}...`);
      
      // Hiển thị trạng thái đã tham gia ngay lập tức (UX tốt hơn)
      setUserJoinStatuses(prev => ({
        ...prev,
        [programId]: true
      }));
      
      // Cập nhật localStorage trước khi gọi API (để tránh lỗi nếu API chậm)
      localStorage.setItem(`program_${programId}_joined`, 'true');
      localStorage.setItem(`program_${programId}_joined_${user.id}`, 'true');
      
      // Cập nhật số người tham gia tạm thời (tăng thêm 1)
      setPrograms(currentPrograms => 
        currentPrograms.map(program => {
          if ((program.programId === programId) || (program.id === programId)) {
            const newCount = (program.participantCount || 0) + 1;
            console.log(`Cập nhật tạm thời số người tham gia: ${program.participantCount} -> ${newCount}`);
            return {
              ...program,
              participantCount: newCount
            };
          }
          return program;
        })
      );
      
      // Gọi API tham gia chương trình (sau khi đã cập nhật UI)
      const updatedProgram = await communicationApi.joinProgram(programId);
      console.log(`Tham gia chương trình ${programId} thành công:`, updatedProgram);
      
      // Lấy số người tham gia chính xác từ API
      const accurateCount = await communicationApi.getParticipantCount(programId);
      console.log(`Số người tham gia chính xác cho chương trình ${programId}: ${accurateCount}`);
      
      // Cập nhật chương trình cụ thể trong danh sách với số người tham gia chính xác
      if (accurateCount !== null) {
        setPrograms(currentPrograms => 
          currentPrograms.map(program => {
            if ((program.programId === programId) || (program.id === programId)) {
              return {
                ...program,
                participantCount: accurateCount
              };
            }
            return program;
          })
        );
      }
      
      // Thông báo thành công
      alert('Tham gia chương trình thành công!');
      
      // Tải lại thông tin về trạng thái tham gia chương trình của người dùng
      // để đảm bảo dữ liệu nhất quán
      const updatedPrograms = [...programs]; // Tạo bản sao của danh sách chương trình
      await updateProgramsWithJoinStatus(updatedPrograms);
      
    } catch (err) {
      console.error(`Lỗi khi tham gia chương trình ${programId}:`, err);
      
      // Nếu có lỗi, vẫn giữ trạng thái tham gia trong UI (đã lưu trong localStorage)
      // nhưng cập nhật lại số người tham gia từ API để đảm bảo chính xác
      try {
        const accurateCount = await communicationApi.getParticipantCount(programId);
        if (accurateCount !== null) {
          setPrograms(currentPrograms => 
            currentPrograms.map(program => {
              if ((program.programId === programId) || (program.id === programId)) {
                return {
                  ...program,
                  participantCount: accurateCount
                };
              }
              return program;
            })
          );
        }
      } catch (countErr) {
        console.error('Lỗi khi lấy số người tham gia chính xác sau lỗi tham gia:', countErr);
      }
      
      // Thông báo lỗi cho người dùng
      alert('Có lỗi xảy ra khi tham gia chương trình: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 0
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getTypeLabel = (type) => {
    const typeMap = {
      'CAMPAIGN': 'Chiến dịch',
      'WORKSHOP': 'Hội thảo',
      'SEMINAR': 'Hội nghị',
      'TRAINING': 'Đào tạo',
      'OTHER': 'Khác'
    };
    return typeMap[type] || type;
  };

  const isRegistrationOpen = (program) => {
    const now = new Date();
    const regDeadline = program.registrationDeadline ? new Date(program.registrationDeadline) : null;
    const startDate = program.startDate ? new Date(program.startDate) : null;
    
    if (regDeadline && now > regDeadline) return false;
    if (startDate && now > startDate) return false;
    
    return program.status === 'ACTIVE';
  };

  const isFull = (program) => {
    return program.maxParticipants && program.participantCount >= program.maxParticipants;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchPrograms}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Chương trình truyền thông
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tham gia các chương trình truyền thông, hội thảo, và các hoạt động cộng đồng để nâng cao hiểu biết và kết nối.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Bộ lọc:</span>
            </div>
            
            <div className="flex-1 min-w-64">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm chương trình..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả loại</option>
              <option value="CAMPAIGN">Chiến dịch</option>
              <option value="WORKSHOP">Hội thảo</option>
              <option value="SEMINAR">Hội nghị</option>
              <option value="TRAINING">Đào tạo</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
        </div>

        {/* Programs Grid */}
        {programs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Hiện tại chưa có chương trình nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {programs.map((program) => {
              const programId = program.programId || program.id;
              const hasJoined = userJoinStatuses[programId];
              const hasFeedback = userFeedbacks[programId];
              
              return (
              <div key={programId || `program-${Math.random()}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                        {program.title}
                      </h3>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {getTypeLabel(program.type)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {program.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaCalendarAlt className="mr-2" />
                      <span>{formatDate(program.startDate)} - {formatDate(program.endDate)}</span>
                    </div>
                    
                    {program.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <FaMapMarkerAlt className="mr-2" />
                        <span>{program.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <FaUsers className="mr-2" />
                      <span>
                        {program.participantCount || 0} người tham gia
                        {program.maxParticipants && (
                          <span> / {program.maxParticipants}</span>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {!isRegistrationOpen(program) && (
                        <span className="text-xs text-red-600 font-medium">
                          Hết hạn đăng ký
                        </span>
                      )}
                      {isFull(program) && (
                        <span className="text-xs text-orange-600 font-medium">
                          Đã đủ người
                        </span>
                      )}
                      {program.registrationDeadline && (
                        <span className="text-xs text-gray-500">
                          Hạn: {formatDate(program.registrationDeadline)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {/* Show buttons based on user and join status */}
                      {!user && (
                        <button
                          onClick={() => alert('Vui lòng đăng nhập để tham gia chương trình')}
                          className="px-3 py-1.5 rounded-lg text-sm bg-green-600 hover:bg-green-700 text-white"
                        >
                          Tham gia
                        </button>
                      )}
                      
                      {user && (
                        <>
                          {/* Hiển thị nút "Tham gia" nếu chưa tham gia */}
                          {!hasJoined && (
                            <button
                              onClick={(e) => handleJoinProgram(programId, e)}
                              className={`px-3 py-1.5 rounded-lg text-sm bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 ${
                                !isRegistrationOpen(program) || isFull(program) 
                                  ? 'opacity-50 cursor-not-allowed' 
                                  : ''
                              }`}
                              disabled={!isRegistrationOpen(program) || isFull(program)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                              </svg>
                              Tham gia
                            </button>
                          )}
                          
                          {/* Hiển thị nút "Gửi đánh giá" nếu đã tham gia nhưng chưa có phản hồi */}
                          {hasJoined && !hasFeedback && (
                            <Link
                              to={`/communication/programs/${programId}`}
                              className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <FaComments />
                              Gửi đánh giá
                            </Link>
                          )}
                          
                          {/* Hiển thị nút "Đã tham gia" nếu đã tham gia và đã có phản hồi */}
                          {hasJoined && hasFeedback && (
                            <Link
                              to={`/communication/programs/${programId}`}
                              className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-300" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Đã tham gia
                            </Link>
                          )}
                        </>
                      )}
                      
                      <Link
                        to={programId ? `/communication/programs/${programId}` : '#'}
                        className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                          programId
                            ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        onClick={(e) => {
                          if (!programId) {
                            e.preventDefault();
                            alert('ID chương trình không hợp lệ');
                          }
                        }}
                      >
                        <FaEye />
                        Chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(0, filters.page - 1))}
                disabled={filters.page === 0}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + Math.max(0, filters.page - 2);
                if (pageNum >= 0 && pageNum < totalPages) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 border rounded-md text-sm ${
                        filters.page === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'text-gray-700 border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                }
                return null;
              }).filter(Boolean)}
              
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page >= totalPages - 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tiếp
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationProgramListUser;
