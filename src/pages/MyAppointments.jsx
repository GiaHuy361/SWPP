import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyAppointments, cancelAppointment } from '../services/AppointmentService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Icons components để tránh lỗi thiếu thẻ đóng
const AlertSuccessIcon = () => (
  <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const AlertErrorIcon = () => (
  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const MyAppointments = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(location?.state?.message || null);
  const [cancellingId, setCancellingId] = useState(null);

  // Chuyển hướng người dùng chưa đăng nhập
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/my-appointments' } });
    }
  }, [user, navigate]);

  // Đóng thông báo thành công sau 5 giây
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Tải danh sách lịch hẹn khi component mount hoặc user thay đổi
  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getMyAppointments();
      console.log('Dữ liệu lịch hẹn nhận được:', response?.data);
      setAppointments(Array.isArray(response?.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách lịch hẹn:', err);
      setError('Không thể tải danh sách lịch hẹn. Vui lòng thử lại sau.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!id) return;
    
    try {
      setCancellingId(id);
      await cancelAppointment(id);
      setAppointments(prevAppointments => 
        prevAppointments.filter(appointment => appointment.appointmentId !== id)
      );
      setSuccess('Hủy lịch hẹn thành công');
      setError(null);
    } catch (err) {
      console.error('Lỗi khi hủy lịch hẹn:', err);
      setError('Không thể hủy lịch hẹn. Vui lòng thử lại sau.');
    } finally {
      setCancellingId(null);
    }
  };

  const formatAppointmentTime = (dateTimeString) => {
    if (!dateTimeString) return 'Thời gian không xác định';
    
    try {
      const date = new Date(dateTimeString);
      return format(date, 'EEEE, dd/MM/yyyy HH:mm', { locale: vi });
    } catch (e) {
      console.error('Lỗi khi định dạng thời gian:', e);
      return dateTimeString || 'Không xác định';
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Không xác định</span>;
    
    switch(status.toUpperCase()) {
      case 'PENDING':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Chờ xác nhận</span>;
      case 'CONFIRMED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Đã xác nhận</span>;
      case 'CANCELLED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Đã hủy</span>;
      case 'COMPLETED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Hoàn thành</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // Không hiển thị gì khi chưa đăng nhập
  if (!user) {
    return null;
  }

  // Hiển thị loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Lịch hẹn của tôi</h1>
        <Link 
          to="/book-appointment"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2 px-4 transition-colors"
        >
          Đặt lịch hẹn mới
        </Link>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertSuccessIcon />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertErrorIcon />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {appointments.length === 0 ? (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <CalendarIcon />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Không có lịch hẹn nào</h3>
          <p className="mt-1 text-gray-500">Bạn chưa có lịch hẹn nào. Hãy đặt lịch hẹn mới.</p>
          <div className="mt-6">
            <Link 
              to="/book-appointment"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 px-5 transition-colors"
            >
              Đặt lịch hẹn
            </Link>
          </div>
        </div>
      ) : (
        /* Appointments table */
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tư vấn viên
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link họp
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.appointmentId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.consultantFullName || 'Chưa xác định'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.consultantEmail || 'Không có email'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatAppointmentTime(appointment.appointmentTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(appointment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {appointment.meetLink ? (
                        <a 
                          href={appointment.meetLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Tham gia
                        </a>
                      ) : (
                        <span className="text-gray-500 text-sm">Chưa có</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {appointment.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancel(appointment.appointmentId)}
                          disabled={cancellingId === appointment.appointmentId}
                          className="text-red-600 hover:text-red-800 focus:outline-none"
                        >
                          {cancellingId === appointment.appointmentId ? 'Đang hủy...' : 'Hủy lịch'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;