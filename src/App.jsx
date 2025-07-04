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
import EnrollCoursePage from './pages/courses/EnrollCoursePage';
import CoursePage from './pages/courses/CoursePage';
import CourseListPage from './pages/courses/CourseListPage';
import EnrollCourseListPage from './pages/courses/EnrollCourseListPage';
import MyCoursesPage from './pages/courses/MyCoursesPage';
import CertificatePage from './pages/courses/CertificatePage';
// Admin Course Management
import CourseManagement from './pages/admin/CourseManagement';
import CourseDetail from './pages/admin/CourseDetail';
import CourseForm from './pages/admin/CourseForm';
import ModuleManagement from './pages/admin/ModuleManagement';
import LessonManagement from './pages/admin/LessonManagement';
import QuizManagement from './pages/admin/QuizManagement';
import StudentManagement from './pages/admin/StudentManagement';
import CertificateManagement from './pages/admin/CertificateManagement';
import AdminDashboard from './pages/admin/AdminDashboard';
import RegisterPage from './pages/RegisterPage';

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
              <Route path="/courses" element={<PrivateRoute requiredPermission="VIEW_COURSES"><CourseListPage /></PrivateRoute>} />
              <Route path="/courses/:courseId/enroll" element={<PrivateRoute requiredPermission="ENROLL_COURSES"><EnrollCoursePage /></PrivateRoute>} />
              <Route path="/courses/enroll" element={<PrivateRoute requiredPermission="ENROLL_COURSES"><EnrollCourseListPage /></PrivateRoute>} />
              <Route path="/courses/:courseId/*" element={<PrivateRoute requiredPermission="VIEW_COURSES"><CoursePage /></PrivateRoute>} />
              <Route path="/my-courses" element={<PrivateRoute requiredPermission="VIEW_COURSES"><MyCoursesPage /></PrivateRoute>} />
              <Route path="/certificate/:courseId" element={<CertificatePage />} />
              
              {/* Admin Course Management Routes */}
              <Route path="/admin" element={<PrivateRoute requiredPermission={["ROLE_Admin", "ROLE_Staff", "ROLE_Manager"]}><AdminDashboard /></PrivateRoute>} />
              <Route path="/admin/dashboard" element={<PrivateRoute requiredPermission={["ROLE_Admin", "ROLE_Staff", "ROLE_Manager"]}><AdminDashboard /></PrivateRoute>} />
              <Route path="/admin/courses" element={<PrivateRoute requiredPermission={["ROLE_Admin", "ROLE_Staff", "ROLE_Manager"]}><CourseManagement /></PrivateRoute>} />
              <Route path="/admin/courses/create" element={<PrivateRoute requiredPermission={["ROLE_Admin", "ROLE_Staff", "ROLE_Manager"]}><CourseForm /></PrivateRoute>} />
              <Route path="/admin/courses/:courseId" element={<PrivateRoute requiredPermission={["ROLE_Admin", "ROLE_Staff", "ROLE_Manager"]}><CourseDetail /></PrivateRoute>} />
              <Route path="/admin/courses/:courseId/edit" element={<PrivateRoute requiredPermission={["ROLE_Admin", "ROLE_Staff", "ROLE_Manager"]}><CourseForm /></PrivateRoute>} />
              <Route path="/admin/courses/:courseId/modules" element={<PrivateRoute requiredPermission={["ROLE_Admin", "ROLE_Staff", "ROLE_Manager"]}><ModuleManagement /></PrivateRoute>} />
              <Route path="/admin/courses/:courseId/modules/:moduleId/lessons" element={<PrivateRoute requiredPermission={["ROLE_Admin", "ROLE_Staff", "ROLE_Manager"]}><LessonManagement /></PrivateRoute>} />
              <Route path="/admin/courses/:courseId/modules/:moduleId/lessons/:lessonId/quizzes" element={<PrivateRoute requiredPermission={["ROLE_Admin", "ROLE_Staff", "ROLE_Manager"]}><QuizManagement /></PrivateRoute>} />
              <Route path="/admin/courses/:courseId/students" element={<PrivateRoute requiredPermission={["ROLE_Admin", "ROLE_Staff", "ROLE_Manager"]}><StudentManagement /></PrivateRoute>} />
              <Route path="/admin/courses/:courseId/certificates" element={<PrivateRoute requiredPermission={["ROLE_Admin", "ROLE_Staff", "ROLE_Manager"]}><CertificateManagement /></PrivateRoute>} />
              
              <Route path="/access-denied" element={<AccessDenied />} />
              <Route path="/register" element={<RegisterPage />} />
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