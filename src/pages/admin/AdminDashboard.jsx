import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
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
      // Sử dụng API thực tế từ backend
      console.log('Đang tải dữ liệu dashboard...');
      
      // Lấy tổng số khóa học
      let totalCourses = 0;
      let publishedCourses = 0;
      let totalModules = 0;
      let totalLessons = 0;
      let totalQuizzes = 0;
      let totalStudents = 0;
      let totalCertificates = 0;
      let recentActivities = [];
      
      // Lấy tổng số khóa học - backend chưa có API count, dùng fallback
      try {
        console.log('Đang lấy danh sách tất cả khóa học...');
        const allCoursesResponse = await axios.get('/api/courses');
        console.log('Response từ /api/courses:', allCoursesResponse.data);
        
        const courses = allCoursesResponse.data || [];
        totalCourses = Array.isArray(courses) ? courses.length : 0;
        
        // Đếm số khóa học đã xuất bản
        publishedCourses = Array.isArray(courses) 
          ? courses.filter(course => course.status === 'PUBLISHED' || course.status === 'published').length
          : 0;
          
        console.log(`Tổng khóa học: ${totalCourses}, Đã xuất bản: ${publishedCourses}`);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách khóa học:', error);
        // Nếu không lấy được, thử không có /api
        try {
          console.log('Thử lại với endpoint /courses...');
          const allCoursesResponse = await axios.get('/courses');
          const courses = allCoursesResponse.data || [];
          totalCourses = Array.isArray(courses) ? courses.length : 0;
          publishedCourses = Array.isArray(courses) 
            ? courses.filter(course => course.status === 'PUBLISHED' || course.status === 'published').length
            : 0;
          console.log(`Tổng khóa học (không /api): ${totalCourses}`);
        } catch (err) {
          console.error('Không thể lấy danh sách khóa học:', err);
          // Fallback: giá trị mặc định từ backend demo
          totalCourses = 0;
          publishedCourses = 0;
        }
      }
      
      // Đếm tổng số học viên đăng ký - Sử dụng service mới từ enrollmentService.js
      try {
        console.log('Bắt đầu gọi API đếm số học viên');
        const response = await getEnrolledUsersCount();
        console.log('Response từ API enrollments/count:', response);
        totalStudents = response.count || 0;
        console.log('Số lượng học viên đã đăng ký:', totalStudents);
        
        // Nếu vẫn không lấy được dữ liệu, thử gọi trực tiếp
        if (!response.count) {
          console.log('Không lấy được count từ API, thử gọi trực tiếp');
          // Gọi trực tiếp API backend không qua service
          const directResponse = await axios.get('http://localhost:8080/api/enrollments/count', {
            auth: {
              username: 'admin',
              password: '123456'
            }
          });
          console.log('Kết quả gọi trực tiếp:', directResponse.data);
          totalStudents = directResponse.data.count || 0;
        }
      } catch (error) {
        console.error('Lỗi khi lấy số lượng học viên đã đăng ký:', error);
        console.error('Chi tiết lỗi:', error.response ? error.response.data : 'Không có chi tiết');
        // Fallback: thử lấy danh sách người dùng có role STUDENT
        try {
          console.log('Sử dụng phương pháp fallback để lấy học viên');
          const usersResponse = await axios.get('/api/users?role=STUDENT');
          totalStudents = usersResponse.data.length || 0;
          console.log('Số lượng học viên (fallback):', totalStudents);
        } catch (err) {
          console.error('Không thể lấy số lượng học viên:', err);
          totalStudents = 0;
        }
      }
      
      // Lấy danh sách tất cả modules và lessons
      // Lấy tổng số modules - backend chưa có API count riêng
      try {
        console.log('Đang lấy tổng số modules...');
        // Thử lấy từ danh sách courses và đếm modules
        const allCoursesResponse = await axios.get('/api/courses');
        const courses = allCoursesResponse.data || [];
        console.log('Courses data cho modules:', courses);
        
        if (Array.isArray(courses)) {
          totalModules = courses.reduce((count, course) => {
            const moduleCount = Array.isArray(course.modules) ? course.modules.length : 0;
            console.log(`Course ${course.id || course.title}: ${moduleCount} modules`);
            return count + moduleCount;
          }, 0);
        }
        console.log('Tổng modules:', totalModules);
      } catch (error) {
        console.error('Lỗi khi lấy số lượng modules:', error);
        // Thử endpoint khác
        try {
          const allCoursesResponse = await axios.get('/courses');
          const courses = allCoursesResponse.data || [];
          if (Array.isArray(courses)) {
            totalModules = courses.reduce((count, course) => {
              return count + (Array.isArray(course.modules) ? course.modules.length : 0);
            }, 0);
          }
        } catch (err) {
          console.error('Không thể đếm modules:', err);
          totalModules = 0;
        }
      }
      
      // Lấy số lượng lessons - dùng service chuẩn
      try {
        const lessonCountResponse = await countLessons();
        console.log('API countLessons trả về:', lessonCountResponse);
        if (lessonCountResponse && lessonCountResponse.data && typeof lessonCountResponse.data.count !== 'undefined') {
          totalLessons = lessonCountResponse.data.count;
        } else {
          toast.error('API countLessons trả về dữ liệu không hợp lệ: ' + JSON.stringify(lessonCountResponse.data));
          totalLessons = 0;
        }
        console.log('Số lượng bài học từ service countLessons:', totalLessons);
      } catch (error) {
        console.error('Lỗi khi lấy tổng số bài học:', error);
        toast.error('Lỗi khi lấy tổng số bài học: ' + (error?.message || ''));
        totalLessons = 0;
      }
      
      // Lấy số lượng quizzes (nếu có API)
      try {
        const quizCountResponse = await axios.get('/api/quizzes/count');
        totalQuizzes = quizCountResponse.data.count || 0;
        console.log('Số lượng quiz:', totalQuizzes);
      } catch (error) {
        console.error('Lỗi khi lấy số lượng quiz:', error);
        totalQuizzes = 0;
      }
      
      // Lấy số lượng chứng chỉ đã cấp
      try {
        // Lấy số lượng chứng chỉ
        const certificateCountResponse = await axios.get('/api/certificates/count');
        totalCertificates = certificateCountResponse.data.count || 0;
        console.log('Số lượng chứng chỉ đã cấp:', totalCertificates);
      } catch (error) {
        console.error('Lỗi khi lấy số lượng chứng chỉ:', error);
        totalCertificates = 0;
      }
      
      // Cập nhật state với dữ liệu đã thu thập
      setStats({
        totalCourses,
        publishedCourses,
        totalStudents,
        totalCertificates,
        totalModules,
        totalLessons,
        totalQuizzes,
        recentActivities: [] // Mô phỏng vì không có API admin/recent-activities
      });

      // Lấy danh sách khóa học gần đây
      try {
        // Thử lấy danh sách khóa học gần đây
        const recentCoursesResponse = await axios.get('/api/courses');
        // Vì backend không hỗ trợ sắp xếp, lấy tất cả khóa học và sắp xếp ở frontend
        const courses = recentCoursesResponse.data || [];
        
        // Giả định rằng có trường createdDate hoặc createdAt
        const sortedCourses = Array.isArray(courses) 
          ? courses
              .sort((a, b) => {
                // Thử các trường ngày có thể có
                const dateA = a.createdDate || a.createdAt || a.creationDate || '0';
                const dateB = b.createdDate || b.createdAt || b.creationDate || '0';
                return new Date(dateB) - new Date(dateA); // Sắp xếp giảm dần
              })
              .slice(0, 5) // Chỉ lấy 5 khóa học
          : [];
          
        setRecentCourses(sortedCourses);
        console.log('Khóa học gần đây:', sortedCourses);
      } catch (error) {
        console.error('Lỗi khi lấy khóa học gần đây:', error);
        setRecentCourses([]);
      }

      // Không có API top-enrolled, dùng danh sách khóa học thông thường
      setTopCourses(recentCourses.slice(0, 5)); // Tạm dùng recentCourses

    } catch (error) {
      console.error('Lỗi khi tải dữ liệu dashboard:', error);
      toast.error('Có lỗi khi tải dữ liệu dashboard, một số thống kê có thể không chính xác');
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
      console.log('Đang tải danh sách khóa học với số lượng học viên...');
      
      // Lấy tất cả khóa học
      const res = await axios.get('/courses');
      const courses = res.data || [];
      
      // Sắp xếp theo ngày tạo (giả định có trường ngày tạo)
      const sortedCourses = Array.isArray(courses)
        ? courses.sort((a, b) => {
            const dateA = a.createdDate || a.createdAt || a.creationDate || '0';
            const dateB = b.createdDate || b.createdAt || b.creationDate || '0';
            return new Date(dateB) - new Date(dateA);
          }).slice(0, 5)
        : [];
      
      // Lấy enrollments cho từng courseId
      const coursesWithEnrollments = await Promise.all(
        sortedCourses.map(async (course) => {
          try {
            // Thử nhiều endpoint khác nhau vì không chắc API nào hoạt động
            try {
              const enrollmentsRes = await axios.get(`/courses/${course.id}/enrollments`);
              const enrollmentCount = Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data.length : 0;
              return { ...course, enrollmentCount };
            } catch (err) {
              // Thử endpoint thay thế
              const enrollmentsAltRes = await axios.get(`/enrollments/course/${course.id}`);
              const enrollmentCount = Array.isArray(enrollmentsAltRes.data) ? enrollmentsAltRes.data.length : 0;
              return { ...course, enrollmentCount };
            }
          } catch (error) {
            console.log(`Không thể lấy số học viên cho khóa học ${course.id}:`, error);
            return { ...course, enrollmentCount: 0 };
          }
        })
      );
      
      console.log('Khóa học với số học viên:', coursesWithEnrollments);
      setRecentCourses(coursesWithEnrollments);
    } catch (error) {
      console.error('Lỗi khi tải danh sách khóa học:', error);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Dashboard Quản trị
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tổng quan hệ thống quản lý khóa học và theo dõi hoạt động của platform
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-4 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-6">
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalCourses}</h3>
                  <p className="text-gray-600 font-medium">Tổng khóa học</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center text-sm text-green-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Đang hoạt động tốt
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-4 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <div className="ml-6">
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalStudents}</h3>
                  <p className="text-gray-600 font-medium">Tổng học viên</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center text-sm text-purple-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                Số lượng tăng mạnh
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-4 rounded-full bg-gradient-to-br from-green-100 to-green-200 text-green-600">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </div>
                <div className="ml-6">
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalLessons}</h3>
                  <p className="text-gray-600 font-medium">Tổng bài học</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center text-sm text-green-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                Nội dung phong phú
              </div>
            </div>
          </div>
        </div>

        {/* Recent Courses */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-12">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Khóa học mới nhất</h2>
                <p className="text-gray-600">Danh sách các khóa học được tạo gần đây</p>
              </div>
              <Link 
                to="/admin/courses" 
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <span>Xem tất cả</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="p-8">
            {recentCourses.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có khóa học nào</h3>
                <p className="text-gray-500">Hãy tạo khóa học đầu tiên cho hệ thống</p>
              </div>
            ) : (
              <div className="space-y-6">
                {recentCourses.map((course, index) => (
                  <div key={course.id} className="group p-6 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold mr-4">
                            {index + 1}
                          </span>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {course.title}
                          </h3>
                        </div>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {course.description ? (
                            course.description.length > 150 
                              ? course.description.substring(0, 150) + '...'
                              : course.description
                          ) : 'Chưa có mô tả cho khóa học này'}
                        </p>
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center text-gray-500">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            {course.createdAt 
                              ? new Date(course.createdAt).toLocaleDateString('vi-VN')
                              : 'Ngày tạo không xác định'
                            }
                          </div>
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                              </svg>
                              {course.enrollmentCount || 0} học viên
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-3 ml-8">
                        <Link
                          to={`/admin/courses/${course.id}`}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Chi tiết
                        </Link>
                        <Link
                          to={`/admin/courses/${course.id}/edit`}
                          className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Chỉnh sửa
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thao tác nhanh</h2>
            <p className="text-gray-600">Các tác vụ thường dùng để quản lý hệ thống</p>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/admin/courses/create"
                className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors">
                    Tạo khóa học mới
                  </h3>
                  <p className="text-blue-700 group-hover:text-blue-600 transition-colors">
                    Thêm khóa học mới vào hệ thống với đầy đủ thông tin và nội dung
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              </Link>

              <Link
                to="/admin/courses"
                className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl border-2 border-green-200 hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-green-600 text-white rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-green-900 mb-2 group-hover:text-green-700 transition-colors">
                    Quản lý khóa học
                  </h3>
                  <p className="text-green-700 group-hover:text-green-600 transition-colors">
                    Xem, chỉnh sửa và quản lý tất cả khóa học có trong hệ thống
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
              </Link>

              <Link
                to="/user-management"
                className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-purple-600 text-white rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-purple-900 mb-2 group-hover:text-purple-700 transition-colors">
                    Quản lý người dùng
                  </h3>
                  <p className="text-purple-700 group-hover:text-purple-600 transition-colors">
                    Quản lý tài khoản, quyền hạn và thông tin của học viên
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
