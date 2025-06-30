import React from 'react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course, enrolled, progress, certificate, onAction }) => {
  return (
    <div className="course-card bg-white rounded-lg shadow-md p-4 flex flex-col md:flex-row gap-4 hover:shadow-xl transition">
      <div className="flex-shrink-0 w-full md:w-48 h-32 md:h-32 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
        {course.imageUrl ? (
          <img src={course.imageUrl} alt={course.title} className="object-cover w-full h-full" />
        ) : (
          <span className="text-gray-400">No Image</span>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold line-clamp-2 flex-1">{course.title || 'Tên khóa học'}</h3>
          {enrolled && <span className="badge bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Đã đăng ký</span>}
          {certificate && (
            <a href={certificate.url} target="_blank" rel="noopener noreferrer" className="badge bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs ml-2">Chứng chỉ</a>
          )}
        </div>
        <p className="text-gray-600 text-sm line-clamp-2">{course.description || 'Mô tả khóa học sẽ hiển thị ở đây.'}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Số module: {course.modules?.length || 0}</span>
          <span className="text-xs text-gray-500">Số bài học: {course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0}</span>
          {progress !== undefined && (
            <span className="text-xs text-primary-600 font-medium ml-2">Tiến độ: {progress}%</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Link to={`/courses/${course.id}`} className="btn btn-primary btn-sm">{enrolled ? 'Vào học' : 'Xem chi tiết'}</Link>
          {onAction && (
            <button onClick={onAction} className="btn btn-outline-primary btn-sm">{enrolled ? 'Hủy đăng ký' : 'Đăng ký'}</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
