import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/responsive.css';
import './styles/reset.css';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
// Kiểm tra và điều chỉnh import cho CreateUserPage và EditUserPage
import CreateUserPage from './pages/CreateUserPage'; // Đảm bảo file tồn tại
import EditUserPage from './pages/EditUserPage';    // Đảm bảo file tồn tại
import Profile from './pages/Profile';
import SurveyDetail from './pages/SurveyDetail';
import BookAppointment from './pages/BookAppointment';
import ManageAppointments from './pages/ManageAppointments';
import AppointmentDetail from './pages/AppointmentDetail';
import Surveys from './pages/Surveys';
import SurveyResults from './pages/SurveyResults';
import UserManagement from './pages/UserManagement';
import RolePermissionPage from './pages/RolePermissionPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyCodePage from './pages/VerifyCodePage';

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
import SurveyManagement from './pages/SurveyManagement';
import SurveyTypeManagement from './pages/SurveyTypeManagement';
import SurveyListManagement from './pages/SurveyListManagement';
import SurveyQuestionManagement from './pages/SurveyQuestionManagement';
import SurveyOptionManagement from './pages/SurveyOptionManagement';

// Communication Program Management
import {
  CommunicationPrograms,
  CommunicationProgramDetail,
  CommunicationFeedback,
  CommunicationFeedbackForm,
  CommunicationFeedbackList,
  CommunicationFeedbackDetail,
  CommunicationDashboard,
  CommunicationProgramForm,
  CommunicationFeedbackManagement
} from './pages/communication';

// Admin Communication Components
import CommunicationProgramList from './pages/admin/communication/CommunicationProgramList';
import AdminCommunicationProgramDetail from './pages/admin/communication/CommunicationProgramDetail';

// Course Components from second version
import ModuleCreateForm from './pages/courses/ModuleCreateForm';
import ModuleEditForm from './pages/courses/ModuleEditForm';
import LessonCreateForm from './pages/courses/LessonCreateForm';
import LessonEditForm from './pages/courses/LessonEditForm';
import QuizAttemptPage from './pages/QuizAttemptPage';

// Blog and Notification Components
import NotificationsPage from './pages/NotificationsPage';
import NotificationManagement from './pages/NotificationManagement';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import BlogManagementPage from './pages/BlogManagementPage';
import BlogFormPage from './pages/BlogFormPage';
import CategoryManagementPage from './pages/CategoryManagementPage';

// Consultant Management Components
import ConsultantManagement from './pages/admin/ConsultantManagement';
import CreateConsultant from './pages/admin/CreateConsultant';
import EditConsultant from './pages/admin/EditConsultant';

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <div className="flex flex-col min-h-screen m-0 p-0" style={{ margin: 0, padding: 0 }}>
          <Header />
          <main className="flex-grow" style={{ marginTop: 0, paddingTop: 0 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-code" element={<VerifyCodePage />} />
              <Route path="/contact" element={<ContactPage />} />
             
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
              <Route path="/notifications" element={<PrivateRoute requiredPermission="VIEW_NOTIFICATIONS"><NotificationsPage /></PrivateRoute>} />
              <Route path="/notifications/manage" element={<PrivateRoute requiredPermission={['SEND_NOTIFICATION', 'MANAGE_NOTIFICATIONS']}><NotificationManagement /></PrivateRoute>} />
              <Route path="/courses" element={<PrivateRoute requiredPermission="VIEW_COURSES"><CourseListPage /></PrivateRoute>} />
              <Route path="/courses/:courseId/enroll" element={<PrivateRoute requiredPermission="ENROLL_COURSES"><EnrollCoursePage /></PrivateRoute>} />
              <Route path="/courses/enroll" element={<PrivateRoute requiredPermission="ENROLL_COURSES"><EnrollCourseListPage /></PrivateRoute>} />
              <Route path="/courses/:courseId/quizzes/:quizId" element={<PrivateRoute requiredPermission="VIEW_COURSES"><QuizAttemptPage /></PrivateRoute>} />
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
              <Route path="/admin/courses/:courseId/modules/create" element={<PrivateRoute requiredPermission={["ROLE_Admin", "ROLE_Staff", "ROLE_Manager"]}><ModuleCreateForm /></PrivateRoute>} />
              <Route path="/admin/courses/:courseId/modules/:moduleId/edit" element={<PrivateRoute requiredPermission={["ROLE_Admin", "ROLE_Staff", "ROLE_Manager"]}><ModuleEditForm /></PrivateRoute>} />
              <Route path="/admin/courses/:courseId/modules/:moduleId/lessons/create" element={<PrivateRoute requiredPermission={["ROLE_Admin", "ROLE_Staff", "ROLE_Manager"]}><LessonCreateForm /></PrivateRoute>} />
              <Route path="/admin/courses/:courseId/modules/:moduleId/lessons/:lessonId/edit" element={<PrivateRoute requiredPermission={["ROLE_Admin", "ROLE_Staff", "ROLE_Manager"]}><LessonEditForm /></PrivateRoute>} />
              <Route path="/admin/courses/:courseId/students" element={<PrivateRoute requiredPermission={["ROLE_Admin", "ROLE_Staff", "ROLE_Manager"]}><StudentManagement /></PrivateRoute>} />
              <Route path="/admin/courses/:courseId/certificates" element={<PrivateRoute requiredPermission={["ROLE_Admin", "ROLE_Staff", "ROLE_Manager"]}><CertificateManagement /></PrivateRoute>} />
              
              {/* Communication Program Management Routes */}
              <Route path="/communication" element={<Navigate to="/communication/programs" replace />} />
              <Route path="/communication/programs" element={<PrivateRoute requiredPermission="VIEW_PROGRAMS"><CommunicationPrograms /></PrivateRoute>} />
              <Route path="/communication/programs/:id" element={<PrivateRoute requiredPermission="VIEW_PROGRAMS"><CommunicationProgramDetail /></PrivateRoute>} />
              <Route path="/communication/programs/:id/feedback/create" element={<PrivateRoute requiredPermission="VIEW_PROGRAMS"><CommunicationFeedbackForm /></PrivateRoute>} />
              <Route path="/communication/programs/:id/feedback" element={<PrivateRoute requiredPermission="VIEW_PROGRAMS"><CommunicationFeedback /></PrivateRoute>} />
              <Route path="/communication/feedback" element={<PrivateRoute requiredPermission="VIEW_PROGRAMS"><CommunicationFeedbackList /></PrivateRoute>} />
              <Route path="/communication/feedback/:id" element={<PrivateRoute requiredPermission="VIEW_PROGRAMS"><CommunicationFeedbackDetail /></PrivateRoute>} />
              
              {/* Admin Communication Routes */}
              <Route path="/admin/communication/programs" element={<PrivateRoute requiredPermission="MANAGE_PROGRAMS"><CommunicationProgramList /></PrivateRoute>} />
              <Route path="/admin/communication/programs/:id" element={<PrivateRoute requiredPermission="MANAGE_PROGRAMS"><AdminCommunicationProgramDetail /></PrivateRoute>} />
              <Route path="/admin/communication/programs/create" element={<PrivateRoute requiredPermission="MANAGE_PROGRAMS"><CommunicationProgramForm /></PrivateRoute>} />
              <Route path="/admin/communication/programs/:id/edit" element={<PrivateRoute requiredPermission="MANAGE_PROGRAMS"><CommunicationProgramForm /></PrivateRoute>} />
              <Route path="/admin/communication/feedback" element={<PrivateRoute requiredPermission="MANAGE_PROGRAMS"><CommunicationFeedbackManagement /></PrivateRoute>} />
              <Route path="/admin/communication/feedback/:id" element={<PrivateRoute requiredPermission="VIEW_PROGRAMS"><CommunicationFeedback /></PrivateRoute>} />
              <Route path="/admin/communication/feedback/:id/edit" element={<PrivateRoute requiredPermission="MANAGE_PROGRAMS"><CommunicationFeedback /></PrivateRoute>} />
              
              {/* Survey Management Routes */}
              <Route path="/surveys/manage" element={<PrivateRoute requiredPermission="MANAGE_SURVEYS"><SurveyManagement /></PrivateRoute>} />
              <Route path="/surveys/manage/types" element={<PrivateRoute requiredPermission="MANAGE_SURVEYS"><SurveyTypeManagement /></PrivateRoute>} />
              <Route path="/surveys/manage/list" element={<PrivateRoute requiredPermission="MANAGE_SURVEYS"><SurveyListManagement /></PrivateRoute>} />
              <Route path="/surveys/manage/questions" element={<PrivateRoute requiredPermission="MANAGE_SURVEYS"><SurveyQuestionManagement /></PrivateRoute>} />
              <Route path="/surveys/manage/options" element={<PrivateRoute requiredPermission="MANAGE_SURVEYS"><SurveyOptionManagement /></PrivateRoute>} />
              
              {/* Blog Routes */}
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/blog/manage" element={<PrivateRoute requiredPermission="MANAGE_BLOGS"><BlogManagementPage /></PrivateRoute>} />
              <Route path="/blog/create" element={<PrivateRoute requiredPermission="MANAGE_BLOGS"><BlogFormPage /></PrivateRoute>} />
              <Route path="/blog/edit/:id" element={<PrivateRoute requiredPermission="MANAGE_BLOGS"><BlogFormPage /></PrivateRoute>} />
              <Route path="/categories/manage" element={<PrivateRoute requiredPermission="MANAGE_CATEGORIES"><CategoryManagementPage /></PrivateRoute>} />
              
              {/* Consultant Management Routes */}
              <Route path="/admin/consultant-management" element={<PrivateRoute requiredPermission="MANAGE_CONSULTANTS"><ConsultantManagement /></PrivateRoute>} />
              <Route path="/admin/create-consultant" element={<PrivateRoute requiredPermission="MANAGE_CONSULTANTS"><CreateConsultant /></PrivateRoute>} />
              <Route path="/admin/edit-consultant/:id" element={<EditConsultant />} />
              
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