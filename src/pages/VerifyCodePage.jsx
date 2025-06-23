// src/pages/VerifyCodePage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/axios";
import "../TailwindCSS/VerifyCodePage.css";

function VerifyCodePage() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiClient.post("/auth/verify-code", { code });
      setMessage("Xác thực thành công, vui lòng đặt lại mật khẩu.");
      setTimeout(() => {
        navigate("/reset-password"); // Redirect to reset password page
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Xác thực thất bại");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="verify-form">
        <h2 className="text-2xl font-bold text-center mb-4">Xác minh mã OTP</h2>
        {error && <p className="verify-error">{error}</p>}
        {message && <p className="verify-message">{message}</p>}
        <input
          type="text"
          placeholder="Nhập mã OTP"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="verify-input"
          required
        />
        <button type="submit" className="verify-button">
          Xác minh
        </button>
      </form>
    </div>
  );
}

export default VerifyCodePage;
