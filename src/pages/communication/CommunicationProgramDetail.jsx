import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaFile, FaComments, FaStar, FaCheck, FaHeart } from 'react-icons/fa';
import { communicationApi } from '../../services/communicationApi';
import { useAuth } from '../../context/AuthContext';
import { LoadingPage, LoadingButton } from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';

const CommunicationProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [fetchingProgram, setFetchingProgram] = useState(false);
  const [error, setError] = useState('');
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('ID chương trình không hợp lệ');
      setLoading(false);
      return;
    }
    
    if (id) {
      fetchProgramDetails();
    }
  }, [id]);

  const fetchProgramDetails = async () => {
    if (!id) {
      setError('ID chương trình không hợp lệ');
      setLoading(false);
      return;
    }
    
    if (fetchingProgram) return;
    
    try {
      setFetchingProgram(true);
      setLoading(true);
      setError('');
      
      const programData = await communicationApi.getProgramById(id);
      setProgram(programData);
      
      console.log('Program data loaded:', programData);
      console.log('User:', user);
      console.log('Program participants:', programData.participants);
      
      // Check if user has already joined
      if (user) {
        let hasUserJoined = false;
        
        // First check participants array if available
        if (programData.participants) {
          hasUserJoined = programData.participants.some(p => {
            console.log('Checking participant:', p, 'against user ID:', user.userId);
            return p.userId === user.userId || p.id === user.userId;
          });
        }
        
        // If no participants or not found, check via API
        if (!hasUserJoined) {
          try {
            hasUserJoined = await communicationApi.checkJoinStatus(id, user.userId);
            console.log('Join status from API:', hasUserJoined);
          } catch (apiError) {
            console.log('Could not check join status from API:', apiError);
          }
        }
        
        console.log('Final has user joined:', hasUserJoined);
        setHasJoined(hasUserJoined);
      }
      
    } catch (err) {
      console.error('Error fetching program details:', err);
      setError('Không thể tải thông tin chương trình');
      toast.error('Không thể tải thông tin chương trình');
    } finally {
      setLoading(false);
      setFetchingProgram(false);
    }
  };

  const handleJoinProgram = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để tham gia chương trình');
      navigate('/login');
      return;
    }

    if (!id) {
      toast.error('ID chương trình không hợp lệ');
      return;
    }

    if (joining) return;

    try {
      setJoining(true);
      console.log('Joining program with ID:', id, 'User ID:', user?.userId);
      
      const result = await communicationApi.joinProgram(id);
      console.log('Join program result:', result);
      
      setHasJoined(true);
      
      // Update program data to reflect join status
      setProgram(prevProgram => ({
        ...prevProgram,
        participantCount: (prevProgram.participantCount || 0) + 1,
        participants: prevProgram.participants ? 
          [...prevProgram.participants, { userId: user?.userId, userName: user?.fullName }] :
          [{ userId: user?.userId, userName: user?.fullName }]
      }));
      
      toast.success('Tham gia chương trình thành công! Vui lòng kiểm tra email để nhận thông tin chi tiết.');
      
      // No need to refresh program details since we updated the state correctly
      console.log('Program joined successfully, state updated');
      
    } catch (err) {
      console.error('Error joining program:', err);
      const errorMessage = err.response?.data?.message || 'Không thể tham gia chương trình';
      toast.error(errorMessage);
    } finally {
      setJoining(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    // Đảm bảo status không null và chuyển về chữ hoa để so sánh
    const normalizedStatus = status ? status.toUpperCase() : '';
    
    const statusMap = {
      'ACTIVE': { color: 'bg-green-100 text-green-800', text: 'Đang diễn ra' },
      'INACTIVE': { color: 'bg-gray-100 text-gray-800', text: 'Tạm dừng' },
      'COMPLETED': { color: 'bg-blue-100 text-blue-800', text: 'Hoàn thành' },
      'DRAFT': { color: 'bg-yellow-100 text-yellow-800', text: 'Bản nháp' },
      'PENDING': { color: 'bg-orange-100 text-orange-800', text: 'Chờ duyệt' },
      'CANCELLED': { color: 'bg-red-100 text-red-800', text: 'Đã hủy' }
    };
    
    const statusInfo = statusMap[normalizedStatus] || { 
      color: 'bg-gray-100 text-gray-800', 
      text: status || 'Không xác định' 
    };
    
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  const renderStars = (rating) => {
    if (!rating || rating === 0) return <span className="text-gray-400 text-sm">Chưa có đánh giá</span>;
    
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, index) => (
          <FaStar
            key={index}
            className={`text-lg ${index < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-2 text-lg font-semibold text-gray-700">{rating.toFixed(1)}/5</span>
      </div>
    );
  };

  if (loading) {
    return <LoadingPage message="Đang tải thông tin chương trình..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate('/communication')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-600 text-lg">Không tìm thấy chương trình</p>
          <button
            onClick={() => navigate('/communication')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-4"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/communication')}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FaArrowLeft className="text-lg" />
              <span>Quay lại</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Chi tiết chương trình</h1>
          </div>
          
          {/* Join Button */}
          {isAuthenticated && !hasJoined && (
            <LoadingButton
              loading={joining}
              onClick={handleJoinProgram}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              <FaHeart className="mr-2" />
              Tham gia chương trình
            </LoadingButton>
          )}
          
          {hasJoined && (
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
              <FaCheck className="text-green-600" />
              <span className="font-semibold">Đã tham gia</span>
            </div>
          )}
        </div>

        {/* Program Details */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Program Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-4xl font-bold mb-4">{program.title}</h2>
                <p className="text-xl text-blue-100 mb-6">{program.description}</p>
                
                {/* Program Stats */}
                <div className="flex items-center space-x-8 text-blue-100">
                  <div className="flex items-center space-x-2">
                    <FaUsers className="text-lg" />
                    <span>{program.participantCount || 0} người tham gia</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="text-lg" />
                    <span>{formatDate(program.startDate)} - {formatDate(program.endDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaMapMarkerAlt className="text-lg" />
                    <span>{program.location || 'Online'}</span>
                  </div>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="flex-shrink-0 ml-6">
                {getStatusBadge(program.status)}
              </div>
            </div>
          </div>

          {/* Program Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Program Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Thông tin chương trình</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <FaCalendarAlt className="text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-800">Thời gian</p>
                        <p className="text-gray-600">{formatDate(program.startDate)} - {formatDate(program.endDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaMapMarkerAlt className="text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-800">Địa điểm</p>
                        <p className="text-gray-600">{program.location || 'Online'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaUsers className="text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-800">Số lượng tham gia</p>
                        <p className="text-gray-600">{program.participantCount || 0} người</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaStar className="text-yellow-500" />
                      <div>
                        <p className="font-medium text-gray-800">Đánh giá</p>
                        <div className="flex items-center gap-2">
                          {renderStars(program.averageRating || program.finalAverageRating)}
                          {(program.feedbackCount > 0) && (
                            <span className="text-sm text-gray-500">({program.feedbackCount} phản hồi)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Program Content */}
                {program.content && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Nội dung chương trình</h3>
                    <div className="prose max-w-none">
                      <div 
                        className="text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: program.content }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Statistics & Actions */}
              <div className="space-y-6">
                {/* Statistics */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Thống kê</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{program.participantCount || 0}</div>
                      <div className="text-sm text-gray-600">Người tham gia</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">{program.feedbackCount || 0}</div>
                      <div className="text-sm text-gray-600">Phản hồi</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">{program.interactionCount || 0}</div>
                      <div className="text-sm text-gray-600">Tương tác</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center space-x-1 text-3xl font-bold text-yellow-600 mb-2">
                        <span>{program.averageRating || 0}</span>
                        <FaStar className="text-yellow-400 text-xl" />
                      </div>
                      <div className="text-sm text-gray-600">Đánh giá</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Hành động</h3>
                  <div className="space-y-3">
                    {!isAuthenticated ? (
                      <div className="text-center">
                        <p className="text-gray-600 mb-4">Vui lòng đăng nhập để tham gia chương trình</p>
                        <Link
                          to="/login"
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                        >
                          Đăng nhập
                        </Link>
                      </div>
                    ) : hasJoined ? (
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 text-green-600 mb-4">
                          <FaCheck className="text-xl" />
                          <span className="font-semibold">Bạn đã tham gia chương trình này</span>
                        </div>
                        <div className="space-y-2">
                          <Link
                            to={`/communication/programs/${id}/feedback/create`}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block"
                          >
                            <FaComments className="mr-2" />
                            Gửi phản hồi
                          </Link>
                          <br />
                          <Link
                            to="/communication/feedback"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                          >
                            Xem tất cả phản hồi
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <LoadingButton
                          loading={joining}
                          onClick={handleJoinProgram}
                          className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold w-full"
                        >
                          <FaHeart className="mr-2" />
                          Tham gia chương trình
                        </LoadingButton>
                        <p className="text-sm text-gray-600 mt-2">
                          Tham gia để nhận thông tin và cập nhật về chương trình
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Related Files */}
                {program.attachments && program.attachments.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Tài liệu đính kèm</h3>
                    <div className="space-y-2">
                      {program.attachments.map((file, index) => (
                        <div key={index} className="flex items-center space-x-3 p-2 bg-white rounded-lg">
                          <FaFile className="text-blue-600" />
                          <span className="flex-1 text-gray-700">{file.name}</span>
                          <button className="text-blue-600 hover:text-blue-800">
                            Tải xuống
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationProgramDetail;
