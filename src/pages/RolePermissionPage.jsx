import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

function RolePermissionPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/role-permissions' } });
      return;
    }
    if (!user?.permissions?.includes('MANAGE_ROLES')) {
      navigate('/access-denied');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [rolesResponse, permissionsResponse] = await Promise.all([
          apiClient.get('/admin/roles'),
          apiClient.get('/admin/permissions')
        ]);
        setRoles(rolesResponse.data || []);
        setPermissions(permissionsResponse.data || []);
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Không thể tải dữ liệu.';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, user, navigate]);

  const handleSelectRole = (role) => {
    setSelectedRole({ ...role, permissions: role.permissions || [] });
  };

  const handlePermissionToggle = (permissionName) => {
    if (!selectedRole) return;
    const updatedPermissions = selectedRole.permissions.includes(permissionName)
      ? selectedRole.permissions.filter(p => p !== permissionName)
      : [...selectedRole.permissions, permissionName];
    setSelectedRole({ ...selectedRole, permissions: updatedPermissions });
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      await apiClient.put('/admin/role-permissions', {
        roleName: selectedRole.name,
        permissions: selectedRole.permissions
      });
      toast.success('Cập nhật quyền thành công.');
      const rolesResponse = await apiClient.get('/admin/roles');
      setRoles(rolesResponse.data || []);
      setSelectedRole(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Cập nhật quyền thất bại.';
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-blue-800 mb-6">Quản lý vai trò & quyền hạn</h2>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Danh sách vai trò</h3>
            <ul className="space-y-2">
              {roles.map((role) => (
                <li
                  key={role.id}
                  className={`p-3 rounded-md cursor-pointer ${selectedRole?.id === role.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  onClick={() => handleSelectRole(role)}
                >
                  <strong>{role.name}</strong>: {role.description}
                </li>
              ))}
            </ul>
          </div>

          <div>
            {selectedRole ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">Quyền của {selectedRole.name}</h3>
                <div className="space-y-2">
                  {permissions.map((permission) => (
                    <div key={permission.name} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedRole.permissions.includes(permission.name)}
                        onChange={() => handlePermissionToggle(permission.name)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">{permission.name}</label>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleSavePermissions}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Chọn một vai trò để chỉnh sửa quyền</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RolePermissionPage;