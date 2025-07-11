import React, { useState, useEffect } from 'react';
import { communicationApi } from '../services/communicationApi';
import { useAuth } from '../context/AuthContext';
import { FaCalendar, FaEye, FaStar, FaClock, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CommunicationOverview = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Sửa lại kiểm tra quyền cho phù hợp với context thực tế
  const canViewPrograms = user?.permissions?.includes('VIEW_PROGRAMS');

  useEffect(() => {
    if (canViewPrograms) {
      fetchOverview();
    } else {
      setLoading(false);
    }
  }, [canViewPrograms]);

  const fetchOverview = async () => {
    try {
      const response = await communicationApi.getOverview();
      setOverview(response);
    } catch (error) {
      console.error('Error fetching communication overview:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!canViewPrograms || loading) {
    return null;
  }

  if (!overview) {
    return null;
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-2 rounded-full">
            <FaCalendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">Chương trình truyền thông</h3>
            <div className="text-sm text-blue-700">
              <span className="font-medium">{overview.activeProgramsCount || overview.activePrograms}</span> chương trình đang triển khai
              {overview.totalPrograms > 0 && (
                <span className="ml-2">
                  • <span className="font-medium">{overview.totalParticipants}</span> người tham gia
                  • <span className="font-medium">{overview.totalFeedbacks}</span> phản hồi
                  {overview.averageRating && (
                    <span className="ml-2 flex items-center gap-1">
                      • <FaStar className="w-3 h-3 text-yellow-500" />
                      <span className="font-medium">{parseFloat(overview.averageRating).toFixed(1)}/5</span>
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/communication/programs')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2 text-sm"
        >
          <FaEye className="w-4 h-4" />
          Xem tất cả
        </button>
      </div>

      {/* Upcoming Programs */}
      {overview.upcomingPrograms && overview.upcomingPrograms.length > 0 && (
        <div className="mt-2">
          <h4 className="font-medium text-blue-800 text-sm mb-2">Sắp diễn ra:</h4>
          <div className="grid grid-cols-1 gap-2">
            {overview.upcomingPrograms.map((program) => (
              <div 
                key={program.programId || program.id}
                className="bg-white p-3 rounded-md border border-blue-100 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/communication/programs/${program.programId || program.id}`)}
              >
                <div className="text-blue-800 font-medium">{program.title}</div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaClock className="w-3 h-3 mr-1" />
                    {formatDate(program.startDate)}
                  </div>
                  {program.registeredCount && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FaUsers className="w-3 h-3 mr-1" />
                      {program.registeredCount} người đăng ký
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Programs */}
      {overview.recentPrograms && overview.recentPrograms.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-blue-800 text-sm mb-2">Gần đây:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {overview.recentPrograms.map((program) => (
              <div 
                key={program.programId || program.id}
                className="bg-white p-3 rounded-md border border-blue-100 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/communication/programs/${program.programId || program.id}`)}
              >
                <div className="text-blue-800 font-medium truncate">{program.title}</div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaUsers className="w-3 h-3 mr-1" />
                    {program.participantCount || 0}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaStar className="w-3 h-3 mr-1 text-yellow-500" />
                    {(program.averageRating || 0).toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationOverview;
