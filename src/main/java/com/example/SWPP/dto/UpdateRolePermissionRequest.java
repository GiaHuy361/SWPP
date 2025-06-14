package com.example.SWPP.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateRolePermissionRequest {
    @NotBlank(message = "Tên quyền không được để trống")
    @Size(min = 2, max = 50, message = "Tên quyền phải từ 2 đến 50 ký tự")
    private String permissionName;

    private String description;

    public String getPermissionName() { return permissionName; }
    public void setPermissionName(String permissionName) { this.permissionName = permissionName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}