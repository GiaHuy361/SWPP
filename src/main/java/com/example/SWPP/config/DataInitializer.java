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

        // Khởi tạo vai trò Member nếu chưa tồn tại
        Optional<Role> memberRole = roleRepository.findByRoleName("Member");
        if (!memberRole.isPresent()) {
            Role newMemberRole = new Role();
            newMemberRole.setRoleName("Member");
            newMemberRole.setDescription("Thành viên đã đăng ký");
            roleRepository.save(newMemberRole);
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
            admin.setPasswordHash(passwordEncoder.encode("adminpass123")); // Mã hóa mật khẩu
            admin.setLoginType("standard");
            admin.setRole(roleRepository.findByRoleName("Admin").get());
            userRepository.save(admin);
        }

        // Khởi tạo người dùng Member nếu chưa tồn tại
        Optional<User> memberUser = userRepository.findByEmail("member@example.com");
        if (!memberUser.isPresent()) {
            User member = new User();
            member.setUsername("member");
            member.setEmail("member@example.com");
            member.setFullName("Member User");
            member.setPhone("0987654321");
            member.setStatus(1);
            member.setCreatedAt(LocalDateTime.now());
            member.setUpdatedAt(LocalDateTime.now());
            member.setPasswordHash(passwordEncoder.encode("memberpass123")); // Mã hóa mật khẩu
            member.setLoginType("standard");
            member.setRole(roleRepository.findByRoleName("Member").get());
            userRepository.save(member);
        }
    }
}
