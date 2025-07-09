import axios from '../utils/axios';

// Service để gọi API liên quan đến thông báo
const notificationService = {
    // Lấy tất cả thông báo của người dùng hiện tại
    getAllNotifications: async () => {
        try {
            const response = await axios.get('/notifications');
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },
    
    // Lấy tất cả thông báo với thông tin người nhận (cho admin)
    getAllNotificationsWithRecipients: async () => {
        try {
            // Thử API mới của backend nếu đã triển khai
            const response = await axios.get('/notifications/admin');
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications with recipients:', error);
            // Fallback: Lấy tất cả thông báo và thêm thông tin người nhận từ frontend
            try {
                const notificationsResponse = await axios.get('/notifications/all');
                let notifications = notificationsResponse.data;
                
                // Lấy danh sách tất cả người dùng
                const usersResponse = await axios.get('/auth/users');
                const users = usersResponse.data || [];
                
                // Thêm thông tin người nhận vào mỗi thông báo
                notifications = notifications.map(notification => {
                    if (notification.isSystemNotification) {
                        return {
                            ...notification,
                            recipientName: 'Tất cả người dùng',
                            recipientEmail: ''
                        };
                    } else if (notification.userId) {
                        const recipient = users.find(user => user.userId === notification.userId);
                        return {
                            ...notification,
                            recipientName: recipient ? (recipient.fullName || recipient.username) : '',
                            recipientEmail: recipient ? recipient.email : ''
                        };
                    }
                    return notification;
                });
                
                return notifications;
            } catch (fallbackError) {
                console.error('Error in fallback notification fetch:', fallbackError);
                throw fallbackError;
            }
        }
    },
    
    // Lấy tất cả thông báo trong hệ thống (chỉ dành cho admin/manager)
    getAllSystemNotifications: async () => {
        try {
            // Gọi API để lấy tất cả thông báo
            const response = await axios.get('/notifications/all');
            return response.data;
        } catch (error) {
            console.error('Error fetching all system notifications:', error);
            throw error;
        }
    },
    
    // Phương thức đảm bảo lấy được thông báo dù bằng cách nào
    getNotificationsByAnyMeans: async () => {
        try {
            // Thử từng endpoint một cho đến khi lấy được dữ liệu
            try {
                console.log("Trying /notifications/admin endpoint...");
                const adminResponse = await axios.get('/notifications/admin');
                console.log("Success with /notifications/admin", adminResponse.data);
                return adminResponse.data;
            } catch (adminError) {
                console.log("Failed with /notifications/admin, trying /notifications/all...");
                try {
                    const allResponse = await axios.get('/notifications/all');
                    if (allResponse.data && Array.isArray(allResponse.data)) {
                        console.log("Success with /notifications/all", allResponse.data);
                        // Thêm thông tin người nhận
                        const usersResponse = await axios.get('/auth/users');
                        const users = usersResponse.data || [];
                        
                        return allResponse.data.map(notification => {
                            if (notification.isSystemNotification) {
                                return {
                                    ...notification,
                                    recipientName: 'Tất cả người dùng',
                                    recipientEmail: ''
                                };
                            } else if (notification.userId) {
                                const recipient = users.find(user => user.userId === notification.userId);
                                return {
                                    ...notification,
                                    recipientName: recipient ? (recipient.fullName || recipient.username) : '',
                                    recipientEmail: recipient ? recipient.email : ''
                                };
                            }
                            return notification;
                        });
                    }
                    return allResponse.data;
                } catch (allError) {
                    console.log("Failed with /notifications/all, trying /notifications...");
                    const userResponse = await axios.get('/notifications');
                    console.log("Success with /notifications", userResponse.data);
                    return userResponse.data;
                }
            }
        } catch (error) {
            console.error('All attempts to fetch notifications failed:', error);
            return []; // Trả về mảng rỗng nếu tất cả các phương thức đều thất bại
        }
    },

    // Lấy thông báo chưa đọc của người dùng hiện tại
    getUnreadNotifications: async () => {
        try {
            const response = await axios.get('/notifications/unread');
            return response.data;
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
            throw error;
        }
    },

    // Lấy thông báo theo ID
    getNotificationById: async (id) => {
        try {
            const response = await axios.get(`/notifications/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching notification ${id}:`, error);
            throw error;
        }
    },

    // Đánh dấu thông báo đã đọc
    markAsRead: async (id) => {
        try {
            const response = await axios.put(`/notifications/${id}/read`);
            return response.data;
        } catch (error) {
            console.error(`Error marking notification ${id} as read:`, error);
            throw error;
        }
    },

    // Đánh dấu thông báo chưa đọc
    markAsUnread: async (id) => {
        try {
            // Thử gọi API backend chính thức (nếu đã triển khai)
            const response = await axios.put(`/notifications/${id}/unread`);
            return response.data;
        } catch (error) {
            console.error(`Error marking notification ${id} as unread:`, error);
            // Nếu API chưa triển khai, thử cập nhật thông báo với isRead=false
            try {
                const notificationData = {
                    isRead: false
                };
                const updateResponse = await axios.put(`/notifications/${id}`, notificationData);
                return updateResponse.data;
            } catch (fallbackError) {
                console.error(`Error using fallback for marking unread:`, fallbackError);
                throw fallbackError;
            }
        }
    },

    // Tạo thông báo mới (yêu cầu quyền MANAGE_NOTIFICATIONS)
    createNotification: async (notificationData) => {
        try {
            const response = await axios.post('/notifications', notificationData);
            return response.data;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    },

    // Cập nhật thông báo (yêu cầu quyền MANAGE_NOTIFICATIONS)
    updateNotification: async (id, notificationData) => {
        try {
            const response = await axios.put(`/notifications/${id}`, notificationData);
            return response.data;
        } catch (error) {
            console.error(`Error updating notification ${id}:`, error);
            throw error;
        }
    },

    // Xóa thông báo (yêu cầu quyền MANAGE_NOTIFICATIONS)
    deleteNotification: async (id) => {
        try {
            const response = await axios.delete(`/notifications/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting notification ${id}:`, error);
            throw error;
        }
    },

    // Lấy userId từ email (yêu cầu quyền MANAGE_NOTIFICATIONS)
    getUserIdByEmail: async (email) => {
        try {
            const response = await axios.get(`/notifications/user-id/${email}`);
            return response.data;
        } catch (error) {
            console.error(`Error getting userId for email ${email}:`, error);
            throw error;
        }
    },

    // Lấy tất cả người dùng để gửi thông báo (yêu cầu quyền MANAGE_NOTIFICATIONS)
    getAllUsers: async () => {
        try {
            const response = await axios.get('/auth/users');
            return response.data;
        } catch (error) {
            console.error('Error fetching all users:', error);
            throw error;
        }
    }
};

export default notificationService;
