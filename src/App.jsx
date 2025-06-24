import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CreateUserPage from './pages/CreateUserPage';
import Profile from './pages/Profile';
import SurveyDetail from './pages/SurveyDetail';
import BookAppointment from './pages/BookAppointment';
import ManageAppointments from './pages/ManageAppointments';
import AppointmentDetail from './pages/AppointmentDetail';
import EditUserPage from './pages/EditUserPage';
import Surveys from './pages/Surveys';
import SurveyResults from './pages/SurveyResults';
import UserManagement from './pages/UserManagement';
import RolePermissionPage from './pages/RolePermissionPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyCodePage from './pages/VerifyCodePage';
import UserDashboard from './pages/UserDashboard';
import AccessDenied from './pages/AccessDenied';
import NotFoundPage from './pages/NotFoundPage';
import ContactPage from './pages/ContactPage';
import MyAppointments from './pages/MyAppointments';

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow pt-16">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-code" element={<VerifyCodePage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/user-dashboard" element={<UserDashboard />} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/surveys" element={<PrivateRoute requiredPermission="VIEW_SURVEYS"><Surveys /></PrivateRoute>} />
              <Route path="/surveys/:id" element={<PrivateRoute requiredPermission="VIEW_SURVEYS"><SurveyDetail /></PrivateRoute>} />
              <Route path="/survey-results" element={<PrivateRoute requiredPermission="VIEW_SURVEYS"><SurveyResults /></PrivateRoute>} />
              <Route path="/survey-results/:id" element={<PrivateRoute requiredPermission="VIEW_SURVEYS"><SurveyResults /></PrivateRoute>} />
              <Route path="/book-appointment" element={<PrivateRoute requiredPermission="BOOK_APPOINTMENTS"><BookAppointment /></PrivateRoute>} />
              <Route path="/my-appointments" element={<PrivateRoute requiredPermission="BOOK_APPOINTMENTS"><MyAppointments /></PrivateRoute>} />
              <Route path="/appointments/:id" element={<PrivateRoute requiredPermission={['BOOK_APPOINTMENTS', 'MANAGE_APPOINTMENTS']}><AppointmentDetail /></PrivateRoute>} />
              <Route path="/manage-appointments" element={<PrivateRoute requiredPermission="MANAGE_APPOINTMENTS"><ManageAppointments /></PrivateRoute>} />
              <Route path="/user-management" element={<PrivateRoute requiredPermission="MANAGE_USERS"><UserManagement /></PrivateRoute>} />
              <Route path="/create-user" element={<PrivateRoute requiredPermission="MANAGE_USERS"><CreateUserPage /></PrivateRoute>} />
              <Route path="/edit-user/:id" element={<PrivateRoute requiredPermission="MANAGE_USERS"><EditUserPage /></PrivateRoute>} />
              <Route path="/role-permissions" element={<PrivateRoute requiredPermission="MANAGE_ROLES"><RolePermissionPage /></PrivateRoute>} />
              <Route path="/access-denied" element={<AccessDenied />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer position="top-right" autoClose={5000} />
        </div>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;