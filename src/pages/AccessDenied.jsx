import React from 'react';
import { useNavigate } from 'react-router-dom';

function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="pt-24 min-h-screen flex items-center justify-center">
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg max-w-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-red-800">Truy cập bị từ chối</h3>
            <p className="mt-2 text-red-700">Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên để được hỗ trợ.</p>
            <div className="mt-4">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Quay về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccessDenied;