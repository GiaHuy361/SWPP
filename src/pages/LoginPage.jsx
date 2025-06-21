import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import "../TailwindCSS/LoginPage.css";

function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail, password }),
        credentials: "include",
      });

      if (response.ok) {
        const res = await fetch("http://localhost:8080/api/auth/user", {
          credentials: "include",
        });
        const userData = await res.json();
        setUser(userData);
        navigate("/");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError("Lỗi kết nối server: " + err.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/login-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
        credentials: "include",
      });

      if (response.ok) {
        const res = await fetch("http://localhost:8080/api/auth/user", {
          credentials: "include",
        });
        const userData = await res.json();
        setUser(userData);
        navigate("/");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Đăng nhập Google thất bại.");
      }
    } catch (error) {
      setError("Lỗi kết nối server: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    setError("Đăng nhập Google thất bại.");
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Tên đăng nhập</label>
            <input
              type="text"
              placeholder="Email hoặc tên đăng nhập"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium">Mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
        <div className="text-center mt-2">
          <a href="/forgot-password" className="text-blue-600 hover:underline text-sm">
            Quên mật khẩu?
          </a>
        </div>
        <div className="login-divider">hoặc</div>
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
            useOneTap
          />
        </div>
        <p className="mt-4 text-center text-sm">
          Chưa có tài khoản?{" "}
          <a href="/register" className="text-blue-500 hover:underline">
            Đăng ký
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;