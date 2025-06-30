import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';

export default function EnrollCoursePage(props) {
  const params = useParams();
  const courseId = props.courseId || params.courseId;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true);
      try {
        const res = await axios.get(`/courses/${courseId}`);
        setCourse(res.data);
      } catch (err) {
        setError('Không tìm thấy khóa học hoặc bạn không có quyền.');
      } finally {
        setLoading(false);
      }
    }
    // Kiểm tra trạng thái enrollment, nếu đã đăng ký thì hiển thị nút vào học
    async function checkEnrollment() {
      try {
        const res = await axios.get(`/enrollments/status?courseId=${courseId}`);
        setEnrollmentStatus(res.data?.status);
        if (res.data?.status === 'ACTIVE') {
          setEnrolled(true);
        }
      } catch (err) {
        setEnrollmentStatus(null);
      }
    }
    if (courseId) {
      fetchCourse();
      checkEnrollment();
    }
  }, [courseId, navigate]);

  const handleEnroll = async () => {
    setEnrolling(true);
    setError(null);
    try {
      await axios.post(`/enrollments?courseId=${courseId}`);
      setEnrolled(true);
      setTimeout(() => navigate(`/courses/${courseId}`), 1200);
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('already enrolled')) {
        // Nếu đã đăng ký thì chuyển hướng vào học luôn
        navigate(`/courses/${courseId}`);
      } else {
        setError(msg || 'Đăng ký thất bại.');
      }
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Đang tải thông tin khóa học...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;
  if (!course) return null;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-16">
      <h1 className="text-3xl font-bold mb-4 text-blue-700">Đăng ký khóa học</h1>
      <div className="mb-4">
        <div className="text-xl font-semibold text-gray-800 mb-2">{course.title}</div>
        <div className="text-gray-600 mb-2">{course.description}</div>
        <div className="text-gray-400 text-sm">Tạo ngày: {course.createdAt ? new Date(course.createdAt).toLocaleDateString('vi-VN') : ''}</div>
      </div>
      {enrollmentStatus === 'ACTIVE' ? (
        <>
          <div className="mt-4 px-6 py-3 bg-green-50 text-green-700 rounded-xl font-semibold text-center border border-green-200">
            Bạn đã đăng ký khóa học này.
          </div>
          <button
            className="mt-6 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
            onClick={() => navigate(`/courses/${courseId}`)}
          >
            Vào khóa học
          </button>
        </>
      ) : enrolled ? (
        <div className="mt-6 px-6 py-3 bg-green-100 text-green-700 rounded-xl font-semibold text-center">Đăng ký thành công! Đang chuyển hướng...</div>
      ) : (
        <button
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60"
          onClick={handleEnroll}
          disabled={enrolling}
        >
          {enrolling ? 'Đang đăng ký...' : 'Đăng ký ngay'}
        </button>
      )}
    </div>
  );
}
