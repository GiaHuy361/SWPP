import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import apiClient from '../utils/axios';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const authChecked = useRef(false);

  const checkSession = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/auth/user', { withCredentials: true });
      const userData = response.data;
      console.log('Session check response:', userData);
      if (!userData || !userData.userId) {
        setUser(null);
        setIsAuthenticated(false);
      } else {
        if (!userData.permissions || userData.permissions.length === 0) {
          console.warn('No permissions in user data, deriving from role:', userData);
          userData.permissions = derivePermissionsFromRole(userData.role);
        }
        console.log('User permissions after derivation:', userData.permissions);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Session check failed:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const derivePermissionsFromRole = (role) => {
    const rolePermissions = {
      'Admin': [
        'VIEW_HOME_PAGE', 'VIEW_BLOGS', 'VIEW_FAQ', 'VIEW_SURVEYS', 'VIEW_RISK_ASSESSMENTS',
        'VIEW_COURSES', 'VIEW_PERSONAL_PROGRESS', 'BOOK_APPOINTMENTS', 'VIEW_PROGRAMS',
        'VIEW_PARTICIPANTS', 'VIEW_REPORTS', 'VIEW_USER_ACTIVITY', 'MANAGE_BLOGS',
        'MANAGE_APPOINTMENTS', 'MANAGE_COURSES', 'MANAGE_PROGRAMS', 'MANAGE_PARTICIPANTS',
        'MANAGE_CONSULTANTS', 'MANAGE_REPORTS', 'MANAGE_USERS', 'MANAGE_FAQ',
        'MANAGE_ORGANIZATIONS', 'MANAGE_RISK_ASSESSMENTS', 'MANAGE_PERSONAL_PROGRESS',
        'MANAGE_SURVEYS', 'ROLE_Admin'
      ],
      'Consultant': [
        'VIEW_HOME_PAGE', 'VIEW_BLOGS', 'VIEW_FAQ', 'VIEW_SURVEYS', 'VIEW_RISK_ASSESSMENTS',
        'VIEW_COURSES', 'VIEW_PERSONAL_PROGRESS', 'BOOK_APPOINTMENTS', 'VIEW_PROGRAMS',
        'VIEW_PARTICIPANTS', 'MANAGE_RISK_ASSESSMENTS', 'MANAGE_APPOINTMENTS', 'ROLE_Consultant'
      ],
      'Member': [
        'VIEW_HOME_PAGE', 'VIEW_BLOGS', 'VIEW_FAQ', 'VIEW_SURVEYS', 'VIEW_RISK_ASSESSMENTS',
        'VIEW_COURSES', 'VIEW_PERSONAL_PROGRESS', 'BOOK_APPOINTMENTS', 'VIEW_PROGRAMS', 'ROLE_Member'
      ],
      'Guest': [
        'VIEW_HOME_PAGE', 'VIEW_BLOGS', 'VIEW_FAQ', 'VIEW_PROGRAMS', 'ROLE_Guest'
      ],
      'Staff': [
        'VIEW_HOME_PAGE', 'VIEW_BLOGS', 'VIEW_FAQ', 'VIEW_SURVEYS', 'VIEW_RISK_ASSESSMENTS',
        'VIEW_COURSES', 'VIEW_PERSONAL_PROGRESS', 'BOOK_APPOINTMENTS', 'VIEW_PROGRAMS',
        'VIEW_PARTICIPANTS', 'MANAGE_RISK_ASSESSMENTS', 'MANAGE_COURSES', 'ROLE_Staff'
      ],
      'Manager': [
        'VIEW_HOME_PAGE', 'VIEW_BLOGS', 'VIEW_FAQ', 'VIEW_SURVEYS', 'VIEW_RISK_ASSESSMENTS',
        'VIEW_COURSES', 'VIEW_PERSONAL_PROGRESS', 'BOOK_APPOINTMENTS', 'VIEW_PROGRAMS',
        'VIEW_PARTICIPANTS', 'VIEW_REPORTS', 'VIEW_USER_ACTIVITY', 'MANAGE_BLOGS',
        'MANAGE_APPOINTMENTS', 'MANAGE_COURSES', 'MANAGE_PROGRAMS', 'MANAGE_PARTICIPANTS',
        'MANAGE_CONSULTANTS', 'MANAGE_REPORTS', 'ROLE_Manager'
      ]
    };
    return rolePermissions[role] || [];
  };

  useEffect(() => {
    if (authChecked.current) return;
    authChecked.current = true;
    checkSession();
  }, []);

  const login = async (usernameOrEmail, password) => {
    try {
      const response = await apiClient.post('/auth/login', { usernameOrEmail, password }, { withCredentials: true });
      console.log('Login response:', response.data);
      const user = response.data;
      if (!user || !user.userId) {
        console.error('Login response missing user data:', response.data);
        toast.error('Đăng nhập thất bại: Backend không trả dữ liệu người dùng hợp lệ.');
        return false;
      }
      if (!user.permissions || user.permissions.length === 0) {
        console.warn('No permissions in login response, deriving from role:', user);
        user.permissions = derivePermissionsFromRole(user.role);
      }
      console.log('User permissions after login:', user.permissions);
      setUser(user);
      setIsAuthenticated(true);
      await checkSession();
      return true;
    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error('Đăng nhập thất bại: ' + (error.response?.data?.message || error.message));
      return false;
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const response = await apiClient.post('/auth/login-google', {
        idToken: credentialResponse.credential
      }, { withCredentials: true });
      const user = response.data;
      console.log('Google login response:', {
        userId: user.userId,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      });
      if (!user || !user.userId) {
        console.error('Google login response missing user data:', response.data);
        toast.error('Đăng nhập Google thất bại: Không có dữ liệu người dùng.');
        return;
      }
      // Kiểm tra role và email để tránh nhầm admin
      if (user.role === 'Admin' || user.email === 'admin1@example.com') { // Thay bằng email admin thực tế
        console.warn('Google login returned admin data, rejecting:', user);
        toast.error('Đăng nhập Google thất bại: Tài khoản không hợp lệ.');
        return;
      }
      // Đảm bảo permissions hợp lệ
      if (!user.permissions || user.permissions.length === 0) {
        console.warn('No permissions in Google login response, deriving from role:', user);
        user.permissions = derivePermissionsFromRole(user.role);
      }
      console.log('Setting user after Google login:', user);
      setUser(user);
      setIsAuthenticated(true);
      toast.success('Đăng nhập Google thành công!');
    } catch (error) {
      console.error('Google login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error('Đăng nhập Google thất bại: ' + (error.response?.data?.message || error.message));
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Đăng xuất thành công.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, handleGoogleLogin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};