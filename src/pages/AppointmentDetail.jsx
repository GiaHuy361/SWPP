import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAppointmentById, updateAppointment, cancelAppointment } from '../services/AppointmentService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-toastify';

function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [meetLink, setMeetLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/appointments/${id}` } });
      return;
    }
    if (!user?.permissions?.includes('BOOK_APPOINTMENTS') && !user?.permissions?.includes('MANAGE_APPOINTMENTS')) {
      navigate('/access-denied');
      return;
    }

    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const response = await getAppointmentById(id);
        setAppointment(response.data);
        setMeetLink(response.data.meetLink || '');
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Không thể tải thông tin lịch hẹn.';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id, isAuthenticated, user, navigate]);

  const handleUpdateLink = async () => {
    if (!meetLink) {
      setError('Vui lòng nhập link Google Meet.');
      toast.error('Vui lòng nhập link Google Meet.');
      return;
    }
    try {
      setIsSubmitting(true);
      await updateAppointment(id, { meetLink });
      setAppointment({ ...appointment, meetLink });
      toast.success('Cập nhật link Google Meet thành công.');
      setError('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Cập nhật link Google Meet thất bại.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsSubmitting(true);
      await cancelAppointment(id);
      toast.success('Hủy lịch hẹn thành công.');
      navigate('/my-appointments', { state: { message: 'Hủy lịch hẹn thành công' } });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Hủy lịch hẹn thất bại.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAppointmentTime = (dateTimeString) => {
    if (!dateTimeString) return 'Thời gian không xác định';
    try {
      const date = new Date(dateTimeString);
      return format(date, 'EEEE, dd/MM/yyyy HH:mm', { locale: vi });
    } catch (e) {
      return dateTimeString || 'Không xác định';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-4xl mx-auto bg-red-50 text-red-700 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-4xl mx-auto bg-gray-50 p-8 rounded-lg text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Không tìm thấy lịch hẹn</h3>
          <p className="mt-2 text-gray-600">Lịch hẹn không tồn tại hoặc đã bị xóa.</p>
          <div className="mt-6">
            <Link
              to="/my-appointments"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Quay lại danh sách lịch hẹn
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            to="/my-appointments"
            className="text-blue-600 hover:text-blue-800 flex items-center font-medium"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Quay lại danh sách lịch hẹn
          </Link>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Chi tiết lịch hẹn</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tư vấn viên</label>
              <p className="mt-1 text-gray-900">{appointment.consultantFullName || 'Chưa xác định'}</p>
              <p className="text-sm text-gray-500">{appointment.consultantEmail || 'Không có email'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Thời gian</label>
              <p className="mt-1 text-gray-900">{formatAppointmentTime(appointment.appointmentTime)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
              <p className="mt-1">
                {appointment.status === 'PENDING' && <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Chờ xác nhận</span>}
                {appointment.status === 'CONFIRMED' && <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Đã xác nhận</span>}
                {appointment.status === 'CANCELLED' && <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Đã hủy</span>}
                {appointment.status === 'COMPLETED' && <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Hoàn thành</span>}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Link Google Meet</label>
              {appointment.meetLink ? (
                <a href={appointment.meetLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  Tham gia
                </a>
              ) : (
                <p className="text-gray-500">Chưa có link</p>
              )}
              {user?.permissions?.includes('MANAGE_APPOINTMENTS') && appointment.status !== 'CANCELLED' && (
                <div className="mt-4">
                  <input
                    type="text"
                    value={meetLink}
                    onChange={(e) => setMeetLink(e.target.value)}
                    placeholder="Nhập link Google Meet"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleUpdateLink}
                    disabled={isSubmitting}
                    className={`mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? 'Đang xử lý...' : 'Cập nhật link'}
                  </button>
                </div>
              )}
            </div>
            {appointment.status === 'PENDING' && user?.permissions?.includes('BOOK_APPOINTMENTS') && (
              <div className="mt-4">
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Hủy lịch hẹn'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentDetail;