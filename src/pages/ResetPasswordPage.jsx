// src/pages/ResetPasswordPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/axios";
import "../TailwindCSS/ResetPasswordPage.css";

function ResetPasswordPage() {
  const [form, setForm] = useState({ email: "", verificationCode: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Basic client-side validation
    if (!form.email || !form.verificationCode || !form.newPassword) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      await apiClient.post("/auth/reset-password", form);
      setMessage("Đặt lại mật khẩu thành công. Đang chuyển hướng...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Đặt lại mật khẩu thất bại.");
      console.error("Password reset error:", err); // Log the error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="reset-form">
        <h2 className="text-2xl font-bold text-center mb-4">Đặt lại mật khẩu</h2>
        {error && <p className="reset-error">{error}</p>}
        {message && <p className="reset-message">{message}</p>}

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="reset-input"
          required
        />
        <input
          name="verificationCode"
          placeholder="Mã xác minh"
          value={form.verificationCode}
          onChange={handleChange}
          className="reset-input"
          required
        />
        <input
          name="newPassword"
          type="password"
          placeholder="Mật khẩu mới"
          value={form.newPassword}
          onChange={handleChange}
          className="reset-input"
          required
        />

        <button type="submit" className="reset-button">
          Đặt lại mật khẩu
        </button>
      </form>
    </div>
  );
}

export default ResetPasswordPage;