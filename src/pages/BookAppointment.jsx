import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createAppointment, getAvailableConsultants } from '../services/AppointmentService';
import { toast } from 'react-toastify';

function BookAppointment() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [consultants, setConsultants] = useState([]);
  const [selectedConsultant, setSelectedConsultant] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Danh sách thời gian cố định
  const availableTimes = [
    '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/book-appointment' } });
      return;
    }

    const fetchConsultants = async () => {
      try {
        setLoading(true);
        const response = await getAvailableConsultants();
        const consultantsData = Array.isArray(response.data) ? response.data : [];
        console.log('Consultants fetched:', consultantsData);
        setConsultants(consultantsData);
        if (consultantsData.length === 0) {
          setError('Không có tư vấn viên nào khả dụng hiện tại. Vui lòng liên hệ quản trị viên.');
          toast.warn('Không có tư vấn viên khả dụng.');
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Không thể tải danh sách tư vấn viên. Vui lòng thử lại sau.';
        console.error('Error fetching consultants:', {
          status: err.response?.status,
          message: errorMsg,
          role: user.role
        });
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchConsultants();
  }, [isAuthenticated, user, navigate]);

  const handleConsultantChange = (e) => {
    setSelectedConsultant(e.target.value);
    setSelectedTime('');
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedTime('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedConsultant || !selectedDate || !selectedTime) {
      setError('Vui lòng chọn tư vấn viên, ngày và giờ.');
      toast.error('Vui lòng chọn tư vấn viên, ngày và giờ.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const appointmentData = {
        userId: user.userId,
        consultantId: parseInt(selectedConsultant),
        appointmentTime: `${selectedDate}T${selectedTime}:00`
      };
      console.log('Sending appointment data:', appointmentData);
      const response = await createAppointment(appointmentData);
      console.log('Create appointment response:', response.data);
      toast.success('Đặt lịch hẹn thành công!');
      navigate('/my-appointments', { state: { message: 'Đặt lịch hẹn thành công' } });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Đặt lịch hẹn thất bại. Vui lòng thử lại sau.';
      console.error('Error creating appointment:', err);
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Đặt lịch tư vấn</h1>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
          <div>
            <label htmlFor="consultant" className="block text-sm font-medium text-gray-700 mb-1">
              Chọn tư vấn viên
            </label>
            <select
              id="consultant"
              value={selectedConsultant}
              onChange={handleConsultantChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={consultants.length === 0}
            >
              <option value="">Chọn tư vấn viên</option>
              {consultants.map((consultant) => (
                <option key={consultant.consultantId} value={consultant.consultantId}>
                  {consultant.fullName} ({consultant.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Chọn ngày
            </label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={consultants.length === 0}
            />
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
              Chọn giờ
            </label>
            <select
              id="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={!selectedConsultant || !selectedDate}
            >
              <option value="">Chọn giờ</option>
              {availableTimes.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || consultants.length === 0}
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                isSubmitting || consultants.length === 0 ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Đặt lịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookAppointment;