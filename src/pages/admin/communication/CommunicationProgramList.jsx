import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaEye, FaCalendarAlt, FaFilter, FaComments } from 'react-icons/fa';
import { communicationApi } from '../../../services/communicationApi';

const CommunicationProgramList = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    page: 0,
    size: 10
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    fetchPrograms();
    fetchOverview();
  }, [filters]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await communicationApi.getPrograms(filters);
      
      if (response.content) {
        setPrograms(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } else {
        setPrograms(response);
      }
    } catch (err) {
      setError('Không thể tải danh sách chương trình truyền thông');
      console.error('Error fetching programs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async () => {
    try {
      const overviewData = await communicationApi.getOverview();
      setOverview(overviewData);
    } catch (err) {
      console.warn('Could not fetch overview:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      alert('ID chương trình không hợp lệ');
      return;
    }
    
    if (window.confirm('Bạn có chắc chắn muốn xóa chương trình này?')) {
      try {
        await communicationApi.deleteProgram(id);
        fetchPrograms();
        fetchOverview(); // Cập nhật overview sau khi xóa
      } catch (err) {
        alert('Không thể xóa chương trình: ' + err.message);
      }
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 0 // Reset to first page when filtering
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

  const getStatusBadge = (status) => {
    // Đảm bảo status không null và chuyển về chữ hoa để so sánh
    const normalizedStatus = status ? status.toUpperCase() : '';
    
    const statusMap = {
      'ACTIVE': { color: 'bg-green-100 text-green-800', text: 'Hoạt động' },
      'INACTIVE': { color: 'bg-gray-100 text-gray-800', text: 'Tạm dừng' },
      'COMPLETED': { color: 'bg-blue-100 text-blue-800', text: 'Hoàn thành' },
      'DRAFT': { color: 'bg-yellow-100 text-yellow-800', text: 'Bản nháp' },
      'PENDING': { color: 'bg-orange-100 text-orange-800', text: 'Đang chờ' },
      'CANCELLED': { color: 'bg-red-100 text-red-800', text: 'Đã hủy' }
    };
    
    const statusInfo = statusMap[normalizedStatus] || { color: 'bg-gray-100 text-gray-800', text: status || 'Không xác định' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchPrograms}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý chương trình truyền thông</h1>
        <Link 
          to="/admin/communication/programs/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaPlus /> Tạo chương trình mới
        </Link>
      </div>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-500">Tổng chương trình</div>
            <div className="text-2xl font-bold text-blue-600">{overview.totalPrograms}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-500">Đang triển khai</div>
            <div className="text-2xl font-bold text-green-600">{overview.activePrograms}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-500">Tổng tham gia</div>
            <div className="text-2xl font-bold text-purple-600">{overview.totalParticipants}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-500">Tổng tương tác</div>
            <div className="text-2xl font-bold text-orange-600">{overview.totalInteractions || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-500">Điểm TB chung</div>
            <div className="text-2xl font-bold text-yellow-600">
              {overview.averageRating ? `${overview.averageRating.toFixed(1)}/5` : 'N/A'} ⭐
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Bộ lọc:</span>
          </div>
          
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên chương trình..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Tạm dừng</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="DRAFT">Bản nháp</option>
          </select>
          
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

      {/* Programs List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chương trình
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tham gia / Tương tác
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phản hồi / Điểm TB
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {programs.map((program, index) => (
                <tr key={program.programId || program.id || `program-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{program.title}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">{program.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(program.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt className="text-gray-400" />
                      <span>{formatDate(program.startDate)} - {formatDate(program.endDate)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <FaUsers className="text-gray-400" />
                        <span>{program.participantCount || 0} tham gia</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {program.interactionCount || 0} tương tác
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <FaComments className="text-gray-400" />
                        <span>{program.feedbackCount || 0} phản hồi</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {program.averageRating ? `${program.averageRating.toFixed(1)}/5 ⭐` : 'Chưa có đánh giá'}
                        {program.finalAverageRating && (
                          <span className="ml-1 text-blue-600">
                            (Cuối: {program.finalAverageRating.toFixed(1)}/5)
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        to={(program.programId || program.id) ? `/admin/communication/programs/${program.programId || program.id}` : '#'}
                        className={`${(program.programId || program.id) ? 'text-blue-600 hover:text-blue-900' : 'text-gray-400 cursor-not-allowed'}`}
                        title={(program.programId || program.id) ? "Xem chi tiết" : "ID không hợp lệ"}
                        onClick={(e) => {
                          if (!program.programId && !program.id) {
                            e.preventDefault();
                            alert('ID chương trình không hợp lệ');
                          }
                        }}
                      >
                        <FaEye />
                      </Link>
                      <Link
                        to={(program.programId || program.id) ? `/admin/communication/programs/${program.programId || program.id}/edit` : '#'}
                        className={`${(program.programId || program.id) ? 'text-green-600 hover:text-green-900' : 'text-gray-400 cursor-not-allowed'}`}
                        title={(program.programId || program.id) ? "Chỉnh sửa" : "ID không hợp lệ"}
                        onClick={(e) => {
                          if (!program.programId && !program.id) {
                            e.preventDefault();
                            alert('ID chương trình không hợp lệ');
                          }
                        }}
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => {
                          if (program.programId || program.id) {
                            handleDelete(program.programId || program.id);
                          } else {
                            alert('ID chương trình không hợp lệ');
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                        disabled={!(program.programId || program.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {programs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Không có chương trình truyền thông nào.</p>
            <Link 
              to="/admin/communication/programs/create"
              className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Tạo chương trình đầu tiên
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(Math.max(0, filters.page - 1))}
                  disabled={filters.page === 0}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  onClick={() => handlePageChange(Math.min(totalPages - 1, filters.page + 1))}
                  disabled={filters.page >= totalPages - 1}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị{' '}
                    <span className="font-medium">{filters.page * filters.size + 1}</span>
                    {' '}-{' '}
                    <span className="font-medium">
                      {Math.min((filters.page + 1) * filters.size, totalElements)}
                    </span>
                    {' '}trong{' '}
                    <span className="font-medium">{totalElements}</span>
                    {' '}kết quả
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(Math.max(0, filters.page - 1))}
                      disabled={filters.page === 0}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Trước
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + Math.max(0, filters.page - 2);
                      if (pageNum >= totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === filters.page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages - 1, filters.page + 1))}
                      disabled={filters.page >= totalPages - 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Sau
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationProgramList;
