import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock, FaCheck, FaTimes, FaComments, FaStar } from 'react-icons/fa';
import { communicationApi } from '../../services/communicationApi';
import { AuthContext } from '../../context/AuthContext';

const CommunicationProgramDetailUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [program, setProgram] = useState(null);
  const [participationStatus, setParticipationStatus] = useState(null);
  const [userFeedback, setUserFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    content: ''
  });

  useEffect(() => {
    if (id) {
      fetchProgramDetails();
    } else {
      setError('ID chương trình không hợp lệ');
      setLoading(false);
    }
  }, [id]);

  const fetchProgramDetails = async () => {
    if (!id) {
      setError('ID chương trình không hợp lệ');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      if (user) {
        try {
          // Sử dụng API mới để lấy cả dữ liệu chương trình và trạng thái tham gia/phản hồi
          const data = await communicationApi.reloadProgramWithStatus(id, user.id);
          setProgram(data.program);
          setParticipationStatus(data.participationStatus);
          setUserFeedback(data.userFeedback);
          
          // Kiểm tra thêm từ localStorage nếu API trả về false
          if (!data.participationStatus.joined) {
            const cachedJoinStatus = localStorage.getItem(`program_${id}_joined_${user.id}`);
            const genericCachedStatus = localStorage.getItem(`program_${id}_joined`);
            
            if (cachedJoinStatus === 'true' || genericCachedStatus === 'true') {
              console.log('Found cached join status, overriding to joined=true');
              setParticipationStatus({ joined: true });
              
              // Đảm bảo số người tham gia khớp
              if (data.program && data.program.participantCount === 0) {
                const updatedProgram = {...data.program, participantCount: 1};
                console.log('Fixed participant count from 0 to 1');
                setProgram(updatedProgram);
              }
            }
          }
          
          // Kiểm tra nếu đã có feedback thì chắc chắn đã tham gia
          if (data.userFeedback) {
            console.log('User has feedback, setting joined=true');
            setParticipationStatus({ joined: true });
            
            // Đảm bảo số người tham gia khớp
            if (data.program && data.program.participantCount === 0) {
              const updatedProgram = {...data.program, participantCount: 1};
              console.log('Fixed participant count from 0 to 1 (feedback check)');
              setProgram(updatedProgram);
            }
          }
          
          // Fetch accurate participant count from the dedicated endpoint
          fetchAccurateParticipantCount();
          
          console.log('Program detail loaded with status:', {
            program: data.program,
            joined: data.participationStatus.joined,
            hasFeedback: !!data.userFeedback,
            participantCount: data.program?.participantCount
          });
        } catch (err) {
          console.error("Error loading full program data:", err);
          
          // Fallback to separate API calls
          const programData = await communicationApi.getProgramById(id);
          setProgram(programData);
          
          // Kiểm tra trạng thái tham gia
          try {
            const hasJoined = await communicationApi.checkJoinStatus(id, user.id);
            setParticipationStatus({ joined: hasJoined });
          } catch (statusErr) {
            console.error("Error checking participation status:", statusErr);
            setParticipationStatus({ joined: false });
          }
          
          // Kiểm tra phản hồi user
          try {
            const feedback = await communicationApi.checkUserFeedback(id, user.id);
            setUserFeedback(feedback);
            if (feedback) setParticipationStatus({ joined: true });
          } catch (fbErr) {
            console.error("Error checking user feedback:", fbErr);
            setUserFeedback(null);
          }
        }
      } else {
        // Không có user, chỉ lấy thông tin chương trình
        const programData = await communicationApi.getProgramById(id);
        setProgram(programData);
      }
      
    } catch (err) {
      setError('Không thể tải thông tin chương trình');
      console.error('Error fetching program details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccurateParticipantCount = async () => {
    if (!id) return;
    
    try {
      console.log('Fetching accurate participant count...');
      const count = await communicationApi.getParticipantCount(id);
      
      if (count !== null) {
        console.log(`Updating participant count from accurate source: ${count}`);
        setProgram(prevProgram => {
          if (!prevProgram) return null;
          return {
            ...prevProgram,
            participantCount: count
          };
        });
      }
    } catch (error) {
      console.error('Error fetching accurate participant count:', error);
    }
  };

  const handleJoinProgram = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để tham gia chương trình');
      return;
    }

    try {
      setJoinLoading(true);
      
      // Log trạng thái trước khi tham gia
      console.log('Before joining - Current program:', program);
      console.log('Before joining - Participation status:', participationStatus);
      
      // Gọi API tham gia và lấy thông tin cập nhật mới nhất
      const updatedProgram = await communicationApi.joinProgram(id);
      
      // Đảm bảo số người tham gia được tăng lên
      if (updatedProgram.participantCount === 0 || 
          (program && updatedProgram.participantCount <= program.participantCount)) {
        console.log('Fixing participant count manually');
        updatedProgram.participantCount = (program ? program.participantCount : 0) + 1;
      }
      
      // Cache trạng thái tham gia vào localStorage
      localStorage.setItem(`program_${id}_joined_${user.id}`, 'true');
      localStorage.setItem(`program_${id}_joined`, 'true');
      
      // Cập nhật trạng thái đã tham gia
      setParticipationStatus({ joined: true });
      
      // Cập nhật dữ liệu chương trình (số người tham gia đã tăng)
      setProgram(updatedProgram);
      
      console.log('After join - Updated program:', updatedProgram);
      console.log('After join - Participation status:', { joined: true });
      
      alert('Tham gia chương trình thành công!');
      
      // Fetch accurate participant count after joining
      fetchAccurateParticipantCount();
      
      // Reload lại toàn bộ dữ liệu để đảm bảo đồng bộ
      setTimeout(() => {
        fetchProgramDetails();
      }, 1000);
    } catch (err) {
      alert('Có lỗi xảy ra khi tham gia chương trình: ' + (err.response?.data?.message || err.message));
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeaveProgram = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn rời khỏi chương trình này?')) {
      return;
    }

    try {
      setJoinLoading(true);
      await communicationApi.leaveProgram(id);
      
      // Refresh participation status
      setParticipationStatus(null);
      
      // Remove cached join status
      localStorage.removeItem(`program_${id}_joined_${user.id}`);
      localStorage.removeItem(`program_${id}_joined`);
      
      // Fetch accurate participant count after leaving
      fetchAccurateParticipantCount();
      
      // Refresh program data to update participant count
      const programData = await communicationApi.getProgramById(id);
      setProgram(programData);
      
      alert('Đã rời khỏi chương trình thành công!');
    } catch (err) {
      alert('Có lỗi xảy ra khi rời khỏi chương trình: ' + (err.response?.data?.message || err.message));
    } finally {
      setJoinLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    
    if (!feedbackData.content.trim()) {
      alert('Vui lòng nhập nội dung phản hồi');
      return;
    }

    if (!user?.id) {
      alert('Không thể xác định người dùng. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      if (isEditingFeedback && userFeedback) {
        // Update existing feedback
        const updatedFeedback = await communicationApi.updateFeedback(userFeedback.id, feedbackData, user.userId);
        setUserFeedback(updatedFeedback);
        alert('Cập nhật phản hồi thành công!');
      } else {
        // Create new feedback
        const newFeedback = await communicationApi.submitFeedback(id, feedbackData, user.userId);
        setUserFeedback(newFeedback);
        
        // Đánh dấu là đã tham gia vì đã gửi phản hồi
        setParticipationStatus({ joined: true });
        localStorage.setItem(`program_${id}_joined_${user.id}`, 'true');
        
        alert('Gửi phản hồi thành công!');
      }
      
      // Fetch accurate participant count
      fetchAccurateParticipantCount();
      
      // Reload chi tiết chương trình để cập nhật số liệu
      fetchProgramDetails();
      
      setShowFeedbackModal(false);
      setIsEditingFeedback(false);
      setFeedbackData({ rating: 5, content: '' });
    } catch (err) {
      alert('Có lỗi xảy ra khi gửi phản hồi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditFeedback = () => {
    if (userFeedback) {
      setFeedbackData({
        rating: userFeedback.rating || 5,
        content: userFeedback.content || ''
      });
      setIsEditingFeedback(true);
      setShowFeedbackModal(true);
    }
  };

  const handleDeleteFeedback = async () => {
    if (!userFeedback || !window.confirm('Bạn có chắc chắn muốn xóa phản hồi này?')) {
      return;
    }

    try {
      await communicationApi.deleteFeedback(userFeedback.id);
      setUserFeedback(null);
      alert('Xóa phản hồi thành công!');
    } catch (err) {
      alert('Có lỗi xảy ra khi xóa phản hồi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateFeedback = () => {
    setFeedbackData({ rating: 5, content: '' });
    setIsEditingFeedback(false);
    setShowFeedbackModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const isProgramCompleted = (program) => {
    const now = new Date();
    const endDate = program.endDate ? new Date(program.endDate) : null;
    return endDate && now > endDate;
  };

  const handleBack = () => {
    navigate('/communication/programs');
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
              onClick={fetchProgramDetails}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <p className="text-gray-600">Không tìm thấy chương trình</p>
            <button 
              onClick={handleBack}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Quay lại
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
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-white"
          >
            <FaArrowLeft />
            Quay lại
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">{program.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                      {getTypeLabel(program.type)}
                    </span>
                    {program.targetAudience && (
                      <span>Dành cho: {program.targetAudience}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaCalendarAlt className="text-blue-600" />
                  <span>
                    <strong>Thời gian:</strong> {formatDate(program.startDate)} - {formatDate(program.endDate)}
                  </span>
                </div>
                
                {program.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaMapMarkerAlt className="text-blue-600" />
                    <span><strong>Địa điểm:</strong> {program.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-gray-600">
                  <FaUsers className="text-blue-600" />
                  <span>
                    <strong>Tham gia:</strong> {program.participantCount || 0}
                    {program.maxParticipants && ` / ${program.maxParticipants}`} người
                  </span>
                </div>
                
                {program.registrationDeadline && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaClock className="text-blue-600" />
                    <span><strong>Hạn đăng ký:</strong> {formatDate(program.registrationDeadline)}</span>
                  </div>
                )}
              </div>

              <div className="prose max-w-none">
                <h2 className="text-lg font-semibold mb-3">Mô tả chương trình</h2>
                <p className="text-gray-700 mb-4">{program.description}</p>

                {program.objectives && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Mục tiêu</h3>
                    <p className="text-gray-700">{program.objectives}</p>
                  </div>
                )}

                {program.requirements && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Yêu cầu tham gia</h3>
                    <p className="text-gray-700">{program.requirements}</p>
                  </div>
                )}

                {program.materials && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Tài liệu và vật tư</h3>
                    <p className="text-gray-700">{program.materials}</p>
                  </div>
                )}

                {program.contactInfo && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Thông tin liên hệ</h3>
                    <p className="text-gray-700">{program.contactInfo}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Tham gia chương trình</h2>
              
              {/* Debug info (Chỉ hiển thị trong development) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                  <p>Debug: Participation status: {JSON.stringify(participationStatus)}</p>
                  <p>Feedback: {userFeedback ? 'Có' : 'Không'}</p>
                  <p>Participant count: {program.participantCount}</p>
                </div>
              )}
              
              {/* Participation Status */}
              {participationStatus && participationStatus.joined ? (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <FaCheck />
                    <span className="font-medium">Đã tham gia</span>
                  </div>
                  {participationStatus.joinDate && (
                    <p className="text-sm text-gray-600">
                      Ngày tham gia: {formatDate(participationStatus.joinDate)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <FaTimes />
                    <span>Chưa tham gia</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Nút Tham gia - chỉ hiển thị khi chưa tham gia */}
                {(!participationStatus || !participationStatus.joined) && (
                  <button
                    onClick={handleJoinProgram}
                    disabled={joinLoading || !isRegistrationOpen(program) || isFull(program) || !user}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      joinLoading || !isRegistrationOpen(program) || isFull(program) || !user
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {joinLoading ? 'Đang xử lý...' : 'Tham gia chương trình'}
                  </button>
                )}

                {/* Nút Rời khỏi - chỉ hiển thị khi đã tham gia */}
                {participationStatus && participationStatus.joined && (
                  <button
                    onClick={handleLeaveProgram}
                    disabled={joinLoading}
                    className="w-full py-3 px-4 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {joinLoading ? 'Đang xử lý...' : 'Rời khỏi chương trình'}
                  </button>
                )}

                {/* Phần đánh giá - chỉ hiển thị khi đã tham gia */}
                {participationStatus && participationStatus.joined && (
                  <div className="space-y-2">
                    {userFeedback ? (
                      <div className="space-y-2">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            Bạn đã gửi phản hồi cho chương trình này
                          </p>
                          <div className="mt-2">
                            <div className="flex items-center gap-1 text-sm">
                              <span>Đánh giá:</span>
                              {[...Array(5)].map((_, i) => (
                                <FaStar 
                                  key={i} 
                                  className={i < (userFeedback.rating || 0) ? 'text-yellow-500' : 'text-gray-300'} 
                                />
                              ))}
                            </div>
                            <p className="text-sm mt-1">{userFeedback.content}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleEditFeedback}
                            className="flex-1 py-2 px-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 text-sm"
                          >
                            Chỉnh sửa
                          </button>
                          <button
                            onClick={handleDeleteFeedback}
                            className="flex-1 py-2 px-3 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 text-sm"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleCreateFeedback}
                        className="w-full py-3 px-4 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <FaComments />
                        Gửi phản hồi
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Status Messages */}
              {!user && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Vui lòng đăng nhập để tham gia chương trình
                  </p>
                </div>
              )}

              {!isRegistrationOpen(program) && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    Đã hết hạn đăng ký hoặc chương trình đã bắt đầu
                  </p>
                </div>
              )}

              {isFull(program) && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    Chương trình đã đủ số lượng tham gia
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {isEditingFeedback ? 'Chỉnh sửa phản hồi' : 'Gửi phản hồi'}
            </h2>
            
            <form onSubmit={handleSubmitFeedback}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đánh giá
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackData(prev => ({ ...prev, rating: star }))}
                      className={`text-2xl ${
                        star <= feedbackData.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      <FaStar />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung phản hồi
                </label>
                <textarea
                  value={feedbackData.content}
                  onChange={(e) => setFeedbackData(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Chia sẻ trải nghiệm của bạn về chương trình..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {isEditingFeedback ? 'Cập nhật' : 'Gửi phản hồi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationProgramDetailUser;
