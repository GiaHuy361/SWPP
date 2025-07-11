import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { communicationApi } from '../../services/communicationApi';
import { getEnrolledUsersCount } from '../../services/enrollmentService';
import { countLessons, countQuizzes } from '../../services/courseService';

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
  const [visibleSections, setVisibleSections] = useState({
    courseManagement: true,
    statistics: true,
    coursesList: true,
    additionalInfo: true
  });

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
      // Sử dụng các API đã được cập nhật để khớp với backend
      // Get courses and course count in parallel
      const [coursesResponse, courseCountResponse, enrolledCountResponse, lessonCountResponse] = await Promise.allSettled([
        axios.get('/api/courses'),
        axios.get('/api/courses/count'),
        getEnrolledUsersCount(),
        countLessons()
      ]);
      
      // Process course data
      const courses = coursesResponse.status === 'fulfilled' ? coursesResponse.value.data : [];
      
      // Get course count from API or use the length of courses array
      const totalCourses = courseCountResponse.status === 'fulfilled' && 
                         courseCountResponse.value.data && 
                         typeof courseCountResponse.value.data.count === 'number' ? 
                         courseCountResponse.value.data.count : courses.length;
      
      // Đảm bảo lấy đúng giá trị count từ đối tượng trả về
      const totalStudents = enrolledCountResponse.status === 'fulfilled' && 
                          enrolledCountResponse.value && 
                          typeof enrolledCountResponse.value.count === 'number' ? 
                          enrolledCountResponse.value.count : 0;
      
      // Đảm bảo lấy đúng giá trị count từ response, hoặc trả về giá trị mặc định
      let lessonCount = lessonCountResponse.status === 'fulfilled' ? 
                      (typeof lessonCountResponse.value === 'number' ? 
                       lessonCountResponse.value : 12) : 12;
      
      // Đếm số khóa học đã xuất bản
      const published = courses.filter(course => course.status === 'PUBLISHED').length;
      
      // Đếm số module (giả định)
      const moduleCount = Math.round(courses.length * 2.5);
      
      // Lấy số quizzes từ API hoặc dùng giá trị giả định nếu không có
      let quizCount = 0;
      // Lấy quiz count cho course id đầu tiên nếu có
      if (courses.length > 0) {
        try {
          quizCount = await countQuizzes(courses[0].id);
        } catch (error) {
          console.error('Error fetching quiz count:', error);
          quizCount = Math.round(lessonCount * 0.4); // Fallback to estimation
        }
      } else {
        quizCount = Math.round(lessonCount * 0.4); // Fallback to estimation if no courses
      }
      
      // Đếm số chứng chỉ (giả định)
      const certificateCount = Math.round(totalStudents * 0.5);
      
      return {
        totalCourses: totalCourses,
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
    // Kiểm tra courseId có tồn tại không
    if (!activity.courseId) {
      return '#'; // Trả về # nếu không có courseId
    }
    
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

  const toggleSection = (section) => {
    setVisibleSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 md:p-6 bg-gray-50 min-h-screen w-full">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Bảng điều khiển Quản trị</h1>
        
        {/* Quản lý khóa học */}
        <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-lg text-gray-800">Quản lý khóa học</h2>
            <button 
              onClick={() => toggleSection('courseManagement')} 
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {visibleSections.courseManagement ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              )}
            </button>
          </div>
          {visibleSections.courseManagement && (
          <div className="p-6">
                
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Main Course Management */}
                <div className="lg:col-span-2">
                  <h3 className="font-medium text-gray-700 mb-3">Khóa học</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/admin/courses" className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium p-4 rounded-lg transition duration-300 h-28">
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                      </svg>
                      <span className="text-center text-sm">Danh sách</span>
                    </Link>
                    <Link to="/admin/courses/create" className="flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 text-green-700 font-medium p-4 rounded-lg transition duration-300 h-28">
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      <span className="text-center text-sm">Tạo mới</span>
                    </Link>
                  </div>
                </div>

                {/* Module Management - Lưu ý: Đường dẫn này sẽ hoạt động khi chọn một khóa học cụ thể */}
                <div style={{ display: 'none' }}>
                  <h3 className="font-medium text-gray-700 mb-3">Học phần</h3>
                  <div className="flex flex-col items-center justify-center bg-yellow-50 text-yellow-700 font-medium p-4 rounded-lg h-28 cursor-not-allowed opacity-80">
                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                    </svg>
                    <span className="text-center text-sm">Chọn khóa học</span>
                  </div>
                </div>

                {/* Lesson Management - Lưu ý: Đường dẫn này sẽ hoạt động khi chọn một khóa học và học phần cụ thể */}
                <div style={{ display: 'none' }}>
                  <h3 className="font-medium text-gray-700 mb-3">Bài học</h3>
                  <div className="flex flex-col items-center justify-center bg-purple-50 text-purple-700 font-medium p-4 rounded-lg h-28 cursor-not-allowed opacity-80">
                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span className="text-center text-sm">Chọn module</span>
                  </div>
                </div>

                {/* Quiz Management - Lưu ý: Đường dẫn này sẽ hoạt động khi chọn một khóa học, học phần và bài học cụ thể */}
                <div style={{ display: 'none' }}>
                  <h3 className="font-medium text-gray-700 mb-3">Trắc nghiệm</h3>
                  <div className="flex flex-col items-center justify-center bg-orange-50 text-orange-700 font-medium p-4 rounded-lg h-28 cursor-not-allowed opacity-80">
                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="text-center text-sm">Chọn bài học</span>
                  </div>
                </div>

                {/* Student and Certificate Management - Lưu ý: Đường dẫn cần được chọn một khóa học cụ thể */}
                <div className="lg:col-span-2" style={{ display: 'none' }}>
                  <h3 className="font-medium text-gray-700 mb-3">Người học & Chứng chỉ</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col items-center justify-center bg-red-50 text-red-700 font-medium p-4 rounded-lg h-28 cursor-not-allowed opacity-80">
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span className="text-center text-sm">Chọn khóa học</span>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-teal-50 text-teal-700 font-medium p-4 rounded-lg h-28 cursor-not-allowed opacity-80">
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                      </svg>
                      <span className="text-center text-sm">Chọn khóa học</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100" style={{ display: 'none' }}>
                <div className="flex items-center text-blue-700 mb-2">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="font-medium">Lưu ý</span>
                </div>
                <p className="text-sm text-blue-600">Để quản lý chi tiết về học phần, bài học hoặc trắc nghiệm của một khóa học cụ thể, hãy vào Danh sách khóa học và chọn khóa học tương ứng.</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Thống kê tổng quan */}
        <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-lg text-gray-800">Thống kê tổng quan</h2>
            <button 
              onClick={() => toggleSection('statistics')} 
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {visibleSections.statistics ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              )}
            </button>
          </div>
          {visibleSections.statistics && (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              
              <div className="bg-white rounded-lg shadow p-6" style={{ display: 'none' }}>
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
              
              <div className="bg-white rounded-lg shadow p-6" style={{ display: 'none' }}>
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
              
              <div className="bg-white rounded-lg shadow p-6" style={{ display: 'none' }}>
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
          )}
        </div>
        
        {/* Khung chính */}
        <div className="grid grid-cols-1 gap-8">
          {/* Danh sách khóa học */}
          {visibleSections.coursesList && (
            <div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="font-semibold text-lg text-gray-800">Danh sách khóa học</h2>
                </div>
                <div className="p-6">
                  {recentCourses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {recentCourses.map((course) => (
                        <Link key={course.id} to={`/admin/courses/${course.id}`} className="block">
                          <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
                            <div className="h-32 bg-gray-100 overflow-hidden">
                              {course.image ? (
                                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                  <svg className="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h3 className="font-medium text-gray-800 mb-1 truncate">{course.title}</h3>
                              <div className="flex justify-between text-sm text-gray-600">
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                  </svg>
                                  {course.enrollments} học viên
                                </span>
                                <span className="text-xs text-gray-500">{formatDate(course.dateCreated).split(',')[0]}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                      <p className="mt-2 text-gray-600">Chưa có khóa học nào.</p>
                      <Link to="/admin/courses/create" className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Tạo khóa học</Link>
                    </div>
                  )}
                  
                  {recentCourses.length > 0 && (
                    <div className="mt-6 text-center">
                      <Link to="/admin/courses" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <svg className="mr-2 -ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                        Xem tất cả khóa học
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Thông tin thêm */}
          {visibleSections.additionalInfo && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-lg text-gray-800">Thông tin thêm</h2>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Hướng dẫn quản lý khóa học</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Quy trình quản lý</h4>
                  <ol className="list-decimal ml-5 text-gray-600 space-y-2 text-sm">
                    <li>Tạo khóa học mới từ mục <span className="text-green-600 font-medium">Tạo mới</span></li>
                    <li style={{ display: 'none' }}>Thêm các học phần (modules) vào khóa học từ trang chi tiết khóa học</li>
                    <li style={{ display: 'none' }}>Tạo bài học và trắc nghiệm cho từng học phần</li>
                    <li style={{ display: 'none' }}>Quản lý học viên và cấp chứng chỉ khi học viên hoàn thành</li>
                  </ol>
                </div>

                <h3 className="text-lg font-medium text-gray-800 mb-3">Cấu trúc đường dẫn</h3>
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full border border-gray-200 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-2 px-3 text-left border-b">Tính năng</th>
                        <th className="py-2 px-3 text-left border-b">Mô tả</th>
                        <th className="py-2 px-3 text-left border-b">Đường dẫn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="py-2 px-3">Danh sách khóa học</td>
                        <td className="py-2 px-3">Quản lý tất cả khóa học</td>
                        <td className="py-2 px-3 text-blue-600">/admin/courses</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">Tạo khóa học</td>
                        <td className="py-2 px-3">Tạo khóa học mới</td>
                        <td className="py-2 px-3 text-blue-600">/admin/courses/create</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">Chi tiết khóa học</td>
                        <td className="py-2 px-3">Xem thông tin chi tiết khóa học</td>
                        <td className="py-2 px-3 text-blue-600">/admin/courses/:courseId</td>
                      </tr>
                      <tr style={{ display: 'none' }}>
                        <td className="py-2 px-3">Quản lý module</td>
                        <td className="py-2 px-3">Quản lý học phần của khóa học</td>
                        <td className="py-2 px-3 text-blue-600">/admin/courses/:courseId/modules</td>
                      </tr>
                      <tr style={{ display: 'none' }}>
                        <td className="py-2 px-3">Tạo module</td>
                        <td className="py-2 px-3">Tạo học phần mới</td>
                        <td className="py-2 px-3 text-blue-600">/admin/courses/:courseId/modules/create</td>
                      </tr>
                      <tr style={{ display: 'none' }}>
                        <td className="py-2 px-3">Quản lý bài học</td>
                        <td className="py-2 px-3">Quản lý bài học của học phần</td>
                        <td className="py-2 px-3 text-blue-600">/admin/courses/:courseId/modules/:moduleId/lessons</td>
                      </tr>
                      <tr style={{ display: 'none' }}>
                        <td className="py-2 px-3">Quản lý trắc nghiệm</td>
                        <td className="py-2 px-3">Quản lý trắc nghiệm của bài học</td>
                        <td className="py-2 px-3 text-blue-600">/admin/courses/:courseId/modules/:moduleId/lessons/:lessonId/quizzes</td>
                      </tr>
                      <tr style={{ display: 'none' }}>
                        <td className="py-2 px-3">Quản lý học viên</td>
                        <td className="py-2 px-3">Quản lý học viên của khóa học</td>
                        <td className="py-2 px-3 text-blue-600">/admin/courses/:courseId/students</td>
                      </tr>
                      <tr style={{ display: 'none' }}>
                        <td className="py-2 px-3">Quản lý chứng chỉ</td>
                        <td className="py-2 px-3">Quản lý chứng chỉ của khóa học</td>
                        <td className="py-2 px-3 text-blue-600">/admin/courses/:courseId/certificates</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6" style={{ display: 'none' }}>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-700 mb-2">Tổng số người tham gia</h3>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      <span className="text-2xl font-bold text-blue-700">{stats.totalStudents}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-medium text-green-700 mb-2">Chứng chỉ đã cấp</h3>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                      </svg>
                      <span className="text-2xl font-bold text-green-700">{stats.totalCertificates}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
