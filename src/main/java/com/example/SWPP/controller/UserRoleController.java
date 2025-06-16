package com.example.SWPP.controller;

import com.example.SWPP.dto.CreateRolePermissionRequest;
import com.example.SWPP.dto.CreateRoleRequest;
import com.example.SWPP.dto.UpdateRolePermissionRequest;
import com.example.SWPP.dto.UpdateRoleRequest;
import com.example.SWPP.entity.Role;
import com.example.SWPP.entity.RolePermission;
import com.example.SWPP.repository.RolePermissionRepository;
import com.example.SWPP.repository.RoleRepository;
import com.example.SWPP.service.UserRoleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class UserRoleController {

    private static final Logger logger = LoggerFactory.getLogger(UserRoleController.class);

    private final UserRoleService userRoleService;
    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;

    public UserRoleController(UserRoleService userRoleService, RoleRepository roleRepository,
                              RolePermissionRepository rolePermissionRepository) {
        this.userRoleService = userRoleService;
        this.roleRepository = roleRepository;
        this.rolePermissionRepository = rolePermissionRepository;
    }

    // Read: Lấy vai trò của người dùng
    @PreAuthorize("hasRole('Admin')")
    @GetMapping("/users/{userId}/role")
    public ResponseEntity<?> getUserRole(@PathVariable Long userId) {
        try {
            Role role = userRoleService.getUserRole(userId);
            logger.info("Fetched role for userId={}", userId);
            return ResponseEntity.ok(role != null ? Map.of(
                    "roleId", role.getRoleId(),
                    "roleName", role.getRoleName(),
                    "description", role.getDescription() != null ? role.getDescription() : ""
            ) : Map.of("message", "Người dùng chưa có vai trò"));
        } catch (Exception e) {
            logger.error("Failed to get user role for userId={}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy vai trò"));
        }
    }

    // Update: Gán vai trò cho người dùng
    @PreAuthorize("hasRole('Admin')")
    @PostMapping("/users/{userId}/role/{roleId}")
    public ResponseEntity<?> addRoleToUser(@PathVariable Long userId, @PathVariable Long roleId) {
        try {
            userRoleService.addRoleToUser(userId, roleId);
            logger.info("Role assigned successfully to userId={}", userId);
            return ResponseEntity.ok("Đã gán vai trò cho người dùng thành công");
        } catch (Exception e) {
            logger.error("Failed to assign role to userId={}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Gán vai trò thất bại"));
        }
    }

    // Update: Xóa vai trò khỏi người dùng
    @PreAuthorize("hasRole('Admin')")
    @DeleteMapping("/users/{userId}/role")
    public ResponseEntity<?> removeRoleFromUser(@PathVariable Long userId) {
        try {
            userRoleService.removeRoleFromUser(userId);
            logger.info("Role removed successfully from userId={}", userId);
            return ResponseEntity.ok("Đã thu hồi vai trò khỏi người dùng thành công");
        } catch (Exception e) {
            logger.error("Failed to remove role from userId={}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Thu hồi vai trò thất bại"));
        }
    }

    // Create: Tạo vai trò mới
    @PreAuthorize("hasRole('Admin')")
    @PostMapping("/roles")
    public ResponseEntity<?> createRole(@Valid @RequestBody CreateRoleRequest request, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Create role failed: validation error - {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            Role role = new Role();
            role.setRoleName(request.getRoleName());
            role.setDescription(request.getDescription());
            Role savedRole = userRoleService.createRole(role);
            logger.info("Role created successfully: roleId={}", savedRole.getRoleId());
            return ResponseEntity.ok(Map.of(
                    "roleId", savedRole.getRoleId(),
                    "roleName", savedRole.getRoleName(),
                    "description", savedRole.getDescription() != null ? savedRole.getDescription() : ""
            ));
        } catch (Exception e) {
            logger.error("Failed to create role: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Tạo vai trò thất bại"));
        }
    }

    // Read: Lấy danh sách tất cả vai trò
    @PreAuthorize("hasRole('Admin')")
    @GetMapping("/roles")
    public ResponseEntity<?> getAllRoles() {
        try {
            List<Role> roles = userRoleService.getAllRoles();
            logger.info("Fetched all roles: count={}", roles.size());
            List<Map<String, Object>> roleList = roles.stream().map(role -> {
                Map<String, Object> roleMap = new java.util.HashMap<>();
                roleMap.put("roleId", role.getRoleId());
                roleMap.put("roleName", role.getRoleName());
                roleMap.put("description", role.getDescription() != null ? role.getDescription() : "");
                return roleMap;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(roleList);
        } catch (Exception e) {
            logger.error("Failed to fetch all roles: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy danh sách vai trò thất bại"));
        }
    }

    // Update: Cập nhật vai trò
    @PreAuthorize("hasRole('Admin')")
    @PutMapping("/roles/{roleId}")
    public ResponseEntity<?> updateRole(@PathVariable Long roleId, @Valid @RequestBody UpdateRoleRequest request, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Update role failed: validation error - {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            Role updatedRole = userRoleService.updateRole(roleId, request.getRoleName(), request.getDescription());
            logger.info("Role updated successfully: roleId={}", updatedRole.getRoleId());
            return ResponseEntity.ok(Map.of(
                    "roleId", updatedRole.getRoleId(),
                    "roleName", updatedRole.getRoleName(),
                    "description", updatedRole.getDescription() != null ? updatedRole.getDescription() : ""
            ));
        } catch (Exception e) {
            logger.error("Failed to update role roleId={}: {}", roleId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Cập nhật vai trò thất bại"));
        }
    }

    // Delete: Xóa vai trò
    @PreAuthorize("hasRole('Admin')")
    @DeleteMapping("/roles/{roleId}")
    public ResponseEntity<?> deleteRole(@PathVariable Long roleId) {
        try {
            userRoleService.deleteRole(roleId);
            logger.info("Role deleted successfully: roleId={}", roleId);
            return ResponseEntity.ok("Xóa vai trò thành công");
        } catch (Exception e) {
            logger.error("Failed to delete role roleId={}: {}", roleId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Xóa vai trò thất bại"));
        }
    }

    // Create: Tạo quyền cho vai trò
    @PreAuthorize("hasRole('Admin')")
    @PostMapping("/roles/{roleId}/permissions")
    public ResponseEntity<?> createRolePermission(@PathVariable Long roleId, @Valid @RequestBody CreateRolePermissionRequest request, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Create permission failed: validation error - {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            RolePermission rolePermission = new RolePermission();
            rolePermission.setPermissionName(request.getPermissionName());
            rolePermission.setDescription(request.getDescription());
            RolePermission savedPermission = userRoleService.createRolePermission(roleId, rolePermission);
            logger.info("Permission created successfully: rolePermissionId={}", savedPermission.getRolePermissionId());
            return ResponseEntity.ok(Map.of(
                    "rolePermissionId", savedPermission.getRolePermissionId(),
                    "permissionName", savedPermission.getPermissionName(),
                    "description", savedPermission.getDescription() != null ? savedPermission.getDescription() : ""
            ));
        } catch (Exception e) {
            logger.error("Failed to create permission for roleId={}: {}", roleId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Tạo quyền thất bại"));
        }
    }

    // Read: Lấy danh sách quyền của vai trò
    @PreAuthorize("hasRole('Admin')")
    @GetMapping("/roles/{roleId}/permissions")
    public ResponseEntity<?> getRolePermissions(@PathVariable Long roleId) {
        try {
            List<RolePermission> permissions = userRoleService.getRolePermissions(roleId);
            logger.info("Fetched permissions for roleId={}: count={}", roleId, permissions.size());
            List<Map<String, Object>> permissionList = permissions.stream().map(permission -> {
                Map<String, Object> permissionMap = new java.util.HashMap<>();
                permissionMap.put("rolePermissionId", permission.getRolePermissionId());
                permissionMap.put("permissionName", permission.getPermissionName());
                permissionMap.put("description", permission.getDescription() != null ? permission.getDescription() : "");
                return permissionMap;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(permissionList);
        } catch (Exception e) {
            logger.error("Failed to fetch permissions for roleId={}: {}", roleId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lấy danh sách quyền thất bại"));
        }
    }

    // Update: Cập nhật quyền
    @PreAuthorize("hasRole('Admin')")
    @PutMapping("/roles/{roleId}/permissions/{permissionId}")
    public ResponseEntity<?> updateRolePermission(@PathVariable Long roleId, @PathVariable Long permissionId, @Valid @RequestBody UpdateRolePermissionRequest request, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            String errorMsg = bindingResult.getFieldError().getDefaultMessage();
            logger.warn("Update permission failed: validation error - {}", errorMsg);
            return ResponseEntity.badRequest().body(Map.of("message", errorMsg));
        }
        try {
            RolePermission updatedPermission = userRoleService.updateRolePermission(roleId, permissionId, request.getPermissionName(), request.getDescription());
            logger.info("Permission updated successfully: rolePermissionId={}", updatedPermission.getRolePermissionId());
            return ResponseEntity.ok(Map.of(
                    "rolePermissionId", updatedPermission.getRolePermissionId(),
                    "permissionName", updatedPermission.getPermissionName(),
                    "description", updatedPermission.getDescription() != null ? updatedPermission.getDescription() : ""
            ));
        } catch (Exception e) {
            logger.error("Failed to update permission roleId={}, permissionId={}: {}", roleId, permissionId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Cập nhật quyền thất bại"));
        }
    }

    // Delete: Xóa quyền
    @PreAuthorize("hasRole('Admin')")
    @DeleteMapping("/roles/{roleId}/permissions/{permissionId}")
    public ResponseEntity<?> deleteRolePermission(@PathVariable Long roleId, @PathVariable Long permissionId) {
        try {
            userRoleService.deleteRolePermission(roleId, permissionId);
            logger.info("Permission deleted successfully: roleId={}, permissionId={}", roleId, permissionId);
            return ResponseEntity.ok("Xóa quyền thành công");
        } catch (Exception e) {
            logger.error("Failed to delete permission roleId={}, permissionId={}: {}", roleId, permissionId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Xóa quyền thất bại"));
        }
    }

    // Read: Lấy danh sách quyền theo tên vai trò
    @GetMapping("/role-permissions")
    public ResponseEntity<?> getPermissionsByRole(@RequestParam String role) {
        try {
            Role roleEntity = roleRepository.findByRoleName(role)
                    .orElseThrow(() -> new RuntimeException("Role not found: " + role));
            List<RolePermission> permissions = rolePermissionRepository.findByRoleId(roleEntity.getRoleId());
            List<String> permissionNames = permissions.stream()
                    .map(RolePermission::getPermissionName)
                    .collect(Collectors.toList());
            logger.info("Fetched permissions for role={}: count={}", role, permissionNames.size());
            return ResponseEntity.ok(permissionNames);
        } catch (Exception e) {
            logger.error("Failed to fetch permissions for role={}: {}", role, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy quyền cho vai trò: " + role));
        }
    }
}