import React, { useEffect, useState } from 'react';
import axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMyCourses() {
      setLoading(true);
      try {
        const res = await axios.get('/enrollments/user');
        const enrollments = res.data || [];
        // Lấy chi tiết từng khóa học
        const courseDetails = await Promise.all(
          enrollments.map(async (enrollment) => {
            try {
              const courseRes = await axios.get(`/courses/${enrollment.courseId || enrollment.id}`);
              return { ...courseRes.data, enrollmentId: enrollment.id };
            } catch {
              // Nếu lỗi thì trả về enrollment với thông tin tối thiểu
              return { id: enrollment.courseId || enrollment.id };
            }
          })
        );
        setCourses(courseDetails);
      } catch (err) {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMyCourses();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-blue-800">Khóa học của tôi</h1>
      {loading ? (
        <div className="text-gray-400">Đang tải danh sách khóa học...</div>
      ) : courses.length === 0 ? (
        <div className="text-gray-500">Bạn chưa đăng ký khóa học nào.</div>
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
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  Vào khóa học
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
