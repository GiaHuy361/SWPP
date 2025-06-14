package com.example.SWPP.service;

import com.example.SWPP.entity.Role;
import com.example.SWPP.entity.RolePermission;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.RolePermissionRepository;
import com.example.SWPP.repository.RoleRepository;
import com.example.SWPP.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserRoleService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;

    public UserRoleService(UserRepository userRepository, RoleRepository roleRepository, RolePermissionRepository rolePermissionRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.rolePermissionRepository = rolePermissionRepository;
    }

    public Role getUserRole(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        return user.getRole();
    }

    public void addRoleToUser(Long userId, Long roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role không tồn tại"));
        if (user.getRole() == null || !user.getRole().equals(role)) {
            user.setRole(role);
            userRepository.save(user);
        }
    }

    public void removeRoleFromUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        if (user.getRole() != null) {
            user.setRole(null);
            userRepository.save(user);
        }
    }

    public Role createRole(Role role) {
        if (roleRepository.findByRoleName(role.getRoleName()).isPresent()) {
            throw new RuntimeException("Vai trò đã tồn tại");
        }
        return roleRepository.save(role);
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public Role updateRole(Long roleId, String roleName, String description) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role không tồn tại"));
        if (roleName != null && !roleName.equals(role.getRoleName()) &&
                roleRepository.findByRoleName(roleName).isPresent()) {
            throw new RuntimeException("Tên vai trò đã được sử dụng");
        }
        if (roleName != null) role.setRoleName(roleName);
        if (description != null) role.setDescription(description);
        return roleRepository.save(role);
    }

    public void deleteRole(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role không tồn tại"));
        if (userRepository.findAll().stream().anyMatch(user -> user.getRole() != null && user.getRole().getRoleId().equals(roleId))) {
            throw new RuntimeException("Không thể xóa vai trò đang được sử dụng");
        }
        roleRepository.delete(role);
    }

    public RolePermission createRolePermission(Long roleId, RolePermission rolePermission) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role không tồn tại"));
        rolePermission.setRole(role);
        if (rolePermissionRepository.findById(rolePermission.getRolePermissionId()).isPresent()) {
            throw new RuntimeException("Quyền đã tồn tại");
        }
        return rolePermissionRepository.save(rolePermission);
    }

    public List<RolePermission> getRolePermissions(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role không tồn tại"));
        return rolePermissionRepository.findByRoleId(role.getRoleId());
    }

    public RolePermission updateRolePermission(Long roleId, Long permissionId, String permissionName, String description) {
        RolePermission permission = rolePermissionRepository.findById(permissionId)
                .orElseThrow(() -> new RuntimeException("Quyền không tồn tại"));
        if (permission.getRole().getRoleId().equals(roleId)) {
            if (permissionName != null) permission.setPermissionName(permissionName);
            if (description != null) permission.setDescription(description);
            return rolePermissionRepository.save(permission);
        }
        throw new RuntimeException("Quyền không thuộc vai trò này");
    }

    public void deleteRolePermission(Long roleId, Long permissionId) {
        RolePermission permission = rolePermissionRepository.findById(permissionId)
                .orElseThrow(() -> new RuntimeException("Quyền không tồn tại"));
        if (permission.getRole().getRoleId().equals(roleId)) {
            rolePermissionRepository.delete(permission);
        } else {
            throw new RuntimeException("Quyền không thuộc vai trò này");
        }
    }
}