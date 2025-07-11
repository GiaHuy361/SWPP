import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { communicationApi } from '../../services/communicationApi';
import { getEnrolledUsersCount } from '../../services/enrollmentService';
import { countLessons } from '../../services/courseService';

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
      // Kết hợp dữ liệu từ cả hai nhánh
      // Fetch các dữ liệu từ API thực tế nếu có
      const communicationStats = await fetchCommunicationStats();
      const courseStats = await fetchCourseStats();
      
      setStats({
        ...stats,
        ...communicationStats,
        ...courseStats,
        recentActivities: [
          {
            id: 1,
            type: 'enrollment',
            userName: 'Nguyễn Văn A',
            courseName: 'Phòng chống tác hại của ma túy',
            date: '2025-07-10T15:30:00'
          },
          {
            id: 2,
            type: 'completion',
            userName: 'Trần Thị B',
            courseName: 'Nhận biết các loại ma túy phổ biến',
            date: '2025-07-09T11:20:00'
          },
          {
            id: 3,
            type: 'certificate',
            userName: 'Lê Văn C',
            courseName: 'Kỹ năng từ chối ma túy',
            date: '2025-07-08T14:45:00'
          },
          {
            id: 4,
            type: 'enrollment',
            userName: 'Phạm Thị D',
            courseName: 'Tác động của ma túy đối với sức khỏe',
            date: '2025-07-07T09:15:00'
          },
          {
            id: 5,
            type: 'feedback',
            userName: 'Võ Văn E',
            courseName: 'Phòng chống tác hại của ma túy',
            date: '2025-07-06T16:30:00'
          }
        ]
      });
      
      // Thiết lập dữ liệu khóa học
      setRecentCourses([
        {
          id: 1,
          title: 'Phòng chống tác hại của ma túy',
          enrollments: 45,
          dateCreated: '2025-06-15T10:00:00',
          image: 'https://placehold.co/200x120'
        },
        {
          id: 2,
          title: 'Nhận biết các loại ma túy phổ biến',
          enrollments: 32,
          dateCreated: '2025-06-20T09:30:00',
          image: 'https://placehold.co/200x120'
        },
        {
          id: 3,
          title: 'Kỹ năng từ chối ma túy',
          enrollments: 28,
          dateCreated: '2025-06-25T14:00:00',
          image: 'https://placehold.co/200x120'
        }
      ]);
      
      setTopCourses([
        {
          id: 1,
          title: 'Phòng chống tác hại của ma túy',
          enrollments: 45,
          completionRate: 80,
          rating: 4.7
        },
        {
          id: 2,
          title: 'Nhận biết các loại ma túy phổ biến',
          enrollments: 32,
          completionRate: 75,
          rating: 4.5
        },
        {
          id: 3,
          title: 'Kỹ năng từ chối ma túy',
          enrollments: 28,
          completionRate: 85,
          rating: 4.9
        },
        {
          id: 4,
          title: 'Tác động của ma túy đối với sức khỏe',
          enrollments: 22,
          completionRate: 70,
          rating: 4.3
        },
        {
          id: 5,
          title: 'Quy định pháp luật về ma túy',
          enrollments: 18,
          completionRate: 65,
          rating: 4.2
        }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Không thể tải dữ liệu bảng điều khiển');
    } finally {
      setLoading(false);
    }
  };

  // Hàm để lấy dữ liệu từ API Communication
  const fetchCommunicationStats = async () => {
    try {
      // Sử dụng communicationApi nếu có
      const programsList = await communicationApi.getPrograms();
      const activePrograms = programsList.filter(program => 
        program.status && program.status.toUpperCase() === 'ACTIVE'
      );
      
      // Tính tổng số người tham gia
      let totalParticipants = 0;
      programsList.forEach(program => {
        if (program.participantCount) {
          totalParticipants += program.participantCount;
        }
      });
      
      return {
        totalCommunicationPrograms: programsList.length || 0,
        activeCommunicationPrograms: activePrograms.length || 0,
        totalCommunicationParticipants: totalParticipants
      };
    } catch (error) {
      console.error('Error fetching communication stats:', error);
      // Trả về giá trị mặc định nếu có lỗi
      return {
        totalCommunicationPrograms: 0,
        activeCommunicationPrograms: 0,
        totalCommunicationParticipants: 0
      };
    }
  };

  // Hàm để lấy dữ liệu từ API Course
  const fetchCourseStats = async () => {
    try {
      const [coursesResponse, enrolledCountResponse, lessonCountResponse] = await Promise.allSettled([
        axios.get('/courses'),
        getEnrolledUsersCount(),
        countLessons()
      ]);
      
      const courses = coursesResponse.status === 'fulfilled' ? coursesResponse.value.data : [];
      const totalStudents = enrolledCountResponse.status === 'fulfilled' ? enrolledCountResponse.value : 0;
      const lessonCount = lessonCountResponse.status === 'fulfilled' ? lessonCountResponse.value : 0;
      
      // Đếm số khóa học đã xuất bản
      const published = courses.filter(course => course.status === 'PUBLISHED').length;
      
      // Đếm số module (giả định)
      const moduleCount = Math.round(courses.length * 2.5);
      
      // Đếm số quiz (giả định)
      const quizCount = Math.round(lessonCount * 0.4);
      
      // Đếm số chứng chỉ (giả định)
      const certificateCount = Math.round(totalStudents * 0.5);
      
      return {
        totalCourses: courses.length,
        publishedCourses: published,
        totalModules: moduleCount,
        totalLessons: lessonCount,
        totalQuizzes: quizCount,
        totalStudents: totalStudents,
        totalCertificates: certificateCount
      };
    } catch (error) {
      console.error('Error fetching course stats:', error);
      // Trả về giá trị mặc định nếu có lỗi
      return {
        totalCourses: 0,
        publishedCourses: 0,
        totalModules: 0,
        totalLessons: 0,
        totalQuizzes: 0,
        totalStudents: 0,
        totalCertificates: 0
      };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'enrollment':
        return (
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
        );
      case 'completion':
        return (
          <div className="p-2 bg-green-100 rounded-full">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        );
      case 'certificate':
        return (
          <div className="p-2 bg-purple-100 rounded-full">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
        );
      case 'feedback':
        return (
          <div className="p-2 bg-yellow-100 rounded-full">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
          </div>
        );
      default:
        return (
          <div className="p-2 bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        );
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'enrollment':
        return (
          <span>
            <span className="font-medium">{activity.userName}</span> đã đăng ký khóa học <span className="font-medium">{activity.courseName}</span>
          </span>
        );
      case 'completion':
        return (
          <span>
            <span className="font-medium">{activity.userName}</span> đã hoàn thành khóa học <span className="font-medium">{activity.courseName}</span>
          </span>
        );
      case 'certificate':
        return (
          <span>
            <span className="font-medium">{activity.userName}</span> đã nhận chứng chỉ cho khóa học <span className="font-medium">{activity.courseName}</span>
          </span>
        );
      case 'feedback':
        return (
          <span>
            <span className="font-medium">{activity.userName}</span> đã đánh giá khóa học <span className="font-medium">{activity.courseName}</span>
          </span>
        );
      default:
        return <span>{activity.userName} đã thực hiện một hành động</span>;
    }
  };

  const getActivityLink = (activity) => {
    switch (activity.type) {
      case 'enrollment':
        return `/admin/courses/${activity.courseId}/students`;
      case 'completion':
        return `/admin/courses/${activity.courseId}/students`;
      case 'certificate':
        return `/admin/courses/${activity.courseId}/certificates`;
      case 'feedback':
        return `/admin/courses/${activity.courseId}`;
      default:
        return '#';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Bảng điều khiển Quản trị</h1>
        
        {/* Thống kê tổng quan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Khóa học</div>
                <div className="text-xl font-semibold">{stats.totalCourses}</div>
                <div className="text-sm text-green-600">{stats.publishedCourses} đã xuất bản</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Học viên</div>
                <div className="text-xl font-semibold">{stats.totalStudents}</div>
                <div className="text-sm text-green-600">{stats.totalCertificates} chứng chỉ</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Bài học</div>
                <div className="text-xl font-semibold">{stats.totalLessons}</div>
                <div className="text-sm text-green-600">{stats.totalModules} module</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 mr-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Trắc nghiệm</div>
                <div className="text-xl font-semibold">{stats.totalQuizzes}</div>
                <div className="text-sm text-green-600">Trung bình {Math.round(stats.totalQuizzes / (stats.totalModules || 1))} / module</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 mr-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Chương trình truyền thông</div>
                <div className="text-xl font-semibold">{stats.totalCommunicationPrograms}</div>
                <div className="text-sm text-green-600">{stats.activeCommunicationPrograms} đang hoạt động</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-pink-100 mr-4">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Người tham gia truyền thông</div>
                <div className="text-xl font-semibold">{stats.totalCommunicationParticipants}</div>
                <div className="text-sm text-green-600">Trung bình {Math.round(stats.totalCommunicationParticipants / (stats.totalCommunicationPrograms || 1))} / chương trình</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Khung chính */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hoạt động gần đây */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-lg text-gray-800">Hoạt động gần đây</h2>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {stats.recentActivities.map((activity, index) => (
                    <li key={activity.id || index} className="flex items-start gap-4">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600">
                          {getActivityText(activity)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(activity.date)}
                        </p>
                      </div>
                      <Link 
                        to={getActivityLink(activity)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Xem
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            {/* Khóa học mới thêm gần đây */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold text-lg text-gray-800">Khóa học mới thêm gần đây</h2>
                <Link to="/admin/courses" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Xem tất cả
                </Link>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recentCourses.map(course => (
                    <Link to={`/admin/courses/${course.id}`} key={course.id} className="group">
                      <div className="bg-gray-50 rounded-lg overflow-hidden transition duration-300 transform group-hover:scale-105 group-hover:shadow-md">
                        <img 
                          src={course.image}
                          alt={course.title}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 group-hover:text-blue-600 truncate">{course.title}</h3>
                          <div className="flex justify-between mt-2 text-sm">
                            <span className="text-gray-600">{course.enrollments} đăng ký</span>
                            <span className="text-gray-500">{formatDate(course.dateCreated).split(',')[0]}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Khóa học hàng đầu */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-lg text-gray-800">Khóa học hàng đầu</h2>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khóa học</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đăng ký</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tỷ lệ hoàn thành</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đánh giá</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {topCourses.map(course => (
                        <tr key={course.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{course.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-900">{course.enrollments}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${course.completionRate}%` }}></div>
                              </div>
                              <span className="text-gray-900">{course.completionRate}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex items-center text-yellow-400 mr-1">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'fill-current' : 'stroke-current fill-transparent'}`} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                                  </svg>
                                ))}
                              </div>
                              <span className="text-gray-900">{course.rating}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
