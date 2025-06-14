package com.example.SWPP.repository;

import com.example.SWPP.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.Set;

public interface RoleRepository extends JpaRepository<Role, Long> { // Sửa Integer thành Long để khớp với roleId
    Optional<Role> findByRoleName(String roleName);
    Set<Role> findByRoleNameIn(Set<String> roleNames);
}