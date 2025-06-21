// src/pages/RolePermissionPage.jsx
import React, { useEffect, useState } from "react";
import apiClient from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import "../TailwindCSS/RolePermissionPage.css";

function RolePermissionPage() {
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await apiClient.get("/admin/roles");
        setRoles(res.data || []);
      } catch (err) {
        setError("Không thể tải danh sách vai trò");
      }
    };
    fetchRoles();
  }, []);

  return (
    <div className="role-container">
      <div className="role-card">
        <h2 className="role-title">Quản lý vai trò & quyền hạn</h2>
        {error && <p className="role-error">{error}</p>}
        <ul className="role-list">
          {roles.map((role) => (
            <li key={role.id} className="role-item">
              <strong>{role.name}</strong>: {role.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default RolePermissionPage;
