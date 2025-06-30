import React, { useEffect, useState } from 'react';
import { getAllCourses } from '../../services/courseService';
import { Link } from 'react-router-dom';

export default function CourseListPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      try {
        const res = await getAllCourses();
        setCourses(res.data || []);
      } catch (err) {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-blue-800">Danh sách khóa học</h1>
      {loading ? (
        <div className="text-gray-400">Đang tải danh sách khóa học...</div>
      ) : courses.length === 0 ? (
        <div className="text-gray-500">Không có khóa học nào.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
              <div>
                <div className="text-xl font-semibold text-blue-700 mb-2">{course.title || 'Chưa có tên khóa học'}</div>
                <div className="text-gray-600 mb-2">{course.description || 'Chưa có mô tả'}</div>
                <div className="text-sm text-gray-400 mb-2">Độ khó: <span className="font-medium text-blue-600">{course.level || 'Không xác định'}</span></div>
                <div className="text-sm text-gray-400 mb-2">Đối tượng: {course.ageGroup || 'Không xác định'}</div>
                <div className="text-sm text-gray-400">Điểm phù hợp: {typeof course.recommendedMinScore === 'number' && typeof course.recommendedMaxScore === 'number' ? `${course.recommendedMinScore} - ${course.recommendedMaxScore}` : '-'}</div>
              </div>
              <div className="mt-6 flex gap-2">
                <Link to={`/courses/${course.id}/enroll`} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Đăng ký</Link>
                <Link to={`/courses/${course.id}`} className="px-4 py-2 bg-gray-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition">Xem nội dung</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
