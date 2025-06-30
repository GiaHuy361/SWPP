import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../utils/axios';

export default function CourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      // Fetch course details
      const courseResponse = await axios.get(`/courses/${courseId}`);
      setCourse(courseResponse.data);

      // Fetch modules and lessons
      const modulesResponse = await axios.get(`/courses/${courseId}/modules`);
      const modulesData = modulesResponse.data || [];
      
      // Fetch lessons for each module
      const modulesWithLessons = await Promise.all(
        modulesData.map(async (module) => {
          try {
            const lessonsResponse = await axios.get(`/modules/${module.id}/lessons`);
            return {
              ...module,
              lessons: lessonsResponse.data || []
            };
          } catch (error) {
            return { ...module, lessons: [] };
          }
        })
      );
      setModules(modulesWithLessons);

      // Fetch enrollments
      try {
        const enrollmentsResponse = await axios.get(`/enrollments?courseId=${courseId}`);
        setEnrollments(enrollmentsResponse.data || []);
      } catch (error) {
        console.log('Error fetching enrollments:', error);
        setEnrollments([]);
      }

    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const totalLessons = modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy khóa học</p>
            <Link to="/admin/courses" className="text-blue-600 hover:text-blue-800">
              ← Quay lại danh sách khóa học
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link to="/admin/courses" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Quay lại danh sách khóa học
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
              <p className="text-gray-600">{course.description}</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to={`/admin/courses/${courseId}/modules`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Quản lý Module
              </Link>
              <Link
                to={`/admin/courses/${courseId}/students`}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Quản lý Học viên
              </Link>
              <Link
                to={`/admin/courses/${courseId}/certificates`}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Quản lý Chứng chỉ
              </Link>
              <Link
                to={`/admin/courses/${courseId}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Chỉnh sửa
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Nội dung ({modules.length} modules, {totalLessons} bài học)
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'students'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Học viên ({enrollments.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Course Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin khóa học</h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tên khóa học</dt>
                  <dd className="mt-1 text-sm text-gray-900">{course.title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Cấp độ</dt>
                  <dd className="mt-1 text-sm text-gray-900">{course.level}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Mô tả</dt>
                  <dd className="mt-1 text-sm text-gray-900">{course.description}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Điểm tối thiểu</dt>
                  <dd className="mt-1 text-sm text-gray-900">{course.recommendedMinScore}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Điểm tối đa</dt>
                  <dd className="mt-1 text-sm text-gray-900">{course.recommendedMaxScore}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nhóm tuổi</dt>
                  <dd className="mt-1 text-sm text-gray-900">{course.ageGroup}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Nội dung khóa học</h3>
              <Link
                to={`/admin/courses/${courseId}/modules/create`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Thêm module
              </Link>
            </div>

            {modules.length > 0 ? (
              <div className="space-y-4">
                {modules.map((module, index) => (
                  <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-medium text-gray-900">
                        Module {index + 1}: {module.title}
                      </h4>
                      <div className="flex space-x-2">
                        <Link
                          to={`/admin/courses/${courseId}/modules/${module.id}/lessons/create`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          + Thêm bài học
                        </Link>
                        <Link
                          to={`/admin/courses/${courseId}/modules/${module.id}/edit`}
                          className="text-yellow-600 hover:text-yellow-800 text-sm"
                        >
                          Sửa
                        </Link>
                      </div>
                    </div>
                    
                    {module.description && (
                      <p className="text-gray-600 mb-3">{module.description}</p>
                    )}

                    {module.lessons && module.lessons.length > 0 ? (
                      <div className="ml-4 space-y-2">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                            <span className="text-sm text-gray-700">
                              Bài {lessonIndex + 1}: {lesson.title}
                            </span>
                            <div className="flex space-x-2">
                              <Link
                                to={`/admin/courses/${courseId}/modules/${module.id}/lessons/${lesson.id}/edit`}
                                className="text-yellow-600 hover:text-yellow-800 text-xs"
                              >
                                Sửa
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm ml-4">Chưa có bài học nào</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Chưa có module nào</p>
                <Link
                  to={`/admin/courses/${courseId}/modules/create`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Thêm module đầu tiên
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Danh sách học viên</h3>
            
            {enrollments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Học viên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày ghi danh
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tiến độ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {enrollments.map((enrollment) => (
                      <tr key={enrollment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {enrollment.user?.name || enrollment.userName || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {enrollment.user?.email || enrollment.userEmail || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(enrollment.enrollmentDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            enrollment.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : enrollment.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {enrollment.status === 'completed' ? 'Hoàn thành' : 
                             enrollment.status === 'in_progress' ? 'Đang học' : 'Đã ghi danh'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {enrollment.progress || 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Chưa có học viên nào ghi danh</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
