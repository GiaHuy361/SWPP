import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Loại bỏ BrowserRouter import
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import các component với tên file chính xác
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CreateUserPage from './pages/CreateUserPage'; // Thay thế Register
import Profile from './pages/Profile';
import SurveyDetail from './pages/SurveyDetail';
import BookAppointment from './pages/BookAppointment';
import ManageAppointments from './pages/ManageAppointments';
import AppointmentDetail from './pages/AppointmentDetail';
import EditUserPage from './pages/EditUserPage';
import Surveys from './pages/Surveys'; // Thêm import Surveys component

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/register" element={<CreateUserPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/surveys" element={<Surveys />} /> {/* Thêm route cho trang danh sách khảo sát */}
          <Route path="/surveys/:id" element={<SurveyDetail />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
          <Route path="/appointments" element={<ManageAppointments />} />
          <Route path="/appointments/:id" element={<AppointmentDetail />} />
          <Route path="/edit-user/:id" element={<EditUserPage />} />
          <Route path="*" element={<HomePage />} /> {/* Fallback route */}
        </Routes>
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}

export default App;
