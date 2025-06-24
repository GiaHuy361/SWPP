import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children, requiredPermission }) {
  const { user, isAuthenticated, loading } = useAuth() || { user: null, isAuthenticated: false, loading: false };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  if (!requiredPermission) {
    return children;
  }

  const hasPermission = (permission) => {
    // Admin có tất cả quyền
    if (user?.permissions?.includes('ROLE_Admin')) {
      return true;
    }
    // Kiểm tra quyền cụ thể hoặc vai trò
    return user?.permissions?.includes(permission) || user?.role === permission.replace('ROLE_', '');
  };

  const isAuthorized = Array.isArray(requiredPermission)
    ? requiredPermission.some(perm => hasPermission(perm))
    : hasPermission(requiredPermission);

  if (!isAuthorized) {
    console.warn(`Access denied: User permissions: ${JSON.stringify(user?.permissions)}, Role: ${user?.role}, Required: ${JSON.stringify(requiredPermission)}`);
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}

export default PrivateRoute;