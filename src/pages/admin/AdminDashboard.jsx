import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { communicationApi } from '../../services/communicationApi';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    totalStudents: 0,
    totalCertificates: 0,
    totalModules: 0,
    totalLessons: 0,
    totalQuizzes: 0,
    totalCommunicationPrograms: 0,
    activeCommunicationPrograms: 0,
    totalCommunicationParticipants: 0,
    recentActivities: []
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Tạm thời sử dụng mock data thay vì gọi các API không tồn tại
      const mockStats = {
        totalCourses: 25,
        publishedCourses: 18,
        totalModules: 67,
        totalLessons: 234,
        totalQuizzes: 89,
        totalStudents: 156,
        totalCertificates: 78,
        totalCommunicationPrograms: 12,
        activeCommunicationPrograms: 8,
        totalCommunicationParticipants: 145,
        recentActivities: [
          {
            id: 1,
            type: 'course_created',
            description: 'Khóa học mới được tạo: "An toàn lao động"',
            timestamp: new Date().toISOString(),
            user: 'Admin'
          },
          {
            id: 2,
            type: 'student_enrolled',
            description: 'Học viên mới đăng ký khóa học',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            user: 'Nguyễn Văn A'
          }
        ]
      };

      // Chỉ gọi API communication programs nếu đã có backend
      try {
        const overviewResponse = await communicationApi.getOverview();
        mockStats.totalCommunicationPrograms = overviewResponse.totalPrograms || mockStats.totalCommunicationPrograms;
        mockStats.activeCommunicationPrograms = overviewResponse.activePrograms || mockStats.activeCommunicationPrograms;
        mockStats.totalCommunicationParticipants = overviewResponse.totalParticipants || mockStats.totalCommunicationParticipants;
      } catch (error) {
        console.warn('Could not fetch communication programs overview, using mock data:', error);
      }

      setStats(mockStats);

      // Mock data cho recent courses
      setRecentCourses([
        {
          id: 1,
          name: 'An toàn lao động cơ bản',
          status: 'PUBLISHED',
          enrollmentCount: 45,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Kỹ năng giao tiếp',
          status: 'DRAFT',
          enrollmentCount: 23,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]);

      // Mock data cho top courses
      setTopCourses([
        {
          id: 1,
          name: 'An toàn lao động cơ bản',
          enrollmentCount: 45
        },
        {
          id: 2,
          name: 'Kỹ năng giao tiếp',
          enrollmentCount: 23
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Có lỗi khi tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      course_created: '📚',
      course_published: '✅',
      student_enrolled: '👥',
      certificate_issued: '🎓',
      quiz_completed: '📝',
      module_added: '📋',
      lesson_added: '📖'
    };
    return icons[type] || '📄';
  };

  const getActivityColor = (type) => {
    const colors = {
      course_created: 'bg-blue-100 text-blue-800',
      course_published: 'bg-green-100 text-green-800',
      student_enrolled: 'bg-purple-100 text-purple-800',
      certificate_issued: 'bg-yellow-100 text-yellow-800',
      quiz_completed: 'bg-indigo-100 text-indigo-800',
      module_added: 'bg-cyan-100 text-cyan-800',
      lesson_added: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Lấy danh sách khóa học mới nhất và đếm số học viên cho từng khóa học
  const fetchRecentCoursesWithEnrollments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/courses?limit=5&sortBy=createdAt&sortOrder=desc');
      const courses = res.data.content || res.data || [];
      // Lấy enrollments cho từng courseId
      const coursesWithEnrollments = await Promise.all(
        courses.map(async (course) => {
          try {
            const enrollmentsRes = await axios.get(`/enrollments?courseId=${course.id}`);
            const enrollmentCount = Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data.length : 0;
            return { ...course, enrollmentCount };
          } catch {
            return { ...course, enrollmentCount: 0 };
          }
        })
      );
      setRecentCourses(coursesWithEnrollments);
    } catch (error) {
      setRecentCourses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Quản trị</h1>
        <p className="text-gray-600">Tổng quan hệ thống quản lý khóa học</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              📚
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalCourses}</h3>
              <p className="text-gray-600">Tổng khóa học</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-green-600">✓ {stats.publishedCourses} đã xuất bản</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              👥
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalStudents}</h3>
              <p className="text-gray-600">Tổng học viên</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/courses" className="text-sm text-purple-600 hover:text-purple-800">
              Xem chi tiết →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              📖
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalLessons}</h3>
              <p className="text-gray-600">Tổng bài học</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <span>{stats.totalModules} module • {stats.totalQuizzes} quiz</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              🎓
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalCertificates}</h3>
              <p className="text-gray-600">Chứng chỉ đã cấp</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/courses" className="text-sm text-yellow-600 hover:text-yellow-800">
              Quản lý chứng chỉ →
            </Link>
          </div>
        </div>
      </div>

      {/* Communication Programs Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              📢
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalCommunicationPrograms}</h3>
              <p className="text-gray-600">Chương trình truyền thông</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-green-600">✓ {stats.activeCommunicationPrograms} đang hoạt động</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-cyan-100 text-cyan-600">
              🤝
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalCommunicationParticipants}</h3>
              <p className="text-gray-600">Người tham gia</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/communication/programs" className="text-sm text-cyan-600 hover:text-cyan-800">
              Xem chi tiết →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center">
            <Link 
              to="/admin/communication/programs" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Quản lý chương trình truyền thông
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Courses */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Khóa học mới nhất</h2>
                <Link 
                  to="/admin/courses" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Xem tất cả →
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentCourses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📚</div>
                  <p>Chưa có khóa học nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {course.description ? (
                            course.description.length > 100 
                              ? course.description.substring(0, 100) + '...'
                              : course.description
                          ) : 'Không có mô tả'}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>
                            {course.createdAt 
                              ? new Date(course.createdAt).toLocaleDateString('vi-VN')
                              : 'N/A'
                            }
                          </span>
                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                            {course.enrollmentCount} học viên
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex space-x-2">
                        <Link
                          to={`/admin/courses/${course.id}`}
                          className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded text-sm font-medium"
                        >
                          Chi tiết
                        </Link>
                        <Link
                          to={`/admin/courses/${course.id}/edit`}
                          className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1 rounded text-sm font-medium"
                        >
                          Sửa
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div>
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Hoạt động gần đây</h2>
            </div>
            <div className="p-6">
              {stats.recentActivities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📊</div>
                  <p>Chưa có hoạt động nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.timestamp 
                            ? new Date(activity.timestamp).toLocaleString('vi-VN')
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Courses */}
          <div className="bg-white rounded-lg shadow-md mt-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Khóa học phổ biến</h2>
            </div>
            <div className="p-6">
              {topCourses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🏆</div>
                  <p>Chưa có dữ liệu</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topCourses.map((course, index) => (
                    <div key={course.id} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' : 
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {course.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {course.enrollmentCount || 0} học viên
                        </p>
                      </div>
                      <Link
                        to={`/admin/courses/${course.id}`}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        Xem →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/courses/create"
              className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <div className="p-2 bg-blue-500 text-white rounded">
                ➕
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-blue-900">Tạo khóa học mới</h3>
                <p className="text-sm text-blue-600">Thêm khóa học vào hệ thống</p>
              </div>
            </Link>

            <Link
              to="/admin/courses"
              className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
            >
              <div className="p-2 bg-green-500 text-white rounded">
                📚
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-green-900">Quản lý khóa học</h3>
                <p className="text-sm text-green-600">Xem và chỉnh sửa khóa học</p>
              </div>
            </Link>

            <Link
              to="/user-management"
              className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
            >
              <div className="p-2 bg-purple-500 text-white rounded">
                👥
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-purple-900">Quản lý người dùng</h3>
                <p className="text-sm text-purple-600">Quản lý tài khoản học viên</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
