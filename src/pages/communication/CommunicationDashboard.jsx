import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { communicationApi } from '../../services/communicationApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUsers, FaComments, FaStar, FaCalendar, FaEye, FaUserPlus, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const CommunicationDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [recentPrograms, setRecentPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  const canViewPrograms = user?.permissions?.includes('VIEW_PROGRAMS');
  const canManagePrograms = user?.permissions?.includes('MANAGE_PROGRAMS');

  useEffect(() => {
    if (canViewPrograms) {
      fetchOverview();
    } else {
      setError('Bạn không có quyền xem tổng quan chương trình');
      setLoading(false);
    }
  }, [canViewPrograms]);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await communicationApi.getOverview();
      setOverview(response);
      
      // Add hasJoined status to recent programs
      const programsWithJoinStatus = (response.recentPrograms || []).map(program => ({
        ...program,
        hasJoined: program.participants?.some(p => p.userId === user?.userId) || false
      }));
      setRecentPrograms(programsWithJoinStatus);
    } catch (error) {
      console.error('Error fetching overview:', error);
      setError('Có lỗi xảy ra khi tải tổng quan');
      toast.error('Có lỗi xảy ra khi tải tổng quan');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinProgram = async (programId) => {
    if (!programId) {
      toast.error('ID chương trình không hợp lệ');
      return;
    }
    
    try {
      console.log('Joining program:', programId, 'User:', user?.userId);
      await communicationApi.joinProgram(programId);
      toast.success('Tham gia chương trình thành công!');
      
      // Update the specific program's join status immediately and permanently
      setRecentPrograms(prevPrograms => 
        prevPrograms.map(program => 
          program.id === programId 
            ? { 
                ...program, 
                hasJoined: true, 
                participantCount: (program.participantCount || 0) + 1,
                participants: program.participants ? 
                  [...program.participants, { userId: user?.userId, userName: user?.fullName }] :
                  [{ userId: user?.userId, userName: user?.fullName }]
              }
            : program
        )
      );
      
      // No need to refresh the full data since we updated the state correctly
      console.log('Program joined successfully, state updated');
    } catch (error) {
      console.error('Error joining program:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tham gia chương trình';
      toast.error(errorMessage);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Đang hoạt động';
      case 'inactive':
        return 'Không hoạt động';
      case 'completed':
        return 'Đã hoàn thành';
      case 'pending':
        return 'Chờ duyệt';
      default:
        return status || 'Không xác định';
    }
  };

  const renderStars = (rating) => {
    if (!rating || rating === 0) return <span className="text-gray-400 text-sm">Chưa có đánh giá</span>;
    
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, index) => (
          <FaStar
            key={index}
            className={`text-sm ${index < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (!canViewPrograms) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Truy cập bị từ chối</h2>
          <p className="text-gray-600">Bạn không có quyền xem tổng quan chương trình.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tổng quan chương trình truyền thông</h1>
              <p className="text-gray-600">Theo dõi hiệu quả và tham gia của các chương trình truyền thông</p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <button
                onClick={() => navigate('/communication/programs')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
              >
                <FaEye className="w-4 h-4" />
                Xem tất cả
              </button>
              {canManagePrograms && (
                <button
                  onClick={() => navigate('/admin/communication/programs/create')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                >
                  <FaUserPlus className="w-4 h-4" />
                  Tạo chương trình
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng chương trình</p>
                <p className="text-2xl font-bold text-gray-900">{overview?.totalPrograms || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaCalendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-gray-600">
                Đang hoạt động: {overview?.activePrograms || 0}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng người tham gia</p>
                <p className="text-2xl font-bold text-gray-900">{overview?.totalParticipants || 0}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaUsers className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-gray-600">
                Tổng tương tác: {overview?.totalInteractions || 0}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng phản hồi</p>
                <p className="text-2xl font-bold text-gray-900">{overview?.totalFeedbacks || 0}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FaComments className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-gray-600">
                Trung bình mỗi chương trình: {overview?.totalPrograms > 0 ? Math.round(overview.totalFeedbacks / overview.totalPrograms) : 0}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đánh giá trung bình</p>
                <div className="flex items-center gap-2 mt-1">
                  {overview?.averageRating ? (
                    <>
                      <p className="text-2xl font-bold text-gray-900">{overview.averageRating.toFixed(1)}</p>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }, (_, index) => (
                          <FaStar
                            key={index}
                            className={`text-lg ${index < Math.round(overview.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-2xl font-bold text-gray-400">Chưa có</p>
                  )}
                </div>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FaStar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-gray-600">
                {overview?.averageRating >= 4 ? 'Rất tốt' : overview?.averageRating >= 3 ? 'Tốt' : overview?.averageRating >= 2 ? 'Trung bình' : overview?.averageRating ? 'Cần cải thiện' : 'Chưa có đánh giá'}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Programs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Chương trình gần đây</h2>
            <button
              onClick={() => navigate('/communication/programs')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              Xem tất cả
            </button>
          </div>

          {recentPrograms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentPrograms.map((program) => (
                <div key={program.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-medium text-gray-900 line-clamp-1">{program.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(program.status)}`}>
                      {getStatusText(program.status)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{program.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Người tham gia:</span>
                      <span>{program.participantCount || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Phản hồi:</span>
                      <span>{program.feedbackCount || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Đánh giá:</span>
                      <div>{renderStars(program.averageRating || program.finalAverageRating)}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/communication/programs/${program.id}`)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center justify-center gap-1"
                    >
                      <FaEye className="w-3 h-3" />
                      Xem
                    </button>
                    
                    {program.status?.toLowerCase() === 'active' && (
                      <button
                        onClick={() => handleJoinProgram(program.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                      >
                        <FaUserPlus className="w-3 h-3" />
                        Tham gia
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">📢</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có chương trình nào</h3>
              <p className="text-gray-600">Hiện tại chưa có chương trình truyền thông nào.</p>
              {canManagePrograms && (
                <button
                  onClick={() => navigate('/admin/communication/programs/create')}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Tạo chương trình đầu tiên
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/communication/programs')}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg transition-colors text-left"
            >
              <FaEye className="w-6 h-6 mb-2" />
              <div className="font-medium">Xem tất cả chương trình</div>
              <div className="text-sm text-blue-600">Danh sách đầy đủ</div>
            </button>
            
            <button
              onClick={() => navigate('/communication/feedback')}
              className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 p-4 rounded-lg transition-colors text-left"
            >
              <FaComments className="w-6 h-6 mb-2" />
              <div className="font-medium">Xem tất cả phản hồi</div>
              <div className="text-sm text-yellow-600">Phản hồi từ người dùng</div>
            </button>
            
            <button
              onClick={() => navigate('/communication/programs')}
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg transition-colors text-left"
            >
              <FaStar className="w-6 h-6 mb-2" />
              <div className="font-medium">Thêm phản hồi mới</div>
              <div className="text-sm text-purple-600">Đánh giá chương trình</div>
            </button>
            
            <button
              onClick={fetchOverview}
              className="bg-gray-50 hover:bg-gray-100 text-gray-700 p-4 rounded-lg transition-colors text-left"
            >
              <FaArrowUp className="w-6 h-6 mb-2" />
              <div className="font-medium">Làm mới dữ liệu</div>
              <div className="text-sm text-gray-600">Cập nhật thông tin</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationDashboard;
