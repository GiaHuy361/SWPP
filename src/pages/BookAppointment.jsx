import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAvailableConsultants, getConsultantAvailability, createAppointment } from '../services/AppointmentService';
import { format, addDays, startOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [consultants, setConsultants] = useState([]);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [consultantLoading, setConsultantLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy danh sách tư vấn viên khi component được mount
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/book-appointment' } });
      return;
    }

    const loadConsultants = async () => {
      try {
        setConsultantLoading(true);
        const response = await getAvailableConsultants();
        console.log('Dữ liệu tư vấn viên nhận được:', response.data);
        
        // Kiểm tra xem dữ liệu có đúng định dạng không
        if (Array.isArray(response.data)) {
          // Lọc chỉ lấy các tư vấn viên đang hoạt động
          const activeConsultants = response.data.filter(c => c.isActive);
          setConsultants(activeConsultants);
        } else {
          console.error('Định dạng dữ liệu tư vấn viên không hợp lệ:', response.data);
          setError('Định dạng dữ liệu không hợp lệ.');
        }
      } catch (err) {
        console.error('Lỗi khi lấy danh sách tư vấn viên:', err);
        setError('Không thể tải danh sách tư vấn viên. Vui lòng thử lại sau.');
      } finally {
        setConsultantLoading(false);
      }
    };

    loadConsultants();
  }, [user, navigate]);

  // Lấy thời gian trống khi người dùng chọn tư vấn viên và ngày
  useEffect(() => {
    if (selectedConsultant && selectedDate) {
      loadAvailableTimes();
    }
  }, [selectedConsultant, selectedDate]);

  const loadAvailableTimes = async () => {
    try {
      setLoading(true);
      const response = await getConsultantAvailability(selectedConsultant.consultantId, selectedDate);
      console.log('Dữ liệu thời gian trống nhận được:', response.data);
      
      if (Array.isArray(response.data)) {
        setAvailableTimes(response.data);
      } else {
        console.error('Định dạng dữ liệu thời gian không hợp lệ:', response.data);
        setError('Định dạng dữ liệu thời gian không hợp lệ.');
        setAvailableTimes([]);
      }
      setSelectedTime(null); // Reset selected time when date/consultant changes
    } catch (err) {
      console.error('Lỗi khi lấy thời gian rảnh:', err);
      setError('Không thể tải thời gian rảnh. Vui lòng thử lại sau.');
      setAvailableTimes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedConsultant || !selectedDate || !selectedTime) {
      setError('Vui lòng chọn đầy đủ thông tin tư vấn viên, ngày và giờ.');
      return;
    }

    try {
      setLoading(true);
      
      // Tạo đối tượng datetime từ date và time
      const appointmentDateTime = `${selectedDate}T${selectedTime}:00`;
      
      await createAppointment({
        userId: user.userId,
        consultantId: selectedConsultant.consultantId,
        appointmentTime: appointmentDateTime
      });
      
      // Chuyển hướng đến trang danh sách lịch hẹn
      navigate('/my-appointments', { 
        state: { success: true, message: 'Đặt lịch hẹn thành công! Vui lòng chờ xác nhận.' } 
      });
    } catch (err) {
      console.error('Lỗi khi đặt lịch hẹn:', err);
      setError(err.response?.data?.message || 'Đặt lịch hẹn thất bại. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const formatDate = (dateStr) => {
    return format(new Date(dateStr), 'EEEE, dd/MM/yyyy', { locale: vi });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Đặt lịch hẹn tư vấn</h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-6">
            <label htmlFor="consultant" className="block text-sm font-medium text-gray-700 mb-2">
              Chọn tư vấn viên
            </label>
            {consultantLoading ? (
              <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
            ) : consultants.length === 0 ? (
              <div className="text-red-600">Không có tư vấn viên khả dụng.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consultants.map(consultant => (
                  <div 
                    key={consultant.consultantId}
                    onClick={() => setSelectedConsultant(consultant)}
                    className={`border rounded-lg p-4 cursor-pointer transition ${
                      selectedConsultant?.consultantId === consultant.consultantId 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-medium">{consultant.user.fullName}</div>
                    <div className="text-sm text-gray-500 mt-1">Kinh nghiệm: {consultant.experienceYears} năm</div>
                    <div className="text-sm text-gray-500">{consultant.qualification}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Chọn ngày
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
              max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={!selectedConsultant}
            />
            {selectedDate && (
              <div className="mt-2 text-sm text-gray-600">
                {formatDate(selectedDate)}
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn giờ
            </label>
            {loading ? (
              <div className="animate-pulse flex flex-wrap gap-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-10 w-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map(time => {
                  // Check if time is available
                  const isAvailable = !availableTimes.includes(time);
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => isAvailable && setSelectedTime(time)}
                      disabled={!selectedConsultant || !selectedDate || !isAvailable}
                      className={`py-2 px-4 text-center border rounded ${
                        selectedTime === time 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : isAvailable 
                            ? 'hover:border-blue-500 hover:bg-blue-50' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end mt-8">
            <button
              type="button"
              onClick={() => navigate('/my-appointments')}
              className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !selectedConsultant || !selectedDate || !selectedTime}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading || !selectedConsultant || !selectedDate || !selectedTime
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {loading ? 'Đang xử lý...' : 'Đặt lịch hẹn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;