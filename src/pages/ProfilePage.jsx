import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/axios";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.get("/auth/user");
        setUser(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tải thông tin cá nhân");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Thông tin cá nhân</h2>
        <div className="space-y-3 mb-6">
          <div><span className="font-semibold">Họ tên:</span> {user.fullName}</div>
          <div><span className="font-semibold">Email:</span> {user.email}</div>
          <div><span className="font-semibold">Tên đăng nhập:</span> {user.username}</div>
          <div><span className="font-semibold">Số điện thoại:</span> {user.phone}</div>
          <div><span className="font-semibold">Vai trò:</span> {user.role}</div>
        </div>
        <button
          onClick={() => navigate(`/edit-user/${user.userId}`)}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Chỉnh sửa thông tin
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
