import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/axios';
import { toast } from 'react-toastify';

function ManageAppointments() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/manage-appointments' } });
      return;
    }
    if (!user?.permissions?.includes('MANAGE_APPOINTMENTS')) {
      navigate('/access-denied');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const params = user.role === 'Consultant' ? { consultantId: user.consultantId } : {};
        const response = await apiClient.get('/appointments', {
          params,
          withCredentials: true
        });
        if (Array.isArray(response.data)) {
          setAppointments(response.data);
          setFilteredAppointments(response.data);
        } else {
          setError('Dữ liệu lịch hẹn không hợp lệ.');
          toast.error('Dữ liệu lịch hẹn không hợp lệ.');
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || `Không thể tải danh sách lịch hẹn (Status: ${err.response?.status || 'Unknown'}).`;
        console.error('Error fetching appointments:', {
          status: err.response?.status,
          message: errorMsg,
          responseData: err.response?.data,
          userRole: user?.role
        });
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'Consultant' || user?.role === 'Admin' || user?.role === 'Manager') {
      fetchAppointments();
    }
  }, [user]);

  useEffect(() => {
    let result = appointments;
    if (filter !== 'all') {
      result = result.filter(appointment => appointment.status === filter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(appointment => 
        (appointment.userFullName || '').toLowerCase().includes(term) ||
        (appointment.userEmail || '').toLowerCase().includes(term) ||
        new Date(appointment.appointmentTime).toLocaleDateString('vi-VN').includes(term)
      );
    }
    setFilteredAppointments(result);
  }, [appointments, filter, searchTerm]);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    setLoading(true);
    try {
      await apiClient.put(`/appointments/${appointmentId}`, { status: newStatus }, { withCredentials: true });
      setAppointments(appointments.map(appointment => 
        appointment.appointmentId === appointmentId 
          ? { ...appointment, status: newStatus } 
          : appointment
      ));
      const statusText = newStatus === 'CONFIRMED' ? 'Đã xác nhận' : newStatus === 'CANCELLED' ? 'Đã hủy' : 'Đã hoàn thành';
      setSuccessMessage(`Đã cập nhật trạng thái thành "${statusText}"`);
      toast.success(`Đã cập nhật trạng thái thành "${statusText}"`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Cập nhật trạng thái thất bại.';
      setError(errorMsg);
      toast.error(errorMsg);
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const formatAppointmentTime = (dateTimeString) => {
    if (!dateTimeString) return { date: 'Không xác định', time: '' };
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-blue-700 mb-8">Quản Lý Lịch Hẹn</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-500 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-600 px-4 py-3 rounded-lg mb-6">
            {successMessage}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setFilter('all')}
              >
                Tất cả
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${filter === 'PENDING' ? 'bg-yellow-400 text-yellow-800' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setFilter('PENDING')}
              >
                Chờ xét duyệt
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${filter === 'CONFIRMED' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setFilter('CONFIRMED')}
              >
                Đã xác nhận
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${filter === 'CANCELLED' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setFilter('CANCELLED')}
              >
                Đã hủy
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${filter === 'COMPLETED' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setFilter('COMPLETED')}
              >
                Đã hoàn thành
              </button>
            </div>
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, ngày..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500 text-lg">Không tìm thấy lịch hẹn nào.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người đặt</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link họp</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => {
                    const { date, time } = formatAppointmentTime(appointment.appointmentTime);
                    return (
                      <tr key={appointment.appointmentId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{appointment.userFullName || 'Không xác định'}</div>
                          <div className="text-sm text-gray-500">{appointment.userEmail || 'Không có email'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{date}</div>
                          <div className="text-sm text-gray-500">{time}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            appointment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {appointment.status === 'PENDING' ? 'Chờ xét duyệt' :
                             appointment.status === 'CONFIRMED' ? 'Đã xác nhận' :
                             appointment.status === 'CANCELLED' ? 'Đã hủy' :
                             appointment.status === 'COMPLETED' ? 'Đã hoàn thành' :
                             appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {appointment.meetLink ? (
                            <a href={appointment.meetLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                              Tham gia
                            </a>
                          ) : (
                            <span className="text-gray-500">Chưa có</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                          {appointment.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(appointment.appointmentId, 'CONFIRMED')}
                                className="text-green-600 hover:text-green-800"
                                disabled={loading}
                              >
                                Xác nhận
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(appointment.appointmentId, 'CANCELLED')}
                                className="text-red-600 hover:text-red-800"
                                disabled={loading}
                              >
                                Hủy
                              </button>
                            </>
                          )}
                          {appointment.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleUpdateStatus(appointment.appointmentId, 'COMPLETED')}
                              className="text-blue-600 hover:text-blue-800"
                              disabled={loading}
                            >
                              Hoàn thành
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageAppointments;