import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiSave, FiX, FiArrowLeft } from "react-icons/fi";
import apiClient from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import "../TailwindCSS/EditUserPage.css";

function EditUserPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [userData, setUserData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    role: "",
    roleId: null
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  
  // Fetch available roles (only for admin)
  const fetchRoles = async () => {
    if (currentUser.role !== "Admin") return;
    
    try {
      console.log("Fetching available roles...");
      // Sửa đường dẫn API, bỏ /api/ ở đầu
      const response = await apiClient.get("/admin/roles");
      console.log("Available roles received:", response.data);
      
      if (Array.isArray(response.data)) {
        setAvailableRoles(response.data);
      } else {
        console.error("Unexpected response format for roles:", response.data);
        setAvailableRoles([]);
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
      setAvailableRoles([]);
    }
  };
  
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError("");

        if (!currentUser || !currentUser.userId) {
          throw new Error("Bạn cần đăng nhập để thực hiện chức năng này");
        }

        // Kiểm tra quyền chỉnh sửa
        const canEdit = currentUser.role === "Admin" || currentUser.userId === parseInt(userId);
        if (!canEdit) {
          throw new Error("Bạn không có quyền chỉnh sửa thông tin người dùng này");
        }

        // Trực tiếp lấy thông tin người dùng theo userId (cho Admin)
        let userData = null;
        if (currentUser.role === "Admin" && currentUser.userId !== parseInt(userId)) {
          try {
            // Admin lấy thông tin người dùng khác - SỬA ĐƯỜNG DẪN API
            const response = await apiClient.get(`/auth/users`);
            const allUsers = response.data;
            const targetUser = allUsers.find(user => user.userId === parseInt(userId));
            
            if (!targetUser) {
              throw new Error("Không tìm thấy người dùng với ID này");
            }
            
            userData = targetUser;
          } catch (err) {
            console.error("Error fetching user as admin:", err);
            throw new Error("Không thể tải thông tin người dùng");
          }
        } else {
          // Người dùng lấy thông tin của chính họ - SỬA ĐƯỜNG DẪN API
          try {
            const response = await apiClient.get("/auth/user");
            userData = response.data;
          } catch (err) {
            console.error("Error fetching current user:", err);
            throw new Error("Không thể tải thông tin người dùng");
          }
        }

        console.log("User data received:", userData);
        setUserData({
          username: userData.username || "",
          fullName: userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          role: userData.role || "Guest",
          roleId: userData.userId
        });
        
        // Nếu là admin thì tải thông tin về các vai trò
        if (currentUser.role === "Admin") {
          await fetchRoles();
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error in fetchUserData:", err);
        setError(err.message || "Không thể tải thông tin người dùng");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, currentUser]);

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };
  
  // Function to directly change role (separate from form submission)
  const handleDirectRoleChange = async () => {
    if (!selectedRoleId) {
      alert("Vui lòng chọn vai trò trước khi thay đổi");
      return;
    }
    
    if (currentUser.role !== "Admin") {
      alert("Bạn không có quyền thay đổi vai trò");
      return;
    }
    
    try {
      setSaving(true);
      setError("");
      
      // Sửa đường dẫn API
      await apiClient.post(`/admin/users/${userId}/role/${selectedRoleId}`);
      
      // Tìm role name từ available roles
      const roleObj = availableRoles.find(r => r.roleId === selectedRoleId);
      
      // Cập nhật UI
      setUserData({
        ...userData,
        role: roleObj ? roleObj.roleName : "Unknown Role"
      });
      
      setSuccess("Cập nhật vai trò thành công!");
    } catch (err) {
      console.error("Error changing role:", err);
      setError("Cập nhật vai trò thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    
    try {
      // Sửa đường dẫn API
      const response = await apiClient.put(`/auth/users/${userId}`, {
        username: userData.username,
        fullName: userData.fullName,
        phone: userData.phone
        // Email không thể thay đổi nên không gửi lên
      });
      
      setSuccess("Cập nhật thông tin thành công!");
      
      // Hiển thị thông báo thành công trong 2 giây rồi chuyển hướng
      setTimeout(() => {
        if (currentUser.role === "Admin" && currentUser.userId !== parseInt(userId)) {
          navigate("/user-management");
        } else {
          navigate("/dashboard");
        }
      }, 2000);
    } catch (err) {
      console.error("Error updating user:", err);
      const errorMessage = err.response?.data?.message || "Cập nhật thông tin thất bại";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };
  
  // Handle role change in dropdown
  const handleRoleChange = (e) => {
    const value = e.target.value;
    console.log("Role dropdown changed to:", value);
    
    if (value) {
      setSelectedRoleId(parseInt(value));
    } else {
      setSelectedRoleId(null);
    }
  };
  
  // Check permissions - only admin or the user themselves can edit
  const canEdit = currentUser?.role === "Admin" || currentUser?.userId === parseInt(userId);
  
  if (!canEdit) {
    return (
      <div className="pt-24 max-w-2xl mx-auto px-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p className="font-medium">Bạn không có quyền chỉnh sửa thông tin người dùng này.</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center gap-2 text-blue-600 hover:underline"
        >
          <FiArrowLeft /> Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {currentUser.role === "Admin" && currentUser.userId !== parseInt(userId) 
              ? "Chỉnh sửa người dùng" 
              : "Chỉnh sửa thông tin cá nhân"}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <FiArrowLeft /> Quay lại
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 edit-user-form">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={userData.username}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Họ và tên
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

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  disabled
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
            </div>
            
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-gray-700">
                Vai trò
              </label>
              {currentUser.role === "Admin" && currentUser.userId !== parseInt(userId) ? (
                <>
                  <div className="flex gap-2">
                    <select
                      id="role"
                      value={selectedRoleId || ""}
                      onChange={handleRoleChange}
                      className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Chọn vai trò</option>
                      {availableRoles.map(role => (
                        <option key={role.roleId} value={role.roleId}>
                          {role.roleName}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleDirectRoleChange}
                      disabled={!selectedRoleId || saving}
                      className={`px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-1 ${
                        !selectedRoleId || saving ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Đổi vai trò
                    </button>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    * Bạn có thể thay đổi vai trò người dùng này
                  </p>
                </>
              ): (
                <input
                  type="text"
                  id="role"
                  value={userData.role}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50"
                  disabled
                />
              )}
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
                <FiSave /> {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EditUserPage;
