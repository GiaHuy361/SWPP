import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';
import { AuthContext } from '../context/AuthContext';

const NotificationManagement = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedType, setSelectedType] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'SYSTEM',
        isSystemNotification: true,
        userId: null,
        email: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const permissions = user?.permissions || [];

    // Kiểm tra quyền
    useEffect(() => {
        // Đảm bảo người dùng đã đăng nhập và có quyền SEND_NOTIFICATION hoặc MANAGE_NOTIFICATIONS
        if (!user || (!permissions.includes('SEND_NOTIFICATION') && !permissions.includes('MANAGE_NOTIFICATIONS'))) {
            navigate('/access-denied');
            return;
        }
        
        fetchAllNotifications();
        console.log("User role:", user.role);
    }, [permissions, navigate, user]);

    const fetchAllNotifications = async () => {
        try {
            setLoading(true);
            console.log('Fetching notifications, user role:', user?.role);
            
            const data = await notificationService.getNotificationsByAnyMeans();
            
            console.log('Fetched notification data:', data);
            
            if (data && Array.isArray(data)) {
                console.log('Setting notifications, count:', data.length);
                setNotifications(data);
                setError(null);
            } else {
                console.log('No valid notification data received');
                setNotifications([]);
                setError('Không nhận được dữ liệu thông báo từ máy chủ.');
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError(`Không thể tải thông báo. Mã lỗi: ${err.response?.status || 'Unknown'}. Vui lòng thử lại sau.`);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        try {
            setLoadingUsers(true);
            const data = await notificationService.getAllUsers();
            if (data && Array.isArray(data)) {
                setUsers(data);
            } else {
                setUsers([]);
                setError(prev => prev || 'Không nhận được dữ liệu người dùng từ máy chủ.');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(prev => prev || `Không thể tải danh sách người dùng. Mã lỗi: ${err.response?.status || 'Unknown'}.`);
            setUsers([]);
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        if (showCreateModal) {
            fetchAllUsers();
        }
    }, [showCreateModal]);

    const handleDeleteNotification = async (id) => {
        if (!permissions.includes('MANAGE_NOTIFICATIONS')) {
            setError('Bạn không có quyền xóa thông báo.');
            return;
        }
        if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
            try {
                await notificationService.deleteNotification(id);
                setNotifications(notifications.filter(notification => notification.notificationId !== id));
                setSuccessMessage('Xóa thông báo thành công');
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (err) {
                setError('Không thể xóa thông báo. Vui lòng thử lại sau.');
                console.error(err);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: ''
            });
        }
    };

    const handleSystemToggle = (e) => {
        const isSystem = e.target.value === 'true';
        setFormData({
            ...formData,
            isSystemNotification: isSystem,
            userId: isSystem ? null : formData.userId,
            email: isSystem ? '' : formData.email
        });
    };

    const handleUserSelect = (e) => {
        const selectedUserId = e.target.value;
        const selectedUser = users.find(u => u.userId.toString() === selectedUserId);
        
        setFormData({
            ...formData,
            userId: selectedUserId ? parseInt(selectedUserId) : null,
            email: selectedUser ? selectedUser.email : ''
        });
        
        if (formErrors.email) {
            setFormErrors({
                ...formErrors,
                email: ''
            });
        }
    };

    const validateForm = () => {
        let errors = {};
        let isValid = true;

        if (!formData.title.trim()) {
            errors.title = 'Vui lòng nhập tiêu đề';
            isValid = false;
        }

        if (!formData.message.trim()) {
            errors.message = 'Vui lòng nhập nội dung thông báo';
            isValid = false;
        }

        if (!formData.isSystemNotification && !formData.email.trim() && !formData.userId) {
            errors.email = 'Vui lòng chọn người nhận hoặc nhập email';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const getUserIdFromEmail = async () => {
        if (!formData.email.trim()) return null;
        
        try {
            const response = await notificationService.getUserIdByEmail(formData.email);
            return response.userId;
        } catch (error) {
            console.error('Error getting userId:', error);
            setFormErrors({
                ...formErrors,
                email: 'Email không tồn tại trong hệ thống'
            });
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        
        try {
            let userId = formData.userId;
            
            if (!formData.isSystemNotification && !userId && formData.email) {
                userId = await getUserIdFromEmail();
                if (!userId) {
                    setIsSubmitting(false);
                    return;
                }
            }
            
            let recipientName = '';
            let recipientEmail = formData.email;
            
            if (userId && !formData.isSystemNotification) {
                const selectedUser = users.find(user => user.userId.toString() === userId.toString());
                if (selectedUser) {
                    recipientName = selectedUser.fullName || selectedUser.username;
                    recipientEmail = selectedUser.email;
                }
            }
            
            const notificationData = {
                title: formData.title,
                message: formData.message,
                type: formData.type,
                isSystemNotification: formData.isSystemNotification,
                userId: userId,
                recipientName: recipientName,
                recipientEmail: recipientEmail
            };
            
            // Sử dụng endpoint /api/notifications/send
            await notificationService.createNotificationWithSendEndpoint(notificationData);
            
            setShowCreateModal(false);
            setFormData({
                title: '',
                message: '',
                type: 'SYSTEM',
                isSystemNotification: true,
                userId: null,
                email: ''
            });
            
            setSuccessMessage('Gửi thông báo thành công');
            setTimeout(() => setSuccessMessage(''), 3000);
            
            fetchAllNotifications();
        } catch (error) {
            console.error('Error creating notification:', error);
            setError('Không thể gửi thông báo. Vui lòng thử lại sau.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleReadStatus = async (notification) => {
        if (!permissions.includes('MANAGE_NOTIFICATIONS')) {
            setError('Bạn không có quyền thay đổi trạng thái thông báo.');
            return;
        }
        try {
            if (notification.isRead) {
                await notificationService.markAsUnread(notification.notificationId);
                setNotifications(notifications.map(n => 
                    n.notificationId === notification.notificationId 
                        ? { ...n, isRead: false } 
                        : n
                ));
                setSuccessMessage('Đã đánh dấu thông báo chưa đọc');
            } else {
                await notificationService.markAsRead(notification.notificationId);
                setNotifications(notifications.map(n => 
                    n.notificationId === notification.notificationId 
                        ? { ...n, isRead: true } 
                        : n
                ));
                setSuccessMessage('Đã đánh dấu thông báo đã đọc');
            }
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error toggling read status:', error);
            setError('Không thể thay đổi trạng thái thông báo. Vui lòng thử lại sau.');
        }
    };

    const formatDateTime = (dateTime) => {
        const date = new Date(dateTime);
        return date.toLocaleString('vi-VN');
    };

    const notificationTypes = [
        { value: '', label: 'Tất cả' },
        { value: 'SYSTEM', label: 'Hệ thống' },
        { value: 'APPOINTMENT', label: 'Lịch hẹn' },
        { value: 'COURSE_COMPLETION', label: 'Hoàn thành khóa học' },
        { value: 'QUIZ_RESULT', label: 'Kết quả bài kiểm tra' },
        { value: 'SURVEY', label: 'Khảo sát' }
    ];

    const filteredNotifications = notifications.filter(notification => {
        const typeMatches = !selectedType || notification.type === selectedType;
        let statusMatches = true;
        if (selectedStatus === 'read') {
            statusMatches = notification.isRead === true;
        } else if (selectedStatus === 'unread') {
            statusMatches = notification.isRead === false;
        }
        return typeMatches && statusMatches;
    });

    const getNotificationTypeLabel = (type) => {
        const found = notificationTypes.find(t => t.value === type);
        return found ? found.label : 'Không xác định';
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

    return (
        <div className="container mx-auto p-6 pt-20">
            <div className="bg-blue-50 p-4 mb-6 rounded-lg border border-blue-100">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-blue-800 mb-2">Quản lý Thông báo</h1>
                        <p className="text-blue-600">Gửi và quản lý thông báo hệ thống hoặc cá nhân</p>
                        {user?.role === 'Manager' && (
                            <div className="mt-2 text-sm">
                                <span className="mr-4">
                                    <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                                    Đã đọc
                                </span>
                                <span>
                                    <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
                                    Chưa đọc
                                </span>
                            </div>
                        )}
                    </div>
                    {permissions.includes('SEND_NOTIFICATION') && (
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Gửi thông báo mới
                        </button>
                    )}
                </div>
            </div>
            
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <p>{error}</p>
                    <button 
                        onClick={() => setError(null)}
                        className="ml-2 text-red-700"
                    >
                        ×
                    </button>
                </div>
            )}
            
            {successMessage && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
                    <p>{successMessage}</p>
                    <button 
                        onClick={() => setSuccessMessage('')}
                        className="ml-2 text-green-700"
                    >
                        ×
                    </button>
                </div>
            )}
            
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex flex-col md:flex-row md:gap-4 mb-4">
                    <div className="mb-4 md:mb-0 md:w-1/3">
                        <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
                            Lọc theo loại thông báo
                        </label>
                        <select
                            id="typeFilter"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                        >
                            {notificationTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    {user?.role === 'Manager' && (
                        <div className="md:w-1/3">
                            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                                Lọc theo trạng thái
                            </label>
                            <select
                                id="statusFilter"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="read">Đã đọc</option>
                                <option value="unread">Chưa đọc</option>
                            </select>
                        </div>
                    )}
                </div>
                
                {filteredNotifications.length === 0 ? (
                    <div className="text-center text-gray-500 py-6">
                        <p>Không tìm thấy thông báo nào.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tiêu đề
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Loại
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Người nhận
                                    </th>
                                    {user?.role === 'Manager' && (
                                        <>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Thời gian
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Trạng thái
                                            </th>
                                        </>
                                    )}
                                    {permissions.includes('MANAGE_NOTIFICATIONS') && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hành động
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredNotifications.map((notification) => (
                                    <tr key={notification.notificationId} className={`hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-start">
                                                {!notification.isRead && (
                                                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-2 mt-2"></span>
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                                                    <div className="text-sm text-gray-500 line-clamp-2">{notification.message}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getNotificationTypeColor(notification.type)}`}>
                                                {getNotificationTypeLabel(notification.type)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {notification.isSystemNotification 
                                                ? <span className="font-medium text-blue-600">Tất cả người dùng</span>
                                                : notification.recipientName || notification.recipientEmail
                                                ? <span>{notification.recipientName || notification.recipientEmail}</span>
                                                : <span className="text-gray-400">Không xác định</span>
                                            }
                                        </td>
                                        {user?.role === 'Manager' && (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDateTime(notification.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleToggleReadStatus(notification)}
                                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${notification.isRead 
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
                                                    >
                                                        {notification.isRead ? 'Đã đọc' : 'Chưa đọc'}
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                        {permissions.includes('MANAGE_NOTIFICATIONS') && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button 
                                                    onClick={() => handleDeleteNotification(notification.notificationId)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Xóa
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Gửi thông báo mới</h2>
                            <button 
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Loại thông báo
                                </label>
                                <div className="flex space-x-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="notificationType"
                                            value="true"
                                            checked={formData.isSystemNotification === true}
                                            onChange={handleSystemToggle}
                                            className="form-radio h-4 w-4 text-blue-600"
                                        />
                                        <span className="ml-2">Thông báo hệ thống (gửi cho tất cả người dùng)</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="notificationType"
                                            value="false"
                                            checked={formData.isSystemNotification === false}
                                            onChange={handleSystemToggle}
                                            className="form-radio h-4 w-4 text-blue-600"
                                        />
                                        <span className="ml-2">Thông báo cá nhân</span>
                                    </label>
                                </div>
                            </div>
                            
                            {!formData.isSystemNotification && (
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="userId">
                                        Chọn người nhận
                                    </label>
                                    <select
                                        id="userId"
                                        name="userId"
                                        value={formData.userId || ''}
                                        onChange={handleUserSelect}
                                        className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                                    >
                                        <option value="">-- Chọn người nhận --</option>
                                        {loadingUsers ? (
                                            <option disabled>Đang tải danh sách người dùng...</option>
                                        ) : (
                                            users.map(user => (
                                                <option key={user.userId} value={user.userId}>
                                                    {user.fullName || user.username} ({user.email})
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    
                                    <div className="text-gray-500 text-xs mb-2">Hoặc nhập email người nhận</div>
                                    
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`shadow appearance-none border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                                        placeholder="Nhập email người nhận"
                                    />
                                    {formErrors.email && (
                                        <p className="text-red-500 text-xs italic">{formErrors.email}</p>
                                    )}
                                </div>
                            )}
                            
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
                                    Loại thông báo
                                </label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    <option value="SYSTEM">Hệ thống</option>
                                    <option value="APPOINTMENT">Lịch hẹn</option>
                                    <option value="COURSE_COMPLETION">Hoàn thành khóa học</option>
                                    <option value="QUIZ_RESULT">Kết quả bài kiểm tra</option>
                                    <option value="SURVEY">Khảo sát</option>
                                </select>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                                    Tiêu đề
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className={`shadow appearance-none border ${formErrors.title ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                                    placeholder="Nhập tiêu đề thông báo"
                                />
                                {formErrors.title && (
                                    <p className="text-red-500 text-xs italic">{formErrors.title}</p>
                                )}
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
                                    Nội dung
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className={`shadow appearance-none border ${formErrors.message ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                                    placeholder="Nhập nội dung thông báo"
                                ></textarea>
                                {formErrors.message && (
                                    <p className="text-red-500 text-xs italic">{formErrors.message}</p>
                                )}
                            </div>
                            
                            <div className="flex items-center justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    {isSubmitting ? 'Đang gửi...' : 'Gửi thông báo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationManagement;