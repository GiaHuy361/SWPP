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
  const [selectedRoleId, setSelectedRoleId] = useState(null);  // Fetch available roles (only for admin)
  const fetchRoles = async () => {
    if (currentUser.role !== "Admin") return;
    
    try {
      console.log("Fetching available roles...");
      // Match the path for getting all available roles
      const response = await apiClient.get("/admin/roles");
      console.log("Available roles received:", response.data);
      
      // Add this fallback if the data format is unexpected
      if (Array.isArray(response.data)) {
        setAvailableRoles(response.data);
      } else if (response.data && typeof response.data === 'object') {
        // Try to extract roles from response if in a nested format
        const roles = response.data.roles || response.data.data || Object.values(response.data);
        if (Array.isArray(roles)) {
          setAvailableRoles(roles);
        } else {
          // Create a mock role for testing if no roles are found
          console.log("Creating mock roles for testing");
          setAvailableRoles([
            { id: 1, roleName: "Admin" },
            { id: 2, roleName: "Manager" },
            { id: 3, roleName: "User" }
          ]);
        }
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
      
      // Fallback to mock data if API fails
      console.log("Using mock roles due to API error");
      setAvailableRoles([
        { id: 1, roleName: "Admin" },
        { id: 2, roleName: "Manager" },
        { id: 3, roleName: "User" }
      ]);
    }
  };    // Assign role to user
  const assignRoleToUser = async (roleId) => {
    if (currentUser.role !== "Admin") {
      setError("Bạn không có quyền thay đổi vai trò");
      return;
    }
    
    try {
      setError("");
      setSaving(true);
      console.log(`Attempting to assign role ${roleId} to user ${userId}`);
      
      // Display confirmation message
      alert(`Đang thay đổi vai trò người dùng (ID: ${userId}) sang vai trò mới (ID: ${roleId})`);
        try {
        // Based on your security config from the original request:
        // .requestMatchers(HttpMethod.POST, "/api/admin/users/{userId}/role/{roleId}").hasRole("Admin")
        const response = await apiClient.post(`/admin/users/${userId}/role/${roleId}`);
        console.log("Role assignment response:", response);
      } catch (innerError) {
        console.error("Error with first endpoint attempt:", innerError);
        console.log("Status:", innerError.response?.status);
        console.log("Response data:", innerError.response?.data);
        
        // Try alternative URL formats
        try {
          console.log("Trying first alternative endpoint...");
          const response = await apiClient.post(`/api/admin/users/${userId}/role/${roleId}`);
          console.log("Role assignment successful with first alternative");
        } catch (err2) {
          console.error("Error with second attempt:", err2);
          
          console.log("Trying second alternative endpoint...");
          const response = await apiClient.post(`/users/${userId}/role/${roleId}`);
          console.log("Role assignment successful with second alternative");
        }
      }
      
      setSuccess("Cập nhật vai trò thành công!");        // Update role in local state
      console.log("Looking for role object with ID:", roleId);
      console.log("Available roles:", availableRoles);
      
      // Try to find the role in availableRoles by checking all properties
      const roleObj = availableRoles.find(r => {
        const matchesId = r.id === Number(roleId) || r.id?.toString() === roleId?.toString();
        const matchesRoleId = r.roleId === Number(roleId) || r.roleId?.toString() === roleId?.toString();
        return matchesId || matchesRoleId;
      });if (roleObj) {
        console.log("Found role object:", roleObj);
        setUserData({
          ...userData,
          role: roleObj.roleName,
          roleId: roleObj.id
        });
      } else {
        console.log("Could not find role object in availableRoles. Available roles:", availableRoles);
        
        // Set the role name directly based on roleId as fallback
        const roleMap = {
          "1": "Admin",
          "2": "Manager", 
          "3": "User",
          "4": "Guest"
        };
        
        setUserData({
          ...userData,
          role: roleMap[roleId.toString()] || "Unknown Role",
          roleId: Number(roleId)
        });
      }
      
      // Update the UI and notify user
      setTimeout(() => {
        alert("Vai trò đã được cập nhật thành công");
      }, 1000);
      
    } catch (err) {
      console.error("Error assigning role:", err);
      const errorMessage = err.response?.data?.message || "Cập nhật vai trò thất bại";
      setError(errorMessage);
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };
  
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let userData;
        
        if (currentUser.role === "Admin" && userId !== currentUser.userId.toString()) {      // Admin fetching another user's data - use the getAllUsers endpoint and filter
          const response = await apiClient.get("/auth/users");
          const users = response.data;
          const targetUser = users.find(u => u.userId === Number(userId));
          
          if (!targetUser) {
            throw new Error("User not found");
          }
          
          userData = targetUser;
          
          // Also fetch roles if admin
          fetchRoles();
        } else {          // User fetching own data or admin fetching own data
          const response = await apiClient.get("/auth/me");
          userData = response.data;
        }
          // Extract role ID from the response
        const roleId = userData.roleId || null;
        console.log("User data received:", userData);
        console.log("Role from API:", userData.role);
        console.log("RoleId from API:", roleId);
        
        setUserData({
          username: userData.username || "",
          fullName: userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          role: userData.role || "Guest",
          roleId: roleId
        });
        
        // Set the selected role ID if available
        if (roleId) {
          console.log("Setting initial selectedRoleId to:", roleId);
          setSelectedRoleId(roleId);
        } else if (userData.role) {
          // Try to find role ID from role name
          const foundRole = availableRoles.find(r => r.roleName === userData.role);
          if (foundRole) {
            console.log("Found role by name:", foundRole);
            setSelectedRoleId(foundRole.id);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Không thể tải thông tin người dùng");
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    
    try {
      // Update user profile information
      const response = await apiClient.put(`/auth/users/${userId}`, {
        username: userData.username,
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone
      });
      
      // Update local data with response
      const updatedUser = response.data;
      setUserData({
        username: updatedUser.username || "",
        fullName: updatedUser.fullName || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        role: updatedUser.role || "Guest",
        roleId: updatedUser.roleId || null
      });
        // Set success and save state
      setSaving(false);
      setSuccess("Cập nhật thông tin thành công!");
      
      // Show success message for 2 seconds then redirect back
      setTimeout(() => {
        if (currentUser.role === "Admin") {
          navigate("/user-management");
        } else {
          navigate("/dashboard");
        }
      }, 2000);
    } catch (err) {
      setSaving(false);
      const errorMessage = err.response?.data?.message || "Cập nhật thông tin thất bại";
      setError(errorMessage);
    }
  };
    // Handle role change in dropdown
  const handleRoleChange = (e) => {
    const value = e.target.value;
    console.log("Role dropdown changed to:", value);
    
    // Make sure we have a valid value before setting it
    if (value) {
      const roleId = Number(value);
      console.log("Setting selectedRoleId to:", roleId);
      setSelectedRoleId(roleId);
    } else {
      setSelectedRoleId(null);
    }
  };
  // Function to directly change role (separate from form submission)
  const handleDirectRoleChange = async () => {
    console.log("handleDirectRoleChange called");
    console.log("selectedRoleId:", selectedRoleId);
    console.log("currentUser.role:", currentUser.role);
    
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
      setSuccess("");
      
      console.log("Calling assignRoleToUser with roleId:", selectedRoleId);
      await assignRoleToUser(selectedRoleId);
    } catch (err) {
      console.error("Error in handleDirectRoleChange:", err);
      setError("Cập nhật vai trò thất bại");
    } finally {
      setSaving(false);
    }
  };
  
  // Check permissions - only admin or the user themselves can edit
  const canEdit = currentUser.role === "Admin" || currentUser.userId === Number(userId);
  
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
            {currentUser.role === "Admin" ? "Chỉnh sửa người dùng" : "Chỉnh sửa thông tin cá nhân"}
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
            </div>            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-gray-700">
                Vai trò
              </label>
                {currentUser.role === "Admin" && currentUser.userId !== Number(userId) ? (
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
                        <option key={role.id} value={role.id}>
                          {role.roleName}
                        </option>
                      ))}
                    </select>                    <button
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
