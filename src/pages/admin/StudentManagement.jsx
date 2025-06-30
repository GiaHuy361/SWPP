import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { Modal } from '../../components/ui/Modal';

export default function StudentManagement() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentProgress, setStudentProgress] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);

  const enrollmentStatuses = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'ENROLLED', label: 'Đã đăng ký' },
    { value: 'IN_PROGRESS', label: 'Đang học' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
    { value: 'FAILED', label: 'Thất bại' },
    { value: 'SUSPENDED', label: 'Tạm dừng' }
  ];

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseResponse, enrollmentsResponse] = await Promise.all([
        axios.get(`/courses/${courseId}`),
        axios.get(`/enrollments?courseId=${courseId}`)
      ]);
      
      setCourse(courseResponse.data);
      setEnrollments(enrollmentsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Có lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users?role=STUDENT');
      const users = response.data.filter(user => 
        !enrollments.some(enrollment => enrollment.userId === user.id)
      );
      setAllUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Có lỗi khi tải danh sách người dùng');
    }
  };

  const fetchStudentProgress = async (enrollmentId, userId) => {
    setProgressLoading(true);
    try {
      const [progressResponse, quizResultsResponse] = await Promise.all([
        axios.get(`/enrollments/${enrollmentId}/progress`),
        axios.get(`/users/${userId}/courses/${courseId}/quiz-results`)
      ]);
      
      setStudentProgress({
        ...progressResponse.data,
        quizResults: quizResultsResponse.data || []
      });
    } catch (error) {
      console.error('Error fetching student progress:', error);
      toast.error('Có lỗi khi tải tiến độ học tập');
    } finally {
      setProgressLoading(false);
    }
  };

  const handleAddStudents = async () => {
    if (selectedUsers.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một học viên');
      return;
    }

    try {
      const enrollmentData = selectedUsers.map(userId => ({
        userId: parseInt(userId),
        courseId: parseInt(courseId),
        enrollmentDate: new Date().toISOString(),
        status: 'ENROLLED'
      }));

      await axios.post('/enrollments/bulk', enrollmentData);
      toast.success(`Đã thêm ${selectedUsers.length} học viên thành công`);
      
      setSelectedUsers([]);
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Error adding students:', error);
      toast.error('Có lỗi khi thêm học viên');
    }
  };

  const handleUpdateStatus = async (enrollmentId, newStatus) => {
    try {
      await axios.put(`/enrollments/${enrollmentId}/status`, { status: newStatus });
      toast.success('Cập nhật trạng thái thành công');
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Có lỗi khi cập nhật trạng thái');
    }
  };

  const handleRemoveStudent = async (enrollmentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa học viên này khỏi khóa học?')) {
      return;
    }

    try {
      await axios.delete(`/enrollments/${enrollmentId}`);
      toast.success('Xóa học viên thành công');
      fetchData();
    } catch (error) {
      console.error('Error removing student:', error);
      toast.error('Có lỗi khi xóa học viên');
    }
  };

  const openProgressModal = (enrollment) => {
    setSelectedStudent(enrollment);
    setShowProgressModal(true);
    fetchStudentProgress(enrollment.id, enrollment.userId);
  };

  const getStatusColor = (status) => {
    const colors = {
      ENROLLED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      SUSPENDED: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      ENROLLED: 'Đã đăng ký',
      IN_PROGRESS: 'Đang học',
      COMPLETED: 'Hoàn thành',
      FAILED: 'Thất bại',
      SUSPENDED: 'Tạm dừng'
    };
    return labels[status] || status;
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = enrollment.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || enrollment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getProgressPercentage = (progress) => {
    if (!progress || !progress.totalLessons) return 0;
    return Math.round((progress.completedLessons / progress.totalLessons) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <nav className="text-sm text-gray-600 mb-2">
            <Link to="/admin/courses" className="hover:text-blue-600">Quản lý khóa học</Link>
            <span className="mx-2">/</span>
            <Link to={`/admin/courses/${courseId}`} className="hover:text-blue-600">
              {course?.title}
            </Link>
            <span className="mx-2">/</span>
            <span>Quản lý học viên</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý Học viên - {course?.title}
          </h1>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            fetchUsers();
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Thêm học viên
        </button>
      </div>

      {/* Course Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              👥
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {enrollments.length}
              </h3>
              <p className="text-gray-600">Tổng học viên</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              📚
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {enrollments.filter(e => e.status === 'IN_PROGRESS').length}
              </h3>
              <p className="text-gray-600">Đang học</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              ✅
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {enrollments.filter(e => e.status === 'COMPLETED').length}
              </h3>
              <p className="text-gray-600">Hoàn thành</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              ❌
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {enrollments.filter(e => e.status === 'FAILED').length}
              </h3>
              <p className="text-gray-600">Thất bại</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {enrollmentStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            
            <span className="text-sm text-gray-600">
              Hiển thị {filteredEnrollments.length} / {enrollments.length} học viên
            </span>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-md">
        {filteredEnrollments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium mb-2">
              {enrollments.length === 0 ? 'Chưa có học viên nào' : 'Không tìm thấy học viên'}
            </h3>
            <p className="mb-4">
              {enrollments.length === 0 
                ? 'Hãy thêm học viên đầu tiên cho khóa học này'
                : 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
              }
            </p>
            {enrollments.length === 0 && (
              <button
                onClick={() => {
                  setShowAddModal(true);
                  fetchUsers();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Thêm học viên
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Học viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đăng ký
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiến độ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {enrollment.user?.fullName?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {enrollment.user?.fullName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {enrollment.user?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {enrollment.enrollmentDate 
                        ? new Date(enrollment.enrollmentDate).toLocaleDateString('vi-VN')
                        : 'N/A'
                      }
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={enrollment.status}
                        onChange={(e) => handleUpdateStatus(enrollment.id, e.target.value)}
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full border-0 ${getStatusColor(enrollment.status)}`}
                      >
                        <option value="ENROLLED">Đã đăng ký</option>
                        <option value="IN_PROGRESS">Đang học</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="FAILED">Thất bại</option>
                        <option value="SUSPENDED">Tạm dừng</option>
                      </select>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${getProgressPercentage(enrollment.progress)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 min-w-[3rem]">
                          {getProgressPercentage(enrollment.progress)}%
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openProgressModal(enrollment)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => handleRemoveStudent(enrollment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Students Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedUsers([]);
          }}
          title="Thêm học viên vào khóa học"
          size="large"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Chọn các học viên bạn muốn thêm vào khóa học "{course?.title}"
            </p>
            
            {allUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">😔</div>
                <p>Không có học viên nào để thêm.</p>
                <p className="text-sm">Tất cả người dùng đã được đăng ký vào khóa học này.</p>
              </div>
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto border rounded-lg">
                  {allUsers.map((user) => (
                    <div key={user.id} className="flex items-center p-3 hover:bg-gray-50 border-b last:border-b-0">
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={selectedUsers.includes(user.id.toString())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id.toString()]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id.toString()));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`user-${user.id}`} className="ml-3 flex-1 cursor-pointer">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 text-sm font-medium">
                              {user.fullName?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.fullName || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-600">
                    Đã chọn {selectedUsers.length} học viên
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowAddModal(false);
                        setSelectedUsers([]);
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleAddStudents}
                      disabled={selectedUsers.length === 0}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
                    >
                      Thêm học viên ({selectedUsers.length})
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* Student Progress Modal */}
      {showProgressModal && selectedStudent && (
        <Modal
          isOpen={showProgressModal}
          onClose={() => {
            setShowProgressModal(false);
            setSelectedStudent(null);
            setStudentProgress(null);
          }}
          title={`Tiến độ học tập - ${selectedStudent.user?.fullName}`}
          size="extra-large"
        >
          {progressLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : studentProgress ? (
            <div className="space-y-6">
              {/* Overall Progress */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {getProgressPercentage(studentProgress)}%
                  </div>
                  <div className="text-sm text-blue-700">Tiến độ tổng thể</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {studentProgress.completedLessons || 0} / {studentProgress.totalLessons || 0}
                  </div>
                  <div className="text-sm text-green-700">Bài học hoàn thành</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {studentProgress.quizResults?.length || 0}
                  </div>
                  <div className="text-sm text-purple-700">Quiz đã làm</div>
                </div>
              </div>

              {/* Module Progress */}
              {studentProgress.moduleProgress && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tiến độ theo module</h3>
                  <div className="space-y-3">
                    {studentProgress.moduleProgress.map((module, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900">{module.title}</span>
                          <span className="text-sm text-gray-600">
                            {module.completedLessons} / {module.totalLessons} bài học
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(module.completedLessons / module.totalLessons) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quiz Results */}
              {studentProgress.quizResults && studentProgress.quizResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Kết quả Quiz</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Quiz
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Điểm số
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Trạng thái
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Ngày làm
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Số lần thử
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {studentProgress.quizResults.map((result, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {result.quizTitle}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {result.score}% ({result.correctAnswers}/{result.totalQuestions})
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                result.passed 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {result.passed ? 'Đạt' : 'Không đạt'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {result.completedAt 
                                ? new Date(result.completedAt).toLocaleDateString('vi-VN')
                                : 'N/A'
                              }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {result.attempts || 1}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Learning Activities */}
              {studentProgress.recentActivities && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Hoạt động gần đây</h3>
                  <div className="space-y-3">
                    {studentProgress.recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'lesson' ? 'bg-blue-100 text-blue-600' :
                          activity.type === 'quiz' ? 'bg-purple-100 text-purple-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {activity.type === 'lesson' ? '📖' : 
                           activity.type === 'quiz' ? '📝' : '✅'}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {activity.date && new Date(activity.date).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p>Không có dữ liệu tiến độ</p>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
