import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiSave, FiX, FiArrowLeft } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import apiClient from "../utils/axios";
import { toast } from "react-toastify";

function CreateUserPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [userData, setUserData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "Member"
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [availableRoles, setAvailableRoles] = useState([]);
  
  // Kiểm tra nếu người dùng là admin
  useEffect(() => {
    if (!currentUser || currentUser.role !== "Admin") {
      navigate("/dashboard");
    } else {
      fetchRoles();
    }
  }, [currentUser, navigate]);
  
  // Lấy danh sách các vai trò
  const fetchRoles = async () => {
    try {
      const response = await apiClient.get("/admin/roles");
      if (Array.isArray(response.data)) {
        setAvailableRoles(response.data);
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };
  
  const validateForm = () => {
    if (!userData.username.trim()) {
      setError("Tên đăng nhập không được để trống");
      return false;
    }
    
    if (!userData.fullName.trim()) {
      setError("Họ và tên không được để trống");
      return false;
    }
    
    if (!userData.email.trim()) {
      setError("Email không được để trống");
      return false;
    }
    
    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      setError("Email không hợp lệ");
      return false;
    }
    
    if (!userData.password) {
      setError("Mật khẩu không được để trống");
      return false;
    }
    
    if (userData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    
    if (userData.password !== userData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError("");
    setSuccess("");
    
    try {
      // Xác định roleId từ roleName được chọn
      const selectedRole = availableRoles.find(role => role.roleName === userData.role);
      const roleId = selectedRole ? selectedRole.roleId : null;
      
      // Gửi request tạo người dùng
      const response = await apiClient.post("/auth/register", {
        username: userData.username,
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone || "",
        password: userData.password,
      });
      
      if (response.status === 200 || response.status === 201) {
        // Nếu tạo thành công và đã chọn vai trò khác mặc định
        if (roleId && userData.role !== "Member") {
          try {
            // Lấy userId của người dùng vừa tạo
            const usersResponse = await apiClient.get("/auth/users");
            const users = usersResponse.data;
            const newUser = users.find(user => user.email === userData.email);
            
            if (newUser && newUser.userId) {
              // Gán vai trò cho người dùng
              await apiClient.post(`/admin/users/${newUser.userId}/role/${roleId}`);
            }
          } catch (roleErr) {
            console.error("Error assigning role:", roleErr);
          }
        }
        
        setSuccess("Tạo tài khoản thành công!");
        // Reset form
        setUserData({
          username: "",
          fullName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          role: "Member"
        });
        
        // Chuyển hướng sau 2 giây
        setTimeout(() => {
          navigate("/user-management");
        }, 2000);
      }
    } catch (err) {
      console.error("Error creating user:", err);
      setError(err.response?.data?.message || "Tạo tài khoản thất bại");
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Tạo Tài Khoản Người Dùng Mới</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <FiArrowLeft /> Quay lại
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700">
                Tên đăng nhập <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={userData.username}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={userData.fullName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Số điện thoại
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={userData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={userData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
                minLength="6"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={userData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium text-gray-700">
              Vai trò
            </label>
            <select
              id="role"
              name="role"
              value={userData.role}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availableRoles.map((role) => (
                <option key={role.roleId} value={role.roleName}>
                  {role.roleName}
                </option>
              ))}
              {availableRoles.length === 0 && (
                <option value="Member">Member</option>
              )}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 flex items-center gap-2 hover:bg-gray-50"
            >
              <FiX /> Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 ${
                saving ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <FiSave /> {saving ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateUserPage;