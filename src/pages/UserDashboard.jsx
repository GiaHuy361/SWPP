import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "../TailwindCSS/UserDashboard.css";

function UserDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-8">
        <h1 className="text-3xl font-bold mb-4">Bảng điều khiển</h1>
        <p className="mb-6">
          Chào mừng bạn,{" "}
          <span className="font-semibold">
            {user?.fullName || user?.username || "người dùng"}
          </span>
          !
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-100 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Thống kê</h2>
            <p>Tổng số người dùng: {userCount}</p>
            <p>Tổng số bài đăng: {postCount}</p>
          </div>
          <div className="bg-green-100 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Hoạt động gần đây</h2>
            <ul className="list-disc pl-5">
              {activities.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;