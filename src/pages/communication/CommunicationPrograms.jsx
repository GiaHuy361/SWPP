import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { communicationApi } from '../../services/communicationApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaEye, FaUserPlus, FaSearch, FaFilter, FaSort, FaStar } from 'react-icons/fa';

const CommunicationPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  });

  const navigate = useNavigate();
  const { user } = useAuth();

  const canViewPrograms = user?.permissions?.includes('VIEW_PROGRAMS');
  const canManagePrograms = user?.permissions?.includes('MANAGE_PROGRAMS');

  useEffect(() => {
    if (canViewPrograms) {
      fetchPrograms();
    } else {
      setError('Bạn không có quyền xem chương trình truyền thông');
      setLoading(false);
    }
  }, [canViewPrograms, pagination.page, pagination.size, sortBy, sortOrder]); // Đã xóa statusFilter khỏi dependency

  // Đã xóa useEffect searchTerm

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        size: pagination.size,
        sort: `${sortBy},${sortOrder}`
      };

      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await communicationApi.getPrograms(params);
      
      if (response.content) {
        // Paginated response
        const programsWithJoinStatus = await Promise.all(
          response.content.map(async (program) => {
            let hasJoined = false;
            
            // First check participants array if available
            if (program.participants) {
              hasJoined = program.participants.some(p => p.userId === user?.userId);
            }
            
            // If no participants or not found, check via API
            if (!hasJoined && user) {
              try {
                hasJoined = await communicationApi.checkJoinStatus(program.id, user.userId);
              } catch (apiError) {
                console.log('Could not check join status for program:', program.id, apiError);
              }
            }
            
            return {
              ...program,
              hasJoined
            };
          })
        );
        
        setPrograms(programsWithJoinStatus);
        setPagination({
          page: response.number,
          size: response.size,
          totalElements: response.totalElements,
          totalPages: response.totalPages
        });
      } else if (Array.isArray(response)) {
        // Simple array response
        const programsWithJoinStatus = await Promise.all(
          response.map(async (program) => {
            let hasJoined = false;
            
            // First check participants array if available
            if (program.participants) {
              hasJoined = program.participants.some(p => p.userId === user?.userId);
            }
            
            // If no participants or not found, check via API
            if (!hasJoined && user) {
              try {
                hasJoined = await communicationApi.checkJoinStatus(program.id, user.userId);
              } catch (apiError) {
                console.log('Could not check join status for program:', program.id, apiError);
              }
            }
            
            return {
              ...program,
              hasJoined
            };
          })
        );
        
        setPrograms(programsWithJoinStatus);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      setError('Có lỗi xảy ra khi tải danh sách chương trình');
      toast.error('Có lỗi xảy ra khi tải danh sách chương trình');
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
      setPrograms(prevPrograms => 
        prevPrograms.map(program => 
          program.id === programId 
            ? { 
                ...program, 
                hasJoined: true, 
                participantCount: (program.participantCount || 0) + 1,
                // Add current user to participants list if it exists
                participants: program.participants ? 
                  [...program.participants, { userId: user?.userId, userName: user?.fullName }] :
                  [{ userId: user?.userId, userName: user?.fullName }]
              }
            : program
        )
      );
      
      // No need to refresh the full list since we updated the state correctly
      console.log('Program joined successfully, state updated');
    } catch (error) {
      console.error('Error joining program:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tham gia chương trình';
      toast.error(errorMessage);
    }
  };

  const handleSearch = (e) => {
    // Đã xóa handleSearch
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPagination(prev => ({ ...prev, page: 0 }));
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
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  const getStatusBadgeClass = (status) => {
    const normalizedStatus = status?.toUpperCase();
    
    switch (normalizedStatus) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PENDING':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    const normalizedStatus = status?.toUpperCase();
    
    switch (normalizedStatus) {
      case 'ACTIVE':
        return 'Đang hoạt động';
      case 'INACTIVE':
        return 'Tạm dừng';
      case 'COMPLETED':
        return 'Đã hoàn thành';
      case 'DRAFT':
        return 'Bản nháp';
      case 'PENDING':
        return 'Chờ duyệt';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status || 'Không xác định';
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
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}/5</span>
      </div>
    );
  };

  if (!canViewPrograms) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Truy cập bị từ chối</h2>
          <p className="text-gray-600">Bạn không có quyền xem chương trình truyền thông.</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chương trình truyền thông</h1>
              <p className="text-gray-600">Khám phá và tham gia các chương trình truyền thông</p>
            </div>
            {canManagePrograms && (
              <div className="mt-4 md:mt-0">
                <button
                  onClick={() => navigate('/admin/communication/programs/create')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                >
                  <FaUserPlus className="w-4 h-4" />
                  Tạo chương trình
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Đã xóa filter UI */}

        {/* Programs List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <div key={program.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{program.title}</h3>
                  {getStatusBadge(program.status)}
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">{program.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Ngày bắt đầu:</span>
                    <span>{formatDate(program.startDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Ngày kết thúc:</span>
                    <span>{formatDate(program.endDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Số người tham gia:</span>
                    <span>{program.participantCount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Đánh giá:</span>
                    <div>{renderStars(program.averageRating || program.finalAverageRating)}</div>
                  </div>
                  {(program.feedbackCount > 0) && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Số phản hồi:</span>
                      <span>{program.feedbackCount} phản hồi</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/communication/programs/${program.id}`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2"
                  >
                    <FaEye className="w-4 h-4" />
                    Xem chi tiết
                  </button>
                  
                  {(program.status?.toUpperCase() === 'ACTIVE' || program.status?.toLowerCase() === 'active') && !program.hasJoined && (
                    <button
                      onClick={() => handleJoinProgram(program.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                    >
                      <FaUserPlus className="w-4 h-4" />
                      Tham gia
                    </button>
                  )}
                  
                  {program.hasJoined && (
                    <button
                      onClick={() => navigate(`/communication/programs/${program.id}/feedback/create`)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                    >
                      <FaStar className="w-4 h-4" />
                      Đánh giá
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {programs.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📢</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có chương trình nào</h3>
            <p className="text-gray-600">Hiện tại chưa có chương trình truyền thông nào. Hãy quay lại sau!</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị {pagination.page * pagination.size + 1} - {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} trong tổng số {pagination.totalElements} chương trình
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
                  disabled={pagination.page === 0}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-md">
                  {pagination.page + 1}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages - 1, prev.page + 1) }))}
                  disabled={pagination.page >= pagination.totalPages - 1}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationPrograms;
