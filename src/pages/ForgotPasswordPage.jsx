// src/pages/ForgotPasswordPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/axios";
import "../TailwindCSS/ForgotPasswordPage.css";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await apiClient.post("/auth/forgot-password", { email });
      setMessage("Đã gửi mã xác minh về email, vui lòng kiểm tra hộp thư.");
      setTimeout(() => {
        navigate("/verify-code", { state: { email } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Gửi email thất bại");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="forgot-form">
        <h2 className="text-2xl font-bold text-center mb-4">Quên mật khẩu</h2>
        {error && <p className="forgot-error">{error}</p>}
        {message && <p className="forgot-message">{message}</p>}
        <input
          type="email"
          placeholder="Nhập email đã đăng ký"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="forgot-input"
          required
        />
        <button type="submit" className="forgot-button">
          Gửi email đặt lại mật khẩu
        </button>
      </form>
    </div>
  );
}

export default ForgotPasswordPage;
