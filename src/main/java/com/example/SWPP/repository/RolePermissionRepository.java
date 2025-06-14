package com.example.SWPP.repository;

import com.example.SWPP.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> { // Sửa RolePermissionId thành Long để khớp với rolePermissionId
    // Thêm phương thức để lấy RolePermission theo roleId
    @Query("SELECT rp FROM RolePermission rp WHERE rp.role.roleId = :roleId")
    List<RolePermission> findByRoleId(@Param("roleId") Long roleId);
}