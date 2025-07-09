import React, { useState, useEffect, useRef } from 'react';
import notificationService from '../services/notificationService';
import { useNavigate } from 'react-router-dom';
import { Badge } from './ui/Badge';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Hàm lấy thông báo chưa đọc
    const fetchUnreadNotifications = async () => {
        try {
            const data = await notificationService.getUnreadNotifications();
            if (data && Array.isArray(data)) {
                setNotifications(data);
                setUnreadCount(data.length);
            } else {
                // Nếu không nhận được dữ liệu hợp lệ, đặt về mảng rỗng
                setNotifications([]);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            // Đảm bảo state được cập nhật ngay cả khi có lỗi
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    // Lấy thông báo khi component mount
    useEffect(() => {
        fetchUnreadNotifications();
        
        // Thiết lập interval để kiểm tra thông báo mới mỗi phút
        const interval = setInterval(fetchUnreadNotifications, 60000);
        
        return () => clearInterval(interval);
    }, []);

    // Xử lý click bên ngoài dropdown để đóng
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Hàm đánh dấu thông báo đã đọc
    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await notificationService.markAsRead(id);
            fetchUnreadNotifications(); // Cập nhật lại danh sách thông báo
        } catch (error) {
            console.error(`Error marking notification ${id} as read:`, error);
        }
    };

    // Hàm xử lý khi click vào thông báo
    const handleNotificationClick = (notification) => {
        // Đánh dấu là đã đọc
        notificationService.markAsRead(notification.notificationId);
        
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
        
        setIsOpen(false);
    };

    // Hàm để định dạng thời gian hiển thị thông báo
    const formatTime = (dateTime) => {
        const date = new Date(dateTime);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 24) {
            return diffInHours === 0 
                ? 'Vừa xong' 
                : `${diffInHours} giờ trước`;
        } else {
            return date.toLocaleDateString('vi-VN');
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full p-2.5 w-10 h-10 relative"
                onClick={() => setIsOpen(!isOpen)}
                title="Thông báo"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
            
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-gray-200 bg-blue-50 flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Thông báo</h3>
                        {notifications.length > 0 && (
                            <button 
                                className="text-xs font-medium text-blue-600 hover:text-blue-800"
                                onClick={() => navigate('/notifications')}
                            >
                                Xem tất cả
                            </button>
                        )}
                    </div>
                    
                    {notifications.length === 0 ? (
                        <div>
                            <div className="p-4 text-center text-gray-500">
                                Không có thông báo mới
                            </div>
                            <div className="p-3 border-t border-gray-100">
                                <button
                                    onClick={() => navigate('/notifications')}
                                    className="w-full py-2 px-4 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition duration-200"
                                >
                                    Xem tất cả thông báo
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {notifications.map(notification => (
                                <div 
                                    key={notification.notificationId} 
                                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">
                                                {notification.title}
                                                {!notification.isRead && (
                                                    <Badge className="ml-2 bg-blue-500">Mới</Badge>
                                                )}
                                            </p>
                                            <p className="text-gray-600 text-sm line-clamp-2">{notification.message}</p>
                                            <p className="text-gray-400 text-xs mt-1">{formatTime(notification.createdAt)}</p>
                                        </div>
                                        {!notification.isRead && (
                                            <button 
                                                className="text-xs text-blue-600 hover:text-blue-800 ml-2"
                                                onClick={(e) => handleMarkAsRead(notification.notificationId, e)}
                                            >
                                                Đánh dấu đã đọc
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div className="p-3 border-t border-gray-200">
                                <button
                                    onClick={() => navigate('/notifications')}
                                    className="w-full py-2 px-4 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition duration-200"
                                >
                                    Xem tất cả thông báo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
