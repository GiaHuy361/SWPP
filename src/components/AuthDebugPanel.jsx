import React, { useState } from 'react';
import { AuthErrorDisplay } from './AuthErrorHandler';

const AuthDebugPanel = ({ user, isAuthenticated, loading, onRetry }) => {
  const [showDebug, setShowDebug] = useState(false);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900">Auth Debug</h3>
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          {showDebug ? 'Hide' : 'Show'}
        </button>
      </div>
      
      {showDebug && (
        <div className="space-y-2 text-xs">
          <div>
            <strong>Authentication Status:</strong>
            <span className={`ml-2 px-2 py-1 rounded ${
              isAuthenticated ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </span>
          </div>
          
          <div>
            <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
          </div>
          
          {user && (
            <div>
              <strong>User Info:</strong>
              <div className="ml-2 text-gray-600">
                <div>ID: {user.userId}</div>
                <div>Email: {user.email}</div>
                <div>Role: {user.role}</div>
                <div>Permissions: {user.permissions?.length || 0}</div>
              </div>
            </div>
          )}
          
          {!user && !loading && (
            <div className="text-red-600">
              <strong>No user data found</strong>
            </div>
          )}
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Retry Auth Check
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Component hiển thị troubleshooting cho lỗi Google OAuth
export const GoogleOAuthTroubleshoot = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Hướng dẫn sửa lỗi Google OAuth
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-800 mb-2">Lỗi 403 Forbidden</h3>
            <p className="text-sm text-red-700">
              Lỗi này thường xảy ra do cấu hình OAuth không đúng trong Google Cloud Console.
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">Các bước kiểm tra:</h3>
            <ol className="text-sm text-blue-700 space-y-2 ml-4 list-decimal">
              <li>Truy cập <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
              <li>Vào phần "APIs & Services" → "Credentials"</li>
              <li>Kiểm tra OAuth 2.0 Client ID</li>
              <li>Trong "Authorized JavaScript origins", thêm:
                <ul className="ml-4 mt-1 list-disc">
                  <li><code>http://localhost:5173</code></li>
                  <li><code>http://127.0.0.1:5173</code></li>
                </ul>
              </li>
              <li>Trong "Authorized redirect URIs", thêm:
                <ul className="ml-4 mt-1 list-disc">
                  <li><code>http://localhost:5173/login</code></li>
                  <li><code>http://127.0.0.1:5173/login</code></li>
                </ul>
              </li>
              <li>Lưu cấu hình và đợi vài phút để có hiệu lực</li>
            </ol>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">Lưu ý quan trọng:</h3>
            <ul className="text-sm text-yellow-700 space-y-1 ml-4 list-disc">
              <li>Đảm bảo Google+ API được bật</li>
              <li>Kiểm tra OAuth consent screen đã được cấu hình</li>
              <li>Sử dụng đúng Client ID trong môi trường development</li>
              <li>Kiểm tra tên domain chính xác (localhost vs 127.0.0.1)</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-2">Test cấu hình:</h3>
            <p className="text-sm text-green-700">
              Sau khi cấu hình, hãy thử làm mới trang và đăng nhập Google lại. 
              Nếu vẫn gặp lỗi, hãy kiểm tra Console của trình duyệt để xem chi tiết lỗi.
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthDebugPanel;
