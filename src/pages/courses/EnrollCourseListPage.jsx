import React, { useEffect, useState } from 'react';
import { getAllCourses, getModulesByCourseId, getLessonsByModuleId } from '../../services/courseService';
import { getCourseProgress } from '../../services/progressService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';

export default function EnrollCourseListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState({});
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Helper function to get total lesson count for a course (same logic as CoursePage.jsx)
  const getTotalLessonsForCourse = async (courseId) => {
    try {
      const res = await getModulesByCourseId(courseId);
      const modules = res.data || [];
      let totalLessons = 0;
      await Promise.all(
        modules.map(async (module) => {
          try {
            const lessonsRes = await getLessonsByModuleId(module.id);
            totalLessons += (lessonsRes.data || []).length;
          } catch (err) {
            console.warn(`Failed to get lessons for module ${module.id}:`, err);
          }
        })
      );
      return totalLessons;
    } catch (err) {
      console.warn(`Failed to get modules for course ${courseId}:`, err);
      return 0;
    }
  };

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      try {
        const res = await getAllCourses();
        setCourses(res.data || []);
        const statusObj = {};
        const progressObj = {};
        // Lấy enrollments của user
        try {
          const enrollmentRes = await axios.get('/enrollments/user');
          const enrollments = enrollmentRes.data || [];
          await Promise.all(
            enrollments.map(async (enrollment) => {
              if (enrollment.courseId) {
                statusObj[enrollment.courseId] = 'ACTIVE';
                try {
                  const progressRes = await getCourseProgress(enrollment.courseId);
                  const completed = progressRes.data?.map((p) => p.lessonId) || [];
                  const totalLessons = await getTotalLessonsForCourse(enrollment.courseId);
                  progressObj[enrollment.courseId] = totalLessons > 0 ? Math.round((completed.length / totalLessons) * 100) : 0;
                } catch (progressError) {
                  progressObj[enrollment.courseId] = 0;
                }
              }
            })
          );
        } catch (error) {
          console.warn('Failed to get enrollments:', error);
          // Fallback: thử đăng ký để kiểm tra (chỉ test vài khóa học đầu)
          const coursesToCheck = (res.data || []).slice(0, 2);
          await Promise.all(
            coursesToCheck.map(async (course) => {
              const isEnrolled = await checkEnrollmentByAttempt(course.id);
              if (isEnrolled) {
                statusObj[course.id] = 'ACTIVE';
              }
            })
          );
        }
        setEnrollmentStatus(statusObj);
        setProgressMap(progressObj);
      } catch (err) {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  // Đăng ký khóa học đúng chuẩn RESTful
  const handleEnroll = async (courseId) => {
    try {
      await axios.post(`/enrollments/courses/${courseId}`);
      setEnrollmentStatus((prev) => ({ ...prev, [courseId]: 'ACTIVE' }));
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Đăng ký thất bại.';
      if (errorMsg.includes('already enrolled') || errorMsg.includes('đã đăng ký')) {
        setEnrollmentStatus((prev) => ({ ...prev, [courseId]: 'ACTIVE' }));
        alert('Bạn đã đăng ký khóa học này rồi!');
      } else {
        alert(errorMsg);
      }
    }
  };

  const coursesWithEnroll = courses.map(course => ({
    ...course,
    isEnrolled: enrollmentStatus[course.id] === 'ACTIVE' || enrollmentStatus[course.id] === 'ENROLLED'
  }));

  return (
    <div className="max-w-5xl mx-auto py-10 px-2">
      <h1 className="text-3xl font-bold mb-8 text-blue-800 text-center tracking-tight">Đăng ký khóa học</h1>
      {loading ? (
        <div className="text-gray-400 text-center">Đang tải danh sách khóa học...</div>
      ) : courses.length === 0 ? (
        <div className="text-gray-500 text-center">Không có khóa học nào.</div>
      ) : (
        <div className="flex flex-col gap-7">
          {coursesWithEnroll.map((course) => {
            const hasModules = Array.isArray(course.modules) && course.modules.length > 0;
            const lessonCount = hasModules ? course.modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) : null;
            return (
              <div
                key={course.id}
                className={`w-full rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-gradient-to-r from-blue-50 to-white border-2 ${course.isEnrolled ? 'border-green-500' : 'border-blue-200'} flex flex-col`}
              >
                <div className="bg-blue-700 text-white px-6 py-3 flex items-center justify-between rounded-t-2xl">
                  <h3 className="font-bold text-lg tracking-wide uppercase drop-shadow">{course.level || 'Khóa học'}</h3>
                  <div className="flex items-center gap-2">
                    {course.isEnrolled && (
                      <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold shadow">Đã đăng ký</span>
                    )}
                  </div>
                </div>
                <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold mb-2 text-blue-900 truncate">{course.title || 'Tên khóa học'}</h2>
                    <p className="text-gray-700 text-base mb-4 line-clamp-2 font-medium">{course.description || 'Mô tả sẽ hiển thị ở đây.'}</p>
                    <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-3 font-semibold">
                      {hasModules && (
                        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span> {course.modules.length} module</span>
                      )}
                      {hasModules && lessonCount !== null && (
                        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span> {lessonCount} bài học</span>
                      )}
                      {progressMap[course.id] !== undefined && (
                        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 bg-yellow-400 rounded-full"></span> <span className="text-yellow-700">Tiến độ:</span> <span className="font-bold text-yellow-700">{progressMap[course.id]}%</span></span>
                      )}
                    </div>
                  </div>
                  <div className="w-full md:w-auto flex flex-col gap-2 min-w-[140px]">
                    {course.isEnrolled ? (
                      <div className="space-y-2">
                        <button
                          className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white text-base font-bold shadow hover:from-green-600 hover:to-green-700 transition"
                          onClick={() => navigate(`/courses/${course.id}`)}
                        >
                          Vào học ngay
                        </button>
                        <div className="text-xs text-center text-gray-500">✓ Đã đăng ký</div>
                      </div>
                    ) : (
                      <button
                        className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-base font-bold shadow hover:from-blue-600 hover:to-blue-700 transition"
                        onClick={() => handleEnroll(course.id)}
                      >
                        Đăng ký ngay
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
