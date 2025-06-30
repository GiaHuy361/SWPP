import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { Modal } from '../../components/ui/Modal';

export default function CertificateManagement() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');

  const certificateStatuses = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'ISSUED', label: 'Đã cấp' },
    { value: 'REVOKED', label: 'Đã thu hồi' },
    { value: 'EXPIRED', label: 'Hết hạn' }
  ];

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseResponse, certificatesResponse] = await Promise.all([
        axios.get(`/courses/${courseId}`),
        axios.get(`/certificates/courses/${courseId}`)
      ]);
      
      setCourse(courseResponse.data);
      setCertificates(certificatesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Có lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeCertificate = async () => {
    if (!selectedCertificate || !revokeReason.trim()) {
      toast.warning('Vui lòng nhập lý do thu hồi chứng chỉ');
      return;
    }

    try {
      await axios.put(`/certificates/${selectedCertificate.id}/revoke`, {
        reason: revokeReason
      });
      toast.success('Thu hồi chứng chỉ thành công');
      
      setShowRevokeModal(false);
      setSelectedCertificate(null);
      setRevokeReason('');
      fetchData();
    } catch (error) {
      console.error('Error revoking certificate:', error);
      toast.error('Có lỗi khi thu hồi chứng chỉ');
    }
  };

  const handleReissueCertificate = async (certificateId) => {
    try {
      await axios.post(`/certificates/${certificateId}/reissue`);
      toast.success('Cấp lại chứng chỉ thành công');
      fetchData();
    } catch (error) {
      console.error('Error reissuing certificate:', error);
      toast.error('Có lỗi khi cấp lại chứng chỉ');
    }
  };

  const handleDownloadCertificate = async (certificateId) => {
    try {
      const response = await axios.get(`/certificates/${certificateId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Tải chứng chỉ thành công');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Có lỗi khi tải chứng chỉ');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      ISSUED: 'bg-green-100 text-green-800',
      REVOKED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      ISSUED: 'Đã cấp',
      REVOKED: 'Đã thu hồi',
      EXPIRED: 'Hết hạn'
    };
    return labels[status] || status;
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.certificateCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <span>Quản lý chứng chỉ</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý Chứng chỉ - {course?.title}
          </h1>
        </div>
      </div>

      {/* Course Info & Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              🎓
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {certificates.length}
              </h3>
              <p className="text-gray-600">Tổng chứng chỉ</p>
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
                {certificates.filter(c => c.status === 'ISSUED').length}
              </h3>
              <p className="text-gray-600">Đã cấp</p>
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
                {certificates.filter(c => c.status === 'REVOKED').length}
              </h3>
              <p className="text-gray-600">Đã thu hồi</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100 text-gray-600">
              ⏰
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {certificates.filter(c => c.status === 'EXPIRED').length}
              </h3>
              <p className="text-gray-600">Hết hạn</p>
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
              placeholder="Tìm kiếm theo tên, email, mã chứng chỉ..."
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
              {certificateStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            
            <span className="text-sm text-gray-600">
              Hiển thị {filteredCertificates.length} / {certificates.length} chứng chỉ
            </span>
          </div>
        </div>
      </div>

      {/* Certificates List */}
      <div className="bg-white rounded-lg shadow-md">
        {filteredCertificates.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-lg font-medium mb-2">
              {certificates.length === 0 ? 'Chưa có chứng chỉ nào' : 'Không tìm thấy chứng chỉ'}
            </h3>
            <p className="mb-4">
              {certificates.length === 0 
                ? 'Chứng chỉ sẽ được tự động cấp khi học viên hoàn thành khóa học'
                : 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
              }
            </p>
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
                    Mã chứng chỉ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày cấp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Điểm số
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCertificates.map((certificate) => (
                  <tr key={certificate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {certificate.user?.fullName?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {certificate.user?.fullName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {certificate.user?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {certificate.certificateCode}
                      </div>
                      {certificate.verificationUrl && (
                        <div className="text-xs text-blue-600">
                          <a 
                            href={certificate.verificationUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            Xác minh online
                          </a>
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {certificate.issuedDate 
                        ? new Date(certificate.issuedDate).toLocaleDateString('vi-VN')
                        : 'N/A'
                      }
                      {certificate.expiryDate && (
                        <div className="text-xs text-gray-400">
                          Hết hạn: {new Date(certificate.expiryDate).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(certificate.status)}`}>
                        {getStatusLabel(certificate.status)}
                      </span>
                      {certificate.status === 'REVOKED' && certificate.revokeReason && (
                        <div className="text-xs text-red-600 mt-1" title={certificate.revokeReason}>
                          Lý do: {certificate.revokeReason.length > 20 
                            ? certificate.revokeReason.substring(0, 20) + '...' 
                            : certificate.revokeReason
                          }
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {certificate.finalScore ? (
                        <div className="flex items-center">
                          <span className="font-medium">{certificate.finalScore}%</span>
                          <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${certificate.finalScore}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleDownloadCertificate(certificate.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Tải chứng chỉ"
                      >
                        📥 Tải
                      </button>
                      
                      {certificate.status === 'ISSUED' && (
                        <button
                          onClick={() => {
                            setSelectedCertificate(certificate);
                            setShowRevokeModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Thu hồi chứng chỉ"
                        >
                          🚫 Thu hồi
                        </button>
                      )}
                      
                      {certificate.status === 'REVOKED' && (
                        <button
                          onClick={() => handleReissueCertificate(certificate.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Cấp lại chứng chỉ"
                        >
                          🔄 Cấp lại
                        </button>
                      )}
                      
                      {certificate.verificationUrl && (
                        <a
                          href={certificate.verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-900"
                          title="Xem chứng chỉ online"
                        >
                          👁️ Xem
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Revoke Certificate Modal */}
      {showRevokeModal && selectedCertificate && (
        <Modal
          isOpen={showRevokeModal}
          onClose={() => {
            setShowRevokeModal(false);
            setSelectedCertificate(null);
            setRevokeReason('');
          }}
          title="Thu hồi chứng chỉ"
        >
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-red-600 text-4xl mb-2">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Xác nhận thu hồi chứng chỉ
              </h3>
              <p className="text-gray-600">
                Bạn đang thu hồi chứng chỉ của học viên:
              </p>
              <p className="font-medium text-gray-900">
                {selectedCertificate.user?.fullName} ({selectedCertificate.certificateCode})
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do thu hồi *
              </label>
              <textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                rows="4"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập lý do thu hồi chứng chỉ..."
                required
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="text-yellow-600 mr-2">⚠️</div>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Chứng chỉ sẽ không còn hiệu lực sau khi thu hồi</li>
                    <li>Học viên sẽ nhận được thông báo về việc thu hồi</li>
                    <li>Có thể cấp lại chứng chỉ nếu cần thiết</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowRevokeModal(false);
                  setSelectedCertificate(null);
                  setRevokeReason('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleRevokeCertificate}
                disabled={!revokeReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
              >
                Thu hồi chứng chỉ
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
