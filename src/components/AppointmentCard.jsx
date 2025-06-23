import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

function AppointmentCard({ appointment, onStatusChange, canCancel = false }) {
  // Format thời gian lịch hẹn
  const formatAppointmentTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const { date, time } = formatAppointmentTime(appointment.appointmentTime);
  
  // Xác định màu sắc dựa trên trạng thái lịch hẹn
  const statusColors = {
    PENDING: {
      bg: 'bg-yellow-50',
      badge: 'bg-yellow-200 text-yellow-800',
      text: 'Chờ xác nhận'
    },
    CONFIRMED: {
      bg: 'bg-green-50',
      badge: 'bg-green-200 text-green-800',
      text: 'Đã xác nhận'
    },
    CANCELLED: {
      bg: 'bg-red-50',
      badge: 'bg-red-200 text-red-800',
      text: 'Đã hủy'
    },
    COMPLETED: {
      bg: 'bg-purple-50',
      badge: 'bg-purple-200 text-purple-800',
      text: 'Đã hoàn thành'
    }
  };
  
  const statusStyle = statusColors[appointment.status] || { bg: 'bg-gray-50', badge: 'bg-gray-200 text-gray-800', text: 'Không xác định' };
  
  // Xác định người dùng hiển thị (tư vấn viên hoặc người đặt lịch)
  const displayUser = appointment.isConsultant ? appointment.user : appointment.consultant.user;
  const displayRole = appointment.isConsultant ? 'Người đặt lịch' : 'Tư vấn viên';
  const displaySpecialization = appointment.isConsultant ? '' : appointment.consultant.specialization;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className={`p-4 ${statusStyle.bg}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center uppercase font-bold text-lg mr-3">
              {displayUser.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{displayUser.fullName}</h3>
              <p className="text-sm text-gray-600">
                {displayRole}{displaySpecialization && ` - ${displaySpecialization}`}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyle.badge}`}>
            {statusStyle.text}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <h4 className="font-medium text-gray-700">Thời gian:</h4>
          <div className="flex items-center mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{date}</span>
          </div>
          <div className="flex items-center mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{time}</span>
          </div>
        </div>
        
        {appointment.description && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-700">Mô tả:</h4>
            <p className="text-gray-600 text-sm mt-1">{appointment.description}</p>
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          {appointment.status === 'PENDING' && canCancel && (
            <button
              onClick={() => onStatusChange(appointment.id, 'CANCELLED')}
              className="px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 transition-colors"
            >
              Hủy lịch
            </button>
          )}
          <Link
            to={`/appointments/${appointment.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}

AppointmentCard.propTypes = {
  appointment: PropTypes.shape({
    id: PropTypes.string.isRequired,
    appointmentTime: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    description: PropTypes.string,
    user: PropTypes.object.isRequired,
    consultant: PropTypes.shape({
      user: PropTypes.object.isRequired,
      specialization: PropTypes.string
    }),
    isConsultant: PropTypes.bool.isRequired
  }).isRequired,
  onStatusChange: PropTypes.func.isRequired,
  canCancel: PropTypes.bool
};

export default AppointmentCard;