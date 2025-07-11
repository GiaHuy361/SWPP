import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaUsers, FaCalendarAlt, FaFile } from 'react-icons/fa';
import { communicationApi } from '../../../services/communicationApi';

const CommunicationProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!id) {
      setError('ID chương trình không hợp lệ');
      setLoading(false);
      return;
    }
    
    fetchProgramDetails();
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
      
      // Fetch program details
      const programData = await communicationApi.getProgramById(id);
      setProgram(programData);
      console.log("API response data:", programData);
      
    } catch (err) {
      setError('Không thể tải thông tin chương trình');
      console.error('Error fetching program details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không có thông tin';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    // Đảm bảo status là string và chuyển thành chữ hoa
    const statusUpper = String(status || '').toUpperCase();
    
    const statusMap = {
      'ACTIVE': { color: 'bg-green-100 text-green-800', text: 'Hoạt động' },
      'INACTIVE': { color: 'bg-gray-100 text-gray-800', text: 'Tạm dừng' },
      'COMPLETED': { color: 'bg-blue-100 text-blue-800', text: 'Hoàn thành' },
      'DRAFT': { color: 'bg-yellow-100 text-yellow-800', text: 'Bản nháp' },
      'PENDING': { color: 'bg-orange-100 text-orange-800', text: 'Chờ duyệt' },
      'CANCELLED': { color: 'bg-red-100 text-red-800', text: 'Đã hủy' }
    };
    
    const statusInfo = statusMap[statusUpper] || { 
      color: 'bg-gray-100 text-gray-800', 
      text: status || 'Không xác định' 
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  const handleBack = () => {
    navigate('/admin/communication/programs');
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
          onClick={fetchProgramDetails}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Không tìm thấy chương trình</p>
        <button 
          onClick={handleBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Quay lại
        </button>
      </div>
    );
  }

  // Xác định dữ liệu nào thực sự tồn tại trong API response
  const hasParticipantCount = program.participantCount !== undefined;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft />
            Quay lại
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{program.title}</h1>
          {program.status && getStatusBadge(program.status)}
        </div>
        <Link
          to={`/admin/communication/programs/${id}/edit`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaEdit />
          Chỉnh sửa
        </Link>
      </div>

      {/* Stats Cards - Chỉ hiển thị nếu có dữ liệu */}
      {hasParticipantCount && (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng tham gia</p>
                <p className="text-2xl font-bold text-blue-600">{program.participantCount || 0}</p>
              </div>
              <FaUsers className="text-blue-600 text-2xl" />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className="py-4 px-1 border-b-2 font-medium text-sm border-blue-500 text-blue-600"
            >
              <FaFile className="inline mr-2" />
              Thông tin chương trình
            </button>
          </nav>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Thông tin chương trình</h3>
                <div className="space-y-3">
                  {program.id && (
                    <div>
                      <span className="text-sm text-gray-600">ID chương trình:</span>
                      <p className="font-medium">{program.id}</p>
                    </div>
                  )}
                  
                  {program.createdAt && (
                    <div>
                      <span className="text-sm text-gray-600">Ngày tạo:</span>
                      <p className="font-medium">{formatDate(program.createdAt)}</p>
                    </div>
                  )}
                  
                  {program.updatedAt && (
                    <div>
                      <span className="text-sm text-gray-600">Ngày cập nhật:</span>
                      <p className="font-medium">{formatDate(program.updatedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Thời gian</h3>
                <div className="space-y-3">
                  {program.startDate && (
                    <div>
                      <span className="text-sm text-gray-600">Bắt đầu:</span>
                      <p className="font-medium flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-400" />
                        {formatDate(program.startDate)}
                      </p>
                    </div>
                  )}
                  
                  {program.endDate && (
                    <div>
                      <span className="text-sm text-gray-600">Kết thúc:</span>
                      <p className="font-medium flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-400" />
                        {formatDate(program.endDate)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {program.description && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Mô tả</h3>
                <p className="text-gray-700 leading-relaxed">{program.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationProgramDetail;
