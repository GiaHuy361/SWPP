import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [readFilter, setReadFilter] = useState('all'); // 'all', 'read', 'unread'
    const navigate = useNavigate();

    useEffect(() => {
        fetchAllNotifications();
    }, []);
    
    // Lọc thông báo khi readFilter hoặc notifications thay đổi
    useEffect(() => {
        filterNotifications();
    }, [readFilter, notifications]);

    const fetchAllNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getAllNotifications();
            setNotifications(data);
            setError(null);
        } catch (err) {
            setError('Không thể tải thông báo. Vui lòng thử lại sau.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Hàm lọc thông báo theo trạng thái đã đọc/chưa đọc
    const filterNotifications = () => {
        if (readFilter === 'all') {
            setFilteredNotifications(notifications);
        } else if (readFilter === 'read') {
            setFilteredNotifications(notifications.filter(notification => notification.isRead));
        } else if (readFilter === 'unread') {
            setFilteredNotifications(notifications.filter(notification => !notification.isRead));
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            // Cập nhật trạng thái đã đọc trong state
            setNotifications(notifications.map(notification => 
                notification.notificationId === id 
                    ? { ...notification, isRead: true } 
                    : notification
            ));
        } catch (err) {
            console.error(`Error marking notification ${id} as read:`, err);
        }
    };

    // Đánh dấu tất cả thông báo đã đọc
    const markAllAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter(notification => !notification.isRead);
            if (unreadNotifications.length === 0) return;

            // Lưu ý: Backend cần có API để đánh dấu nhiều thông báo đã đọc cùng lúc
            // Nếu không có, chúng ta sẽ gọi API đánh dấu từng thông báo một
            for (const notification of unreadNotifications) {
                await notificationService.markAsRead(notification.notificationId);
            }

            // Cập nhật trạng thái đã đọc cho tất cả trong state
            setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
        }
    };

    // Hàm xử lý thay đổi filter
    const handleFilterChange = (filter) => {
        setReadFilter(filter);
    };

    const handleNotificationClick = (notification) => {
        // Đánh dấu là đã đọc nếu chưa đọc
        if (!notification.isRead) {
            handleMarkAsRead(notification.notificationId);
        }
        
        // Xử lý điều hướng dựa vào loại thông báo
        switch(notification.type) {
            case 'APPOINTMENT':
                navigate('/my-appointments');
                break;
            case 'COURSE_COMPLETION':
                navigate('/user-dashboard');
                break;
            case 'QUIZ_RESULT':
                navigate('/user-dashboard');
                break;
            case 'SURVEY':
                navigate('/surveys');
                break;
            case 'SYSTEM':
            default:
                // Không điều hướng đi đâu
                break;
        }
    };

    // Hàm để định dạng thời gian hiển thị thông báo
    const formatDateTime = (dateTime) => {
        const date = new Date(dateTime);
        return date.toLocaleString('vi-VN');
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center py-10">
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Đang tải...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <p>{error}</p>
                </div>
                <button 
                    onClick={fetchAllNotifications}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    const getNotificationTypeLabel = (type) => {
        switch(type) {
            case 'APPOINTMENT':
                return 'Lịch hẹn';
            case 'COURSE_COMPLETION':
                return 'Khóa học';
            case 'QUIZ_RESULT':
                return 'Kết quả bài kiểm tra';
            case 'SURVEY':
                return 'Khảo sát';
            case 'SYSTEM':
                return 'Hệ thống';
            default:
                return 'Khác';
        }
    };

    const getNotificationTypeColor = (type) => {
        switch(type) {
            case 'APPOINTMENT':
                return 'bg-purple-100 text-purple-800';
            case 'COURSE_COMPLETION':
                return 'bg-green-100 text-green-800';
            case 'QUIZ_RESULT':
                return 'bg-yellow-100 text-yellow-800';
            case 'SURVEY':
                return 'bg-blue-100 text-blue-800';
            case 'SYSTEM':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto p-6 pt-20">
            <div className="bg-blue-50 p-4 mb-6 rounded-lg border border-blue-100">
                <h1 className="text-2xl font-bold text-blue-800 mb-2">Thông báo của tôi</h1>
                <p className="text-blue-600">Tất cả thông báo hệ thống và thông báo cá nhân của bạn</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <button 
                            onClick={() => handleFilterChange('all')}
                            className={`px-4 py-2 rounded-l-lg ${readFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                        >
                            Tất cả
                        </button>
                        <button 
                            onClick={() => handleFilterChange('read')}
                            className={`px-4 py-2 ${readFilter === 'read' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                        >
                            Đã đọc
                        </button>
                        <button 
                            onClick={() => handleFilterChange('unread')}
                            className={`px-4 py-2 rounded-r-lg ${readFilter === 'unread' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                        >
                            Chưa đọc
                        </button>
                    </div>
                    <div>
                        <button 
                            onClick={markAllAsRead}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Đánh dấu tất cả đã đọc
                        </button>
                    </div>
                </div>
            </div>
            
            {filteredNotifications.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                    <p>Bạn chưa có thông báo nào.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="divide-y divide-gray-200">
                        {filteredNotifications.map((notification) => (
                            <div 
                                key={notification.notificationId}
                                className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-1">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getNotificationTypeColor(notification.type)}`}>
                                                {getNotificationTypeLabel(notification.type)}
                                            </span>
                                            {!notification.isRead && (
                                                <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Mới</span>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-lg">{notification.title}</h3>
                                        <p className="text-gray-600 mt-1">{notification.message}</p>
                                        <p className="text-gray-400 text-xs mt-2">{formatDateTime(notification.createdAt)}</p>
                                    </div>
                                    <div className="ml-4">
                                        {!notification.isRead && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMarkAsRead(notification.notificationId);
                                                }}
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                Đánh dấu đã đọc
                                            </button>
                                        )}
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

export default NotificationsPage;
