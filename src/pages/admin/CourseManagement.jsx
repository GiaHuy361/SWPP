import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../utils/axios';

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [searchMethod, setSearchMethod] = useState(''); // Track how search is performed
  const [debugMode, setDebugMode] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Reset to page 1 when searching
      if (searchTerm !== debouncedSearchTerm) {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Try different parameter names that backend might support
      if (debouncedSearchTerm.trim()) {
        // Common search parameter names
        params.append('search', debouncedSearchTerm.trim());
        params.append('q', debouncedSearchTerm.trim());
        params.append('keyword', debouncedSearchTerm.trim());
        params.append('title', debouncedSearchTerm.trim());
      }
      
      params.append('page', currentPage - 1);
      params.append('size', 10);
      
      console.log('API Call:', `/courses?${params.toString()}`); // Debug log
      
      // First try with search parameters
      let response;
      try {
        response = await axios.get(`/courses?${params.toString()}`);
        setSearchMethod('Backend Search');
      } catch (searchError) {
        console.log('Search with parameters failed, trying without search params:', searchError);
        setSearchMethod('Client-side Filter');
        // If search with parameters fails, try getting all courses and filter client-side
        const simpleParams = new URLSearchParams();
        simpleParams.append('page', currentPage - 1);
        simpleParams.append('size', 100); // Get more courses for client-side filtering
        response = await axios.get(`/courses?${simpleParams.toString()}`);
      }
      
      console.log('API Response:', response.data); // Debug log
      
      let coursesData = response.data.content || response.data || [];
      
      // If we have a search term and got all courses, filter client-side
      if (debouncedSearchTerm.trim() && Array.isArray(coursesData)) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        coursesData = coursesData.filter(course => 
          (course.title && course.title.toLowerCase().includes(searchLower)) ||
          (course.description && course.description.toLowerCase().includes(searchLower)) ||
          (course.ageGroup && course.ageGroup.toLowerCase().includes(searchLower)) ||
          (course.level && course.level.toLowerCase().includes(searchLower))
        );
        
        // Manual pagination for filtered results
        const startIndex = (currentPage - 1) * 10;
        const endIndex = startIndex + 10;
        const paginatedData = coursesData.slice(startIndex, endIndex);
        
        setCourses(paginatedData);
        setTotalPages(Math.ceil(coursesData.length / 10));
      } else {
        setCourses(coursesData);
        if (response.data.totalPages) {
          setTotalPages(response.data.totalPages);
        } else {
          setTotalPages(Math.ceil(coursesData.length / 10));
        }
      }
      
    } catch (error) {
      console.error('Fetch courses error:', error); // Debug log
      setCourses([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, currentPage]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Delete course
  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      await axios.delete(`/courses/${courseToDelete.id}`);
      setShowDeleteModal(false);
      setCourseToDelete(null);
      fetchCourses();
      alert('Xóa khóa học thành công!');
    } catch (error) {
      alert('Không thể xóa khóa học. Vui lòng thử lại!');
    }
  };

  return (
    <div className="p-4 sm:p-5 md:p-6 bg-gray-50 min-h-screen w-full">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Khóa học</h1>
            <p className="text-gray-600">Quản lý tất cả khóa học trong hệ thống</p>
          </div>
          <Link
            to="/admin/courses/create"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow"
          >
            + Thêm khóa học mới
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-1/2 relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, mô tả, nhóm tuổi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  title="Xóa tìm kiếm"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              {loading && searchTerm && (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Đang tìm kiếm...
                </div>
              )}
              {debouncedSearchTerm && !loading && (
                <div className="text-sm text-gray-500">
                  Tìm thấy <span className="font-semibold text-blue-600">{courses.length}</span> kết quả cho "<span className="font-medium">{debouncedSearchTerm}</span>"
                  {debugMode && searchMethod && (
                    <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                      ({searchMethod})
                    </span>
                  )}
                </div>
              )}
              <button
                onClick={() => setDebugMode(!debugMode)}
                className="text-xs text-gray-400 hover:text-gray-600"
                title="Toggle debug mode"
              >
                🔧
              </button>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-500">Đang tải...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tên khóa học</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cấp độ</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Mô tả</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Điểm tối thiểu</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Điểm tối đa</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nhóm tuổi</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courses.length > 0 ? (
                      courses.map((course) => (
                        <tr key={course.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-900">{course.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{course.level}</td>
                          <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-600">{course.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">{course.recommendedMinScore}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">{course.recommendedMaxScore}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{course.ageGroup}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Link
                              to={`/admin/courses/${course.id}`}
                              className="text-blue-600 hover:text-blue-900 font-semibold"
                            >
                              Xem
                            </Link>
                            <Link
                              to={`/admin/courses/${course.id}/edit`}
                              className="text-yellow-600 hover:text-yellow-900 font-semibold"
                            >
                              Sửa
                            </Link>
                            <button
                              onClick={() => {
                                setCourseToDelete(course);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 font-semibold"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                          {debouncedSearchTerm ? 
                            `Không tìm thấy khóa học nào với từ khóa "${debouncedSearchTerm}"` : 
                            'Không có khóa học nào'
                          }
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Trước
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Sau
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Trang <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          ‹
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index + 1}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === index + 1
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          ›
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Xác nhận xóa</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Bạn có chắc chắn muốn xóa khóa học "{courseToDelete?.title}"? 
                  Hành động này không thể hoàn tác.
                </p>
              </div>
              <div className="items-center px-4 py-3 space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setCourseToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteCourse}
                  className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-600"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
