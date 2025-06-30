import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

export default function CertificatePage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [courseTitle, setCourseTitle] = useState('');
  const [certificate, setCertificate] = useState(null);

  const cleanCourseId = courseId.replace(/'/g, '');

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await axios.get(`/courses/${cleanCourseId}`);
        setCourseTitle(res.data?.title || cleanCourseId);
      } catch {
        setCourseTitle(cleanCourseId);
      }
    }
    if (cleanCourseId) fetchCourse();
  }, [cleanCourseId]);

  useEffect(() => {
    async function fetchCertificate() {
      if (!user?.userId || !cleanCourseId) return;
      try {
        const res = await axios.get(`/certificates?userId=${user.userId}&courseId=${cleanCourseId}`);
        setCertificate(res.data);
      } catch {
        setCertificate(null);
      }
    }
    fetchCertificate();
  }, [user?.userId, cleanCourseId]);

  const handleEnroll = async () => {
    try {
      await axios.post(`/enrollments/courses/${cleanCourseId}`);
      alert('Đã đăng ký khóa học thành công!');
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Đã xảy ra lỗi khi đăng ký khóa học. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-2xl rounded-lg max-w-4xl w-full text-center border-2 border-gray-300 animate-fade-in">
        {/* Header với logo và tiêu đề */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mr-4">
              <img src="/no-drugs-logo.png" alt="Logo" className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Phòng Chống Ma Túy</h1>
              <p className="text-blue-200 text-sm">Chứng chỉ hoàn thành khóa học</p>
            </div>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">CERTIFICATE OF COMPLETION</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          </div>

          <div className="mb-8">
            <p className="text-lg text-gray-600 mb-4">This is to certify that</p>
            <h3 className="text-4xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2 inline-block">
              {user?.fullName || '[Tên học viên]'}
            </h3>
            <p className="text-lg text-gray-600 mb-6">has successfully completed the online course</p>
            
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h4 className="text-2xl font-bold text-blue-800 mb-2">{courseTitle || 'Khóa học phòng chống ma túy'}</h4>
              <p className="text-gray-600">Đã xuất sắc hoàn thành toàn bộ nội dung và bài kiểm tra của khóa học</p>
            </div>
          </div>

          {/* Footer với chữ ký và ngày */}
          <div className="flex justify-between items-end">
            <div className="text-left">
              <div className="border-t-2 border-gray-400 pt-2 w-48">
                <p className="text-sm font-semibold text-gray-700">Hiệu trưởng/Giám đốc</p>
                <p className="text-xs text-gray-500">Đơn vị cấp chứng chỉ</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                <span className="text-blue-600 font-bold text-sm">SEAL</span>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-700">Ngày cấp</p>
              <p className="text-lg font-bold text-blue-800">{certificate?.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString('vi-VN') : '-'}</p>
              <p className="text-xs text-gray-500">Certificate ID: {certificate?.certificateCode || certificate?.id || `CERT-${cleanCourseId}`}</p>
            </div>
          </div>
        </div>

        {/* Decorative border */}
        <div className="border-t-4 border-gradient-to-r from-blue-400 to-blue-600"></div>
      </div>
      
      <div className="mt-6 flex gap-4">
        <Link to="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
          Về trang chủ
        </Link>
        <button 
          onClick={() => window.print()} 
          className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
        >
          In chứng chỉ
        </button>
      </div>
    </div>
  );
}
