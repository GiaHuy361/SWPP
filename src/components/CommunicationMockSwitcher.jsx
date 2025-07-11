import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component cho phép bật/tắt chế độ mock data cho communication API
 * Chỉ hiển thị trong môi trường development để tiện kiểm tra
 */
const CommunicationMockSwitcher = () => {
  const [useMock, setUseMock] = useState(localStorage.getItem('USE_COMMUNICATION_MOCK') === 'true');
  const [expanded, setExpanded] = useState(false);
  const isDev = process.env.NODE_ENV === 'development';
  const location = useLocation();
  
  // Kiểm tra nếu đang ở trang admin
  const isAdminPage = location.pathname.includes('/admin/');

  useEffect(() => {
    // Khởi tạo giá trị mặc định trong localStorage nếu chưa có
    if (localStorage.getItem('USE_COMMUNICATION_MOCK') === null) {
      localStorage.setItem('USE_COMMUNICATION_MOCK', 'false'); // Mặc định là false để sử dụng API thật
      setUseMock(false);
    }
    
    // Tự động mở rộng khi ở trang admin và đang bật mock data
    if (isAdminPage && useMock) {
      setExpanded(true);
    }
  }, [isAdminPage, useMock]);

  // Nếu không phải môi trường development thì không hiển thị
  if (!isDev) return null;

  const toggleMockMode = () => {
    const newValue = !useMock;
    setUseMock(newValue);
    localStorage.setItem('USE_COMMUNICATION_MOCK', newValue.toString());
    // Reload page để áp dụng thay đổi
    window.location.reload();
  };

  const getBgColor = () => {
    if (!expanded) return 'rgba(44, 62, 80, 0.7)';
    if (isAdminPage && useMock) return 'rgba(220, 53, 69, 0.85)'; // Đỏ cảnh báo cho admin page
    return '#2c3e50';
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: expanded ? '20px' : '10px',
        right: expanded ? '20px' : '10px',
        backgroundColor: getBgColor(),
        color: 'white',
        padding: expanded ? '15px' : '8px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 9999,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        maxWidth: expanded ? '300px' : '50px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {expanded ? (
        <>
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '10px'
            }}
          >
            <h3 style={{ margin: 0 }}>Communication API</h3>
            <button 
              onClick={() => setExpanded(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ✕
            </button>
          </div>
          
          {!useMock && (
            <div 
              style={{
                backgroundColor: 'rgba(40, 167, 69, 0.2)',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '10px'
              }}
            >
              <strong style={{ color: 'white' }}>✅ API thật:</strong>
              <p style={{ fontSize: '13px', margin: '5px 0 0' }}>
                Đang sử dụng API thật từ backend. Đảm bảo server backend đang chạy tại http://localhost:8080.
              </p>
            </div>
          )}
          
          {isAdminPage && useMock && (
            <div 
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '10px'
              }}
            >
              <strong style={{ color: 'white' }}>⚠️ Cảnh báo:</strong>
              <p style={{ fontSize: '13px', margin: '5px 0 0' }}>
                Bạn đang ở trang Admin và đang sử dụng dữ liệu giả lập. 
                Điều này có thể dẫn đến hiển thị không chính xác hoặc thiếu thông tin. 
                Khuyến nghị tắt tính năng này khi làm việc trên các trang Admin.
              </p>
            </div>
          )}
          
          <p style={{ fontSize: '14px', marginBottom: '15px' }}>
            Bật/tắt chế độ giả lập dữ liệu khi API thật không khả dụng
          </p>
          <label 
            style={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <input 
              type="checkbox"
              checked={useMock}
              onChange={toggleMockMode}
              style={{ marginRight: '8px' }}
            />
            Sử dụng dữ liệu giả lập
          </label>
          <p style={{ fontSize: '12px', marginTop: '10px', opacity: 0.8 }}>
            {useMock 
              ? 'Đang sử dụng mock data khi API thất bại' 
              : 'Đang sử dụng API thật, sẽ báo lỗi khi API thất bại'
            }
          </p>
        </>
      ) : (
        <div 
          onClick={() => setExpanded(true)}
          style={{ 
            width: '100%', 
            textAlign: 'center',
            fontSize: '20px'
          }}
        >
          {isAdminPage && useMock ? '⚠️' : (useMock ? 'M' : 'A')}
        </div>
      )}
    </div>
  );
};

export default CommunicationMockSwitcher;
