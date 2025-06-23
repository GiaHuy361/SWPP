import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ManageAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Kiểm tra nếu người dùng là tư vấn viên
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'Consultant') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  // Lấy danh sách lịch hẹn
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/appointments/consultant/${user.consultantId}`);
        setAppointments(response.data);
        setFilteredAppointments(response.data);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách lịch hẹn:', err);
        setError('Không thể tải danh sách lịch hẹn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user && user.consultantId) {
      fetchAppointments();
    }
  }, [user]);

  // Lọc lịch hẹn theo trạng thái và từ khóa
  useEffect(() => {
    let result = appointments;
    
    // Lọc theo trạng thái
    if (filter !== 'all') {
      result = result.filter(appointment => appointment.status === filter);
    }
    
    // Lọc theo từ khóa
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(appointment => 
        appointment.user.fullName.toLowerCase().includes(term) ||
        appointment.user.email.toLowerCase().includes(term) ||
        new Date(appointment.appointmentTime).toLocaleDateString().includes(term)
      );
    }
    
    setFilteredAppointments(result);
  }, [appointments, filter, searchTerm]);

  // Xử lý cập nhật trạng thái lịch hẹn
  const handleUpdateStatus = async (appointmentId, newStatus) => {
    setLoading(true);
    try {
      const response = await axios.put(`/api/appointments/${appointmentId}`, {
        status: newStatus
      });
      
      // Cập nhật danh sách lịch hẹn
      setAppointments(appointments.map(appointment => {
        if (appointment.appointmentId === appointmentId) {
          return { ...appointment, status: newStatus };
        }
        return appointment;
      }));
      
      setSuccessMessage(`Đã cập nhật trạng thái lịch hẹn thành "${newStatus === 'CONFIRMED' ? 'Đã xác nhận' : 'Đã hủy'}"`);
      
      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      setError('Không thể cập nhật trạng thái lịch hẹn. Vui lòng thử lại sau.');
      
      // Tự động ẩn thông báo lỗi sau 3 giây
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // Format thời gian lịch hẹn
  const formatAppointmentTime = (dateTimeString) => {
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
        
        {/* Thông báo lỗi và thành công */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}
        
        {/* Filter và tìm kiếm */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                onClick={() => setFilter('all')}
              >
                Tất cả
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${filter === 'PENDING' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                onClick={() => setFilter('PENDING')}
              >
                Chờ xác nhận
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${filter === 'CONFIRMED' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                onClick={() => setFilter('CONFIRMED')}
              >
                Đã xác nhận
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${filter === 'CANCELLED' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                onClick={() => setFilter('CANCELLED')}
              >
                Đã hủy
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${filter === 'COMPLETED' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                onClick={() => setFilter('COMPLETED')}
              >
                Đã hoàn thành
              </button>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm tên, email, ngày..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Danh sách lịch hẹn */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {filteredAppointments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h2 className="text-xl font-medium text-gray-700 mb-2">Không có lịch hẹn nào</h2>
                <p className="text-gray-500">Hiện tại không có lịch hẹn nào phù hợp với bộ lọc của bạn.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredAppointments.map((appointment) => {
                  const { date, time } = formatAppointmentTime(appointment.appointmentTime);
                  return (
                    <div key={appointment.appointmentId} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className={`p-4 ${
                        appointment.status === 'PENDING' ? 'bg-yellow-50' :
                        appointment.status === 'CONFIRMED' ? 'bg-green-50' :
                        appointment.status === 'CANCELLED' ? 'bg-red-50' :
                        'bg-purple-50'
                      }`}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center uppercase font-bold text-lg mr-3">
                              {appointment.user.fullName.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{appointment.user.fullName}</h3>
                              <p className="text-sm text-gray-600">{appointment.user.email}</p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            appointment.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' :
                            appointment.status === 'CONFIRMED' ? 'bg-green-200 text-green-800' :
                            appointment.status === 'CANCELLED' ? 'bg-red-200 text-red-800' :
                            'bg-purple-200 text-purple-800'
                          }`}>
                            {appointment.status === 'PENDING' ? 'Chờ xác nhận' :
                             appointment.status === 'CONFIRMED' ? 'Đã xác nhận' :
                             appointment.status === 'CANCELLED' ? 'Đã hủy' :
                             'Đã hoàn thành'}
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
                            <h4 className="font-medium text-gray-700">Ghi chú:</h4>
                            <p className="text-gray-600 mt-1">{appointment.description}</p>
                          </div>
                        )}
                        
                        {appointment.meetLink && appointment.status === 'CONFIRMED' && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-700">Link tham gia:</h4>
                            <a 
                              href={appointment.meetLink} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-blue-600 underline flex items-center mt-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Tham gia buổi tư vấn
                            </a>
                          </div>
                        )}
                        
                        {/* Các action button */}
                        {appointment.status === 'PENDING' && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            <button
                              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                              onClick={() => handleUpdateStatus(appointment.appointmentId, 'CONFIRMED')}
                              disabled={loading}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Xác nhận
                            </button>
                            <button
                              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                              onClick={() => handleUpdateStatus(appointment.appointmentId, 'CANCELLED')}
                              disabled={loading}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Từ chối
                            </button>
                          </div>
                        )}
                        
                        {appointment.status === 'CONFIRMED' && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            <button
                              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                              onClick={() => handleUpdateStatus(appointment.appointmentId, 'COMPLETED')}
                              disabled={loading}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Đánh dấu hoàn thành
                            </button>
                            <button
                              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                              onClick={() => handleUpdateStatus(appointment.appointmentId, 'CANCELLED')}
                              disabled={loading}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Hủy lịch
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ManageAppointments;