import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AppointmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [meetLink, setMeetLink] = useState('');
  
  // Fetch thông tin chi tiết lịch hẹn
  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        setLoading(true);
        // Thay thế bằng API call thực tế
        const response = await fetch(`/appointments/${id}`);
        if (!response.ok) {
          throw new Error('Không thể tải thông tin lịch hẹn');
        }
        const data = await response.json();
        setAppointment(data);
        setMeetLink(data.meetLink || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchAppointmentDetails();
    }
  }, [id]);
  
  // Format thời gian
  const formatAppointmentTime = (dateTimeString) => {
    if (!dateTimeString) return { date: '', time: '', fullDateTime: '' };
    
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      fullDateTime: new Date(dateTimeString).toISOString()
    };
  };
  
  // Xác định trạng thái lịch hẹn
  const getStatusInfo = (status) => {
    const statusMap = {
      PENDING: { text: 'Chờ xác nhận', color: 'bg-yellow-200 text-yellow-800' },
      CONFIRMED: { text: 'Đã xác nhận', color: 'bg-green-200 text-green-800' },
      CANCELLED: { text: 'Đã hủy', color: 'bg-red-200 text-red-800' },
      COMPLETED: { text: 'Đã hoàn thành', color: 'bg-purple-200 text-purple-800' }
    };
    return statusMap[status] || { text: 'Không xác định', color: 'bg-gray-200 text-gray-800' };
  };
  
  // Xử lý cập nhật meetLink
  const handleUpdateMeetLink = async () => {
    if (!meetLink.trim()) {
      setError('Vui lòng nhập đường dẫn Google Meet');
      return;
    }
    
    try {
      // Thay thế bằng API call thực tế
      const response = await fetch(`/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetLink: meetLink
        }),
      });
      
      if (!response.ok) {
        throw new Error('Cập nhật link meet thất bại');
      }
      
      setAppointment({ ...appointment, meetLink });
      setSuccessMessage('Đã cập nhật đường dẫn Google Meet thành công');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };
  
  // Xử lý hoàn thành lịch hẹn
  const handleCompleteAppointment = async () => {
    try {
      // Thay thế bằng API call thực tế
      const response = await fetch(`/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'COMPLETED'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Cập nhật trạng thái thất bại');
      }
      
      setAppointment({ ...appointment, status: 'COMPLETED' });
      setSuccessMessage('Đã đánh dấu lịch hẹn là đã hoàn thành');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };
  
  // Hiển thị trạng thái tải
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  
  // Hiển thị lỗi khi không tìm thấy lịch hẹn
  if (!appointment && !loading) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          Không tìm thấy thông tin lịch hẹn. Lịch hẹn có thể đã bị xóa hoặc bạn không có quyền truy cập.
        </div>
        <div className="flex justify-center">
          <Link to="/my-appointments" className="px-5 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors">
            Quay lại danh sách lịch hẹn
          </Link>
        </div>
      </div>
    );
  }
  
  const { date, time, fullDateTime } = formatAppointmentTime(appointment.appointmentTime);
  const statusInfo = getStatusInfo(appointment.status);
  const isConsultant = user && (user.role === 'Consultant' || user.role === 'Admin' || user.role === 'Staff');
  
  // Xác định người dùng hiển thị (tư vấn viên hoặc người đặt lịch)
  const client = appointment.user;
  const consultant = appointment.consultant.user;
  
  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="flex items-center gap-4 mb-6">
        <Link 
          to={isConsultant ? "/manage-appointments" : "/my-appointments"}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Chi tiết lịch hẹn</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
          {statusInfo.text}
        </span>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
          {successMessage}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-lg font-semibold text-gray-900 mb-1">Thời gian lịch hẹn</div>
              <div className="text-gray-600">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {date}
                </div>
                <div className="flex items-center mt-1">
                  <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {time}
                </div>
              </div>
              
              {appointment.meetLink && (
                <a
                  href={appointment.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center text-blue-600 hover:text-blue-800"
                >
                  <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Tham gia cuộc họp
                </a>
              )}
            </div>
            
            {/* Thêm vào lịch */}
            <a
              href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Lịch hẹn tư vấn&dates=${fullDateTime?.replace(/[-:]/g, '').replace('.000Z', 'Z')}/${new Date(new Date(appointment.appointmentTime).getTime() + 60*60*1000).toISOString().replace(/[-:]/g, '').replace('.000Z', 'Z')}&details=Lịch hẹn tư vấn với ${isConsultant ? client.fullName : consultant.fullName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-50 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-100 flex items-center"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Thêm vào Google Calendar
            </a>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {/* Thông tin tư vấn viên */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tư vấn viên</h2>
            <div className="flex items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center uppercase font-bold text-lg mr-3">
                {consultant.fullName.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-lg">{consultant.fullName}</div>
                <div className="text-gray-600">{appointment.consultant.specialization}</div>
                <div className="text-gray-500 text-sm mt-1">{consultant.email}</div>
              </div>
            </div>
            {isConsultant && appointment.status === 'CONFIRMED' && (
              <div className="mt-4">
                <div className="font-medium text-gray-800 mb-2">Link Google Meet</div>
                <div className="flex items-center">
                  <input
                    type="text"
                    className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={meetLink}
                    onChange={(e) => setMeetLink(e.target.value)}
                    placeholder="Nhập đường dẫn Google Meet..."
                  />
                  <button
                    onClick={handleUpdateMeetLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    Cập nhật
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Thông tin người đặt lịch */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin người đặt lịch</h2>
            <div className="flex items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center uppercase font-bold text-lg mr-3">
                {client.fullName.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-lg">{client.fullName}</div>
                <div className="text-gray-500 text-sm mt-1">{client.email}</div>
                {client.phoneNumber && (
                  <div className="text-gray-500 text-sm mt-1">{client.phoneNumber}</div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mô tả và ghi chú */}
        {appointment.description && (
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Mô tả</h2>
            <p className="text-gray-700 whitespace-pre-line">{appointment.description}</p>
          </div>
        )}
        
        {/* Các hành động */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap justify-end gap-3">
            <Link
              to={isConsultant ? "/manage-appointments" : "/my-appointments"}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Quay lại
            </Link>
            
            {appointment.status === 'CONFIRMED' && isConsultant && (
              <button
                onClick={handleCompleteAppointment}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Đánh dấu là hoàn thành
              </button>
            )}
            
            {appointment.status === 'PENDING' && !isConsultant && (
              <button
                onClick={() => {/* Xử lý hủy lịch tại đây */}}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Hủy lịch hẹn
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentDetail;