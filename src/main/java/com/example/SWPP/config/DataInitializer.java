package com.example.SWPP.config;

import com.example.SWPP.entity.Role;
import com.example.SWPP.entity.User;
import com.example.SWPP.repository.RoleRepository;
import com.example.SWPP.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository, UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Khởi tạo vai trò Admin nếu chưa tồn tại
        Optional<Role> adminRole = roleRepository.findByRoleName("Admin");
        if (!adminRole.isPresent()) {
            Role newAdminRole = new Role();
            newAdminRole.setRoleName("Admin");
            newAdminRole.setDescription("Quản trị viên hệ thống");
            roleRepository.save(newAdminRole);
        }

        // Khởi tạo người dùng Admin nếu chưa tồn tại
        Optional<User> adminUser = userRepository.findByEmail("admin@example.com");
        if (!adminUser.isPresent()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@example.com");
            admin.setFullName("Admin User");
            admin.setPhone("1234567890");
            admin.setStatus(1);
            admin.setCreatedAt(LocalDateTime.now());
            admin.setUpdatedAt(LocalDateTime.now());
            admin.setPasswordHash(passwordEncoder.encode("adminpass"));
            admin.setLoginType("standard");
            admin.setRole(roleRepository.findByRoleName("Admin").get());
            userRepository.save(admin);
        }
    }
}